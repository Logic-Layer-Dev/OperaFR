const userController = require('../controller/user.controller')
const authMid = require('../middlewares/auth.mid')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    app.post('/users', [authMid], asyncHandler(userController.createUser), [validationMid])
}