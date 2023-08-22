const defaultResponse = require("../utils/defaultResponse");
const prisma = require("../../config/prisma.config");
const checkFolderPermission = require("../utils/checkFolderPermission");
const fs = require('fs')
const path = require('path')

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

    async deleteFolder(req, res) {
        let { folder_id } = req.body

        if(!folder_id) return res.status(400).json(defaultResponse(400, 'Folder id is required', null))

        const folder = await prisma.folder.findFirst({
            where: {
                id: folder_id
            }
        })

        if(!folder) return res.status(400).json(defaultResponse(400, 'Folder not found', null))
        if(!checkFolderPermission(req.id, folder_id)) return res.status(401).json(defaultResponse(401, 'Unauthorized', null))

        await prisma.folderPermission.deleteMany({
            where: {
                folderId: folder_id
            }
        })

        let files_to_delete = await prisma.file.findMany({
            where: {
                folderId: folder_id
            }
        })

        await prisma.file.deleteMany({
            where: {
                folderId: folder_id
            }
        })

        if(files_to_delete.length > 0){
            files_to_delete.forEach(file => {
                if(file.path){
                    fs.unlink(path.join(__dirname, '..', '..', 'uploads', file.path), (err) => {
                        if (err) {
                            console.error(`[DELETE FILE: ${file.name}] ${err}]`)
                            return
                        }
                    })
                } 
            })
        }

        const delete_folder = await prisma.folder.delete({
            where: {
                id: folder_id
            }
        })

        return res.status(200).json(defaultResponse(200, 'Folder deleted successfully', delete_folder))
    }
}

module.exports = new FolderController()