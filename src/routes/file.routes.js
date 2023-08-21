const FileController = require('../controller/file.controller')
const UploadMiddleware = require('../middlewares/multer.mid')

module.exports = function(app) {
    app.get('/files', FileController.getFile)
    app.post('/files', UploadMiddleware.single('file'), FileController.postFile)
}