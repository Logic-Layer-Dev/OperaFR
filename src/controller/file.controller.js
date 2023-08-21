const defaultResponse = require("../utils/defaultResponse");
const prisma = require("../../config/prisma.config");
const path = require('path')

class FileController {
    async getFile(req, res) {
        let {
            file_id = null,
            file_name = null,
            folder_id = null,
            render = false
        } = req.query

        if(!file_id && !file_name && !folder_id) return res.status(400).json(defaultResponse(400, `file_id, file_name or folder_id is required`, null))

        if(folder_id && file_name) {
            let file = await prisma.file.findFirst({
                where: {
                    AND:[{
                        name: file_name,
                        folderId: parseInt(folder_id)
                    }]
                }
            })

            if(!file) return res.status(404).json(defaultResponse(404, `File not found`, null))

            if(render){
                const file_path = path.join(__dirname, '..', '..', 'uploads', file.path)

                return res.sendFile(file_path)
            } else {
                return res.status(200).json(defaultResponse(200, `File found`, file))
            }
        }

        if(file_id) {
            let file = await prisma.file.findFirst({
                where: {
                    id: parseInt(file_id)
                }
            })

            if(!file) return res.status(404).json(defaultResponse(404, `File not found`, null))

            if(render){
                const file_path = path.join(__dirname, '..', '..', 'uploads', file.path)

                return res.sendFile(file_path)
            } else {
                return res.status(200).json(defaultResponse(200, `File found`, file))
            }
        }

        if(folder_id){
            let files = await prisma.file.findMany({
                where: {
                    folderId: parseInt(folder_id)
                }
            })

            if(!files) return res.status(404).json(defaultResponse(404, `Files not found`, null))

            if(render){
                const file_path = path.join(__dirname, '..', '..', 'uploads', file.path)

                return res.sendFile(file_path)
            } else {
                return res.status(200).json(defaultResponse(200, `File found`, file))
            }
        }

        return res.status(400).json(defaultResponse(400, `You need to use file_name and folder_id when searching by file_name`, null))
    }

    async getByUrl(req, res) {
        let hash = req.params.hash

        let file = await prisma.file.findFirst({
            where: {
                public_url: hash
            }
        })

        if(!file) return res.status(404).json(defaultResponse(404, `File not found`, null))

        const file_path = path.join(__dirname, '..', '..', 'uploads', file.path)
        return res.sendFile(file_path)
    }

    async postFile(req, res) {
        let originalName = req.file.originalname
        let filename = req.file.filename
        let logic_path = req.body.folder_id

        if(!filename) return res.status(400).json(defaultResponse(400, `File is required`, null))
        if(!logic_path) return res.status(400).json(defaultResponse(400, `Folder is required`, null))

        let same_name_exists = await prisma.file.findFirst({
            where: {
                AND:[{
                    name: originalName,
                    folderId: parseInt(logic_path)
                }]
            }
        })

        if(same_name_exists) {
            let current_extension = originalName.split('.').pop()
            let file_name = originalName.split('.').slice(0, -1).join('.')
            originalName = `${file_name}-${Date.now()}.${current_extension}`
        }

        let file_insert = await prisma.file.create({
            data: {
                name: originalName,
                path: filename,
                folderId: parseInt(logic_path)
            }
        })

        return res.status(200).json(defaultResponse(200, `File uploaded successfully`, file_insert))
    }
}

module.exports = new FileController()