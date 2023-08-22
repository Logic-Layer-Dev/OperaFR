const folderController = require('../controller/folder.controller')
const authJwt = require('../middlewares/auth.mid')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    app.post('/folders', [authJwt], asyncHandler(folderController.insertFolder), [validationMid])
    app.delete('/folders', [authJwt], asyncHandler(folderController.deleteFolder), [validationMid])
}