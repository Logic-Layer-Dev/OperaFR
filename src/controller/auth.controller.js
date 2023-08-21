require("dotenv").config();

const defaultResponse = require("../utils/defaultResponse");
const prisma = require("../../config/prisma.config");
const sha256 = require("sha256");
const jwt = require("jsonwebtoken");

class FileController {
    async login(req, res) {
        let {
            username,
            password
        } = req.body

        if(!username) return res.status(400).json(defaultResponse(400, 'Username is required', null))
        if(!password) return res.status(400).json(defaultResponse(400, 'Password is required', null))

        let sha256_pass = sha256(password)

        const user = await prisma.user.findMany({
            where:{ 
                AND: [{
                    username: username,
                    password: sha256_pass
                }]
            }
        });
        
        if(user.length == 0) return res.status(400).json(defaultResponse(400, 'Username or password is incorrect', null))
        
        const token = jwt.sign({ 
            id: user[0].id,
            username: user[0].username,
        }, process.env.JWT_SECRET, {
            expiresIn: 28800 // expires in 8 hours
        });

        return res.status(200).json(defaultResponse(200, 'Login success', {
            token
        }))
    }

    async giveFolderPermission(req, res) {
        let {
            user_id = null,
            username = null,
            folder_id = null,
            permission = 'read'
        } = req.body

        if(!user_id && !username) return res.status(400).json(defaultResponse(400, 'User id or username is required for locate the user', null))
        if(!folder_id) return res.status(400).json(defaultResponse(400, 'Folder id is required', null))
        if(permission != 'read' && permission != 'write' && permission != 'admin') return res.status(400).json(defaultResponse(400, 'Permission must be read, write or admin', null))

        let have_current_permission = await prisma.user.findFirst({
            where: { id: req.id },
            include: {
                permissions: {
                    where: {
                        folderId: folder_id
                    },
                    include: {
                        folder: true
                    }
                }
            }
        })

        if(
            !have_current_permission.superuser && 
            !have_current_permission.permissions[0]?.permission == 'admin'
        ) return res.status(400).json(defaultResponse(401, 'You dont have permission to give permission to this folder', null))

        //-- Check if user exists and have the permission
        let where_clause = {
            id: user_id ? user_id : undefined,
            username: username ? username : undefined
        }

        let user = await prisma.user.findFirst({
            where: where_clause,
            include: {
                permissions: {
                    where: {
                        folderId: folder_id
                    },
                    include: {
                        folder: true
                    }
                }
            }
        })

        if (!user) return res.status(400).json(defaultResponse(400, 'User not found', null))
        if (user.permissions.length > 0) return res.status(400).json(defaultResponse(400, 'User already have this permission', null))

        await prisma.folderPermission.create({
            data: {
                userId: user.id,
                folderId: folder_id,
                permission: permission
            }
        }) 

        return res.status(200).json(defaultResponse(200, 'successfully authorized user', null))
    }
}

module.exports = new FileController()