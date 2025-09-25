Health Risk Profiler API
Overview

The Health Risk Profiler is a backend service that analyzes lifestyle survey responses (JSON or scanned images) and generates a structured health risk profile.

The service performs the following steps:

OCR/Text Parsing – Extracts answers from JSON input or image (via Tesseract.js).

Factor Extraction – Identifies risk factors based on the answers.

Risk Scoring & Classification – Computes a risk score and assigns a risk level.

Recommendations – Generates actionable, non-diagnostic guidance.

Route
GET /api/health-risk/profiler

Description: Accepts either JSON data or an image file and returns a full health risk profile.

Input:

JSON: { "age": 42, "smoker": true, "exercise": "rarely", "diet": "high sugar" }

Image: Upload an image of a survey with key-value pairs (e.g., Age: 42)

Output (JSON):

{
  "answer": {
    "age": 65,
    "smoker": true,
    "exercise": "rarely",
    "diet": "high sugar"
  },
  "missingFields": [],
  "confidence": 1,
  "factors": ["smoking", "low exercise", "poor diet", "old age"],
  "risk_level": "High Risk",
  "score": 120,
  "rationale": ["smoking", "low activity", "high sugar diet", "old age"],
  "recommendations": ["Quit Smoking", "Walk 30 mins daily", "Reduce sugar", "Regular health check-ups"],
  "status": "ok"
}


Guardrail / Incomplete Profile:
If more than 50% of fields are missing, the API returns:

{
  "status": "incomplete Profile",
  "reason": "More than 50% fields missing"
}

Implementation Details
1. JSON Input Handling

Extracts answers from the request body.

Handles missing fields and calculates a confidence score.

2. Image/OCR Input Handling

Uses Tesseract.js to extract text from uploaded image.

Splits text into key-value pairs.

Normalizes keys and handles minor typos using a mapping table.

Converts boolean and numeric fields as required.

3. Factor Extraction

Identifies risk factors such as:

Smoking

Low exercise

Poor diet

Age-related risk

Adds rationale and recommendations corresponding to each factor.

4. Scoring and Risk Level

Each factor contributes points to a total score:

Smoking: 40

Low exercise: 25

Poor diet: 35

Age > 60: 15

Risk Level thresholds:

0–39: Low Risk

40–69: Moderate Risk

70+: High Risk

5. Recommendations

Generated based on identified factors, e.g.:

Quit Smoking

Walk 30 mins daily

Reduce sugar intake

Regular health check-ups

Assumptions

OCR input is expected in key:value format per line.

Minor typos in keys are handled via normalization.

Boolean fields (smoker) can be "true"/"false" or "yes"/"no".

Age is numeric; non-numeric values are ignored.

Missing fields are handled with missingFields and confidence score.

Example Usage
JSON Request
curl -X GET http://localhost:3000/api/health-risk/profiler \
-H "Content-Type: application/json" \
-d '{
  "age": 65,
  "smoker": true,
  "exercise": "rarely",
  "diet": "high sugar"
}'

Image Upload Request
curl -X GET http://localhost:3000/api/health-risk/profiler \
-F "file=@survey.jpg"

Project Structure
project/
│
├─ routes/
│   └─ healthRisk.js      # parsedData route
├─ controllers/
│   └─ healthRiskController.js
├─ utils/
│   └─ ocrParser.js       # Tesseract.js OCR and normalization
│   └─ factorHandler.js   # Score, risk, rationale, recommendations
├─ package.json
├─ README.md
└─ ...

Tech Stack

Node.js, Express.js

Tesseract.js (OCR)

JSON-based API