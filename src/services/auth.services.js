require("dotenv").config();

const defaultResponse = require("../utils/defaultResponse");
const prisma = require("../../config/prisma.config");
const sha256 = require("sha256");
const jwt = require("jsonwebtoken");
const checkFolderPermission = require("../utils/checkFolderPermission");

class AuthServices {
    async login(req) {
        let {
            username,
            password
        } = req.body

        if(!username) return defaultResponse(400, 'Username is required', null)
        if(!password) return defaultResponse(400, 'Password is required', null)

        let sha256_pass = sha256(password)

        const user = await prisma.user.findMany({
            where:{ 
                AND: [{
                    username: username,
                    password: sha256_pass
                }]
            }
        });
        
        if(user.length == 0) return defaultResponse(400, 'Username or password is incorrect', null)
        
        const token = jwt.sign({ 
            id: user[0].id,
            username: user[0].username,
        }, process.env.JWT_SECRET, {
            expiresIn: 28800 // expires in 8 hours
        });

        return defaultResponse(200, 'Login success', {
            token
        })
    }

    async deleteFolderPermission(req){
        let {
            user_id = null,
            username = null,
            folder_id = null,
        } = req.body

        if(!user_id && !username) return defaultResponse(400, 'User id or username is required for locate the user', null)
        if(!folder_id) return defaultResponse(400, 'Folder id is required', null)
        if(!await checkFolderPermission(req.id, folder_id)) return defaultResponse(401, 'Unauthorized', null)
        
        //-- Remove permission from user
        let where_clause = {
            id: user_id ? user_id : undefined,
            username: username ? username : undefined
        }

        const user = await prisma.user.findFirst({
            where: where_clause,
        });

        if(!user) return defaultResponse(400, 'User not found', null)

        await prisma.folderPermission.deleteMany({
            where: {
                userId: user.id,
                folderId: folder_id
            }
        })

        return defaultResponse(200, 'successfully removed permission from user', null)
    }

    async giveFolderPermission(req){
        let {
            user_id = null,
            username = null,
            folder_id = null,
            permission = 'read'
        } = req.body

        if(!user_id && !username) return defaultResponse(400, 'User id or username is required for locate the user', null)
        if(!folder_id) return defaultResponse(400, 'Folder id is required', null)
        if(permission != 'read' && permission != 'write' && permission != 'admin') return defaultResponse(400, 'Permission for user must be read, write or admin', null)
        if(!await checkFolderPermission(req.id, folder_id)) return defaultResponse(401, 'Unauthorized', null)
        
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

        if (!user) return defaultResponse(400, 'User not found', null)
        if (user.permissions.length > 0) return defaultResponse(400, 'User already have this permission', null)

        await prisma.folderPermission.create({
            data: {
                userId: user.id,
                folderId: folder_id,
                permission: permission
            }
        }) 

        return defaultResponse(200, 'successfully authorized user', null)
    }

    async generateApiToken(req){
        let user_id = req.id
        let days_expiration = req.body.days_expiration

        if(!days_expiration) defaultResponse(400, 'Days expiration is required', null)
        if(days_expiration < 0) defaultResponse(400, 'Days expiration must be greater than 0', null)
        
        let expiration_date = new Date() 
        
        if(days_expiration == 'never'){
            expiration_date.setFullYear(2100)
        } else {
            expiration_date.setDate(expiration_date.getDate() + days_expiration)
        }

        let user = await prisma.user.findFirst({
            where: { id: user_id }
        })

        let token = jwt.sign({ 
            id: user.id,
            username: user.username,
            expiration_date: expiration_date
        }, process.env.JWT_SECRET);

        await prisma.user.update({
            where: { id: user_id },
            data: {
                api_token: token,
                api_expires_at: expiration_date
            }
        })

        return defaultResponse(200, 'Token generated successfully', {
            token,
            expiration_date
        })
    }
}

module.exports = new AuthServices();