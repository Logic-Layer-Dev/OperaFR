const multer = require('multer');
const defaultResponse = require('../utils/defaultResponse');
const logger = require('../../config/logger.config');

//-- Module for handling file size limit
module.exports = function(err, req, res, next) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json(defaultResponse(400, `File size exceeds the limit of ${process.env.MAX_FILE_SIZE}MB`, null));
    }
    
    //-- If is error 500, return a default response
    logger.error(`An error occurred while trying to use de route. Check the logs. [Path: ${req.originalUrl}]: ${err}`);
    return res.status(500).json(defaultResponse(500, `An error occurred while trying to use de route. Check the logs. [Path: ${req.originalUrl}]: ${err}`, null))
}