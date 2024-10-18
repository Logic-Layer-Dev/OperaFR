const AuthService = require('../services/auth.services')

class authController {
    async login(req, res) {
        const login = await AuthService.login(req)
        return res.status(login.status).json(login)
    }

    async deleteFolderPermission(req, res) {
        const folderPermissionDeleted = await AuthService.deleteFolderPermission(req)
        return res.status(folderPermissionDeleted.status).json(folderPermissionDeleted)
    }

    async giveFolderPermission(req, res) {
        const folderPermissionGiven = await AuthService.giveFolderPermission(req)
        return res.status(folderPermissionGiven.status).json(folderPermissionGiven)
    }

    async generateApiToken (req, res) {
        const apiToken = await AuthService.generateApiToken(req)
        return res.status(apiToken.status).json(apiToken)
    }
}

module.exports = new authController()