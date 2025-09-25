import fs from 'fs';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import { TesseractWorker } from 'tesseract.js';

const worker = new TesseractWorker();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, req.file);
  }
});

const upload = multer({ storage: storage }).single('image');

