const authController = require('../controller/auth.controller')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    app.post('/login', asyncHandler(authController.login), [validationMid])
}