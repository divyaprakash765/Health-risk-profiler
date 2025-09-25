import express from 'express';
import { parsedData } from '../controller/health-risk-controller.js';
import multer from "multer";

const storage = multer.diskStorage({
    destination : function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename : function (req, file, cb) {
        const suffix = Date.now() + '-' + Math.round(Math.random()*1E9);
        cb(null, file.originalname + '-' + suffix);
    }
})

const upload = multer({storage : storage});

const router = express.Router();

router.route("/profiler").get(upload.single('image'),parsedData);


export default router;