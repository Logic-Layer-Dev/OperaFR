const userController = require('../controllers/user.controller')
const authMid = require('../middlewares/auth.mid')
const validationMid = require('../middlewares/validation.mid')
const asyncHandler = require('../utils/asyncHandler')

module.exports = function(app) {
    app.get('/users', [authMid], asyncHandler(userController.getUsers))
    app.post('/users', [authMid], asyncHandler(userController.createUser), [validationMid])
    app.put('/users', [authMid], asyncHandler(userController.editUser), [validationMid])
}