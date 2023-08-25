const authController = require('../controllers/auth.controller')
const authMid = require('../middlewares/auth.mid')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    app.post('/login', asyncHandler(authController.login), [validationMid])
    app.post('/folders_permission', [authMid], asyncHandler(authController.giveFolderPermission), [validationMid])
    app.delete('/folders_permission', [authMid], asyncHandler(authController.deleteFolderPermission), [validationMid])
    app.post('/generate_token', [authMid], asyncHandler(authController.generateApiToken), [validationMid])
}