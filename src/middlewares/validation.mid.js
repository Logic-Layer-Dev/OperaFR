const multer = require('multer');
const defaultResponse = require('../utils/defaultResponse');

//-- Module for handling file size limit
module.exports = function(err, req, res, next) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json(defaultResponse(400, `File size exceeds the limit of ${process.env.MAX_FILE_SIZE}MB`, null));
    }

    next(err);
}