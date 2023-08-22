const FileController = require('../controller/file.controller')
const authJwt = require('../middlewares/auth.mid')
const UploadMiddleware = require('../middlewares/multer.mid')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    //-- list files
    app.get('/files', [authJwt], asyncHandler(FileController.getFile), [validationMid])

    //-- Upload file
    app.post('/files', 
        [authJwt],
        UploadMiddleware.single('file'), //middleware to upload file
        asyncHandler(FileController.postFile), //middleware to handle request
        [validationMid] //middleware to handle code 500
    )

    //-- Delete file
    app.delete('/files', [authJwt], asyncHandler(FileController.deleteFile), [validationMid])

    //-- Create public url
    app.post('/files/public_url', [authJwt], asyncHandler(FileController.createPublicUrl), [validationMid])

    //-- Delete public url
    app.delete('/files/public_url', [authJwt], asyncHandler(FileController.deletePublicUrl), [validationMid])

    //-- Render file
    app.get('/files/:hash', asyncHandler(FileController.getByUrl), [validationMid])

}