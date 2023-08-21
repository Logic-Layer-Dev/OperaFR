const FileController = require('../controller/file.controller')
const UploadMiddleware = require('../middlewares/multer.mid')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    app.get('/files', asyncHandler(FileController.getFile), [validationMid])
    app.post('/files', UploadMiddleware.single('file'), asyncHandler(FileController.postFile), [validationMid])
}