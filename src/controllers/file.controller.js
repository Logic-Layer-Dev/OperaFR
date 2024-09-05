const FileService = require("../services/file.services");

class FileController {
    async deleteFile(req, res) {
        const fileDeleted = await FileService.deleteFile(req)
        return res.status(fileDeleted.status).json(fileDeleted)
    }

    async getFile(req, res) {
        const fileSearched = await FileService.getFile(req)
        if(req.query.render && typeof fileSearched === 'string') return res.sendFile(fileSearched)            
        return res.status(fileSearched.status).json(fileSearched)
    }

    async getByUrl(req, res) {
        let filePath = await FileService.getFileByUrl(req)
        if(typeof filePath === 'object') return res.status(filePath.status).json(filePath)
        return res.sendFile(filePath)
    }

    async postFile(req, res) {
        const fileUploaded = await FileService.uploadFile(req)
        return res.status(fileUploaded.status).json(fileUploaded)
    }

    async createPublicUrl(req, res) {
        const fileUpdated = await FileService.createPublicUrl(req)
        return res.status(fileUpdated.status).json(fileUpdated)
    }

    async deletePublicUrl(req, res) {
        const fileUpdated = await FileService.deletePublicUrl(req)
        return res.status(fileUpdated.status).json(fileUpdated)
    }
}

module.exports = new FileController()