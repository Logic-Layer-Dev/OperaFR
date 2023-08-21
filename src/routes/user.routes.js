const userController = require('../controller/user.controller')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    app.post('/users', asyncHandler(userController.createUser), [validationMid])
}