const defaultResponse = require("../utils/defaultResponse");
const prisma = require("../../config/prisma.config");
const checkFolderPermission = require("../utils/checkFolderPermission");
const fs = require('fs')
const path = require('path');
const createLog = require("../utils/createLog");

class FolderController {
    async getFolders(req, res) {
        let {
            folder_id = null,
            folder_name = null,
            parent_id = null
        } = req.query

        if(!folder_id && !folder_name && !parent_id) {
            let all_folders = await prisma.folder.findMany()

            return res.status(200).json(defaultResponse(200, 'Folder(s) found', all_folders))
        }

        let where_data = {
            id: folder_id ? parseInt(folder_id) : undefined,
            name: folder_name ? folder_name : undefined,
            parentFolderId: parent_id ? parent_id == 'root' ?  null : parseInt(parent_id) : undefined
        }

        let folders = await prisma.folder.findMany({
            where: {
                AND:[where_data]
            }
        })

        if(folders.length == 0) return res.status(404).json(defaultResponse(404, 'Folder(s) not found', null))

        return res.status(200).json(defaultResponse(200, 'Folder(s) found', folders))
    }

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
    
        await createLog(req.id, 'delete_folder', { 
            folder_id: folder_id, 
            files: files_to_delete
        })

        return res.status(200).json(defaultResponse(200, 'Folder deleted successfully', delete_folder))
    }

    async renameFolder(req, res) {
        let { folder_id, name = null } = req.body

        if(!folder_id) return res.status(400).json(defaultResponse(400, 'Folder id is required', null))
        if(!name) return res.status(400).json(defaultResponse(400, 'Name is required for make the rename', null))

        const folder = await prisma.folder.findFirst({
            where: {
                id: folder_id
            }
        })

        if(!folder) return res.status(400).json(defaultResponse(400, 'Folder not found', null))
        if(!checkFolderPermission(req.id, folder_id)) return res.status(401).json(defaultResponse(401, 'Unauthorized', null))

        const exist_folder = await prisma.folder.update({
            where: {
                id: folder_id
            },
            data: {
                name: name
            }
        })

        return res.status(200).json(defaultResponse(200, 'Folder renamed successfully', exist_folder))
    }
}

module.exports = new FolderController()