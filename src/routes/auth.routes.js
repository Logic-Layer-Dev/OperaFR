const authController = require('../controller/auth.controller')
const authMid = require('../middlewares/auth.mid')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    app.post('/login', asyncHandler(authController.login), [validationMid])
    app.post('/folders_permission', [authMid], asyncHandler(authController.giveFolderPermission), [validationMid])
}