import Tesseract from "tesseract.js";

/**
 * Calculate risk factors, rationale, recommendations, and total score
 * @param {Object} answer - Parsed survey answers
 * @param {Array} rationale - Explanations for the risk factors
 * @param {Array} recommendations - Actionable guidance for each factor
 * @param {Array} factors - List of identified risk factors
 * @returns {Number} total risk score
 */
const handleFactors = (answer, rationale, recommendations, factors) => {
    let score = 0;

    // Factor: Smoking
    if (answer?.smoker) {
        factors.push("smoking");
        rationale.push("smoking");
        recommendations.push("Quit Smoking");
        score += 40;
    }

    // Factor: Low exercise
    if (answer?.exercise === "rarely" || answer?.exercise === "never") {
        factors.push("low exercise");
        rationale.push("low activity");
        recommendations.push("Walk 30 mins daily");
        score += 25;
    }

    // Factor: Poor diet
    if (answer?.diet === "high sugar") {
        factors.push("poor diet");
        rationale.push("high sugar diet");
        recommendations.push("Reduce sugar");
        score += 35;
    }

    // Return total score
    return score;
};

/**
 * Handle parsed survey data, compute risk profile, and send response
 * @param {Object} data - Survey answers (JSON or OCR parsed)
 * @param {Object} res - Express response object
 */
function handleData(data, res) {
    const missingFields = [];       // Track missing fields
    const answer = {};              // Store cleaned answers
    let confidence = 1;             // Confidence in data completeness
    const factors = [];             // Identified risk factors
    const rationale = [];           // Explanations for each factor
    const recommendations = [];    // Actionable guidance

    // Parse age
    if (data.age) {
        answer.age = parseInt(data.age);
    } else {
        missingFields.push("age");
    }

    // Parse smoker (boolean)
    if (data.smoker != undefined) {
        answer.smoker = (data.smoker === true) || (data.smoker === "true");
    } else {
        missingFields.push("smoker");
    }

    // Parse exercise frequency
    if (data.exercise) {
        answer.exercise = data.exercise;
    } else {
        missingFields.push("exercise");
    }

    // Parse diet type
    if (data.diet) {
        answer.diet = data.diet;
    } else {
        missingFields.push("diet");
    }

    // Guardrail: If more than 50% fields missing, return error
    if (missingFields.length >= 2) {
        return res.status(400).json({
            status: "incomplete Profile",
            reason: "More than 50% fields missing",
        });
    }

    // Calculate confidence score based on number of missing fields
    confidence = (4 - missingFields.length) / 4;

    // Calculate risk score and identify factors
    const score = handleFactors(answer, rationale, recommendations, factors);

    // Determine risk level based on score
    let riskLevel = "";
    if (score < 40) riskLevel = "Low Risk";
    else if (score < 70) riskLevel = "Moderate Risk";
    else riskLevel = "High Risk";

    // Send response with full health profile
    return res.status(200).json({
        answer: answer,
        missingFields: missingFields,
        confidence: confidence,
        factors: factors,
        risk_level: riskLevel,
        score: score,
        rationale: rationale,
        recommendations: recommendations,
        status: "ok"
    });
}

/**
 * Handle JSON input from client
 */
const handleJson = async (req, res) => {
    handleData(req.body, res);
};

/**
 * Handle image input from client using Tesseract OCR
 */
const handleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        const parseData = {}; // Object to store parsed key-value pairs from OCR

        // Perform OCR using Tesseract.js
        const { data: { text } } = await Tesseract.recognize(req.file.path, "eng");

        // Split text into lines and filter empty lines
        const result = text.split("\n").filter((line) => line.trim() !== "");

        // Convert each line into key-value pair
        result.forEach((r) => {
            const [rawKey, rawValue] = r.split(":");
            if (!rawKey || !rawValue) return;

            // Normalize keys and values
            const key = rawKey.toLowerCase().trim();
            const value = rawValue.toLowerCase().trim();

            parseData[key] = value;
        });

        // Pass parsed data to handler
        handleData(parseData, res);
    } catch (error) {
        return res.status(500).json({
            message: "Error processing image",
            error: error.message,
        });
    }
};

/**
 * Main route handler
 * Determines if input is JSON or image and calls appropriate handler
 */
export const parsedData = async (req, res) => {
    if (req.file) {
        handleImage(req, res);
    } else {
        handleJson(req, res);
    }
};
