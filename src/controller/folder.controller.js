const defaultResponse = require("../utils/defaultResponse");
const prisma = require("../../config/prisma.config");

class FolderController {
    async insertFolder(req, res) {
        let {
            name,
            parent_id = null
        } = req.body
        
        if(!name) return res.status(400).json(defaultResponse(400, 'Name is required', null))

        let data = {
            name:name,
            parentFolderId: parent_id ? parent_id : null
        }

        if(!data.parentFolderId){
            delete data.parentFolderId
        }

        const exist_folder = await prisma.folder.findFirst({
            where: {
                AND:[{
                    name: data.name,
                    parentFolderId: data.parentFolderId ? data.parentFolderId : null
                }]
            }
        })

        if(exist_folder) return res.status(400).json(defaultResponse(400, 'Folder already exist in this folder', null))

        const folder = await prisma.folder.create({
            data 
        })

        return res.status(201).json(defaultResponse(201, 'Folder created', folder))
    }
}

module.exports = new FolderController()