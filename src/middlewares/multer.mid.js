require('dotenv').config();

const multer = require('multer');
const path = require('path');
const maxSize = process.env.MAX_FILE_SIZE * 1024 * 1024 || 1024 * 1024; // Default 1MB

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}${ext}`);
    }
});

module.exports = multer({ 
    storage,
    limits: { fileSize: maxSize }
});