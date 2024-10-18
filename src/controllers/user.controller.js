const UserService = require('../services/user.services')

class UserController {
    async createUser(req, res) {
        const user = await UserService.createUser(req)
        return res.status(user.status).json(user)
    }

    async getUsers(req, res) {
        const users = await UserService.getUsers(req)
        return res.status(users.status).json(users)
    }

    async editUser(req, res) {
        const user = await UserService.editUser(req)
        return res.status(user.status).json(user)
    }
}

module.exports = new UserController()