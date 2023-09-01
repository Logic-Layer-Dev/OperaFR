const FileController = require('../controllers/file.controller')
const authJwt = require('../middlewares/auth.mid')
const UploadMiddleware = require('../middlewares/multer.mid')
const octetMid = require('../middlewares/octet.mid')
const send_authMid = require('../middlewares/send_auth.mid')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    //-- list files
    app.get('/files', [authJwt], asyncHandler(FileController.getFile), [validationMid])

    //-- Upload file
    app.post('/files', 
        [authJwt],
        [send_authMid], //middleware to handle sender ip
        [octetMid], //middleware to handle octet-stream
        UploadMiddleware.single('file'), //middleware to upload file by form-data
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