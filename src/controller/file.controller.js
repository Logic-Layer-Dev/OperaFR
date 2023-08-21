const defaultResponse = require("../utils/defaultResponse");

class FileController {
    async getFile(req, res) {
        return res.status(200).json(defaultResponse(200, `Test`, null))
    }

    async postFile(req, res) {
        // let filename = req.file.filename
        return res.status(200).json(defaultResponse(200, `File uploaded successfully`, null))
    }
}

module.exports = new FileController()