const FolderService = require('../services/folder.services')

class FolderController {
    async getFolders(req, res) {
        const folders = await FolderService.getFolders(req)
        return res.status(folders.status).json(folders)
    }

    async insertFolder(req, res) {
        const folder = await FolderService.insertFolder(req)
        return res.status(folder.status).json(folder)
    }

    async deleteFolder(req, res) {
        const folder = await FolderService.deleteFolder(req)
        return res.status(folder.status).json(folder)
    }

    async renameFolder(req, res) {
        const folder = await FolderService.renameFolder(req)
        return res.status(folder.status).json(folder)
    }
}

module.exports = new FolderController()