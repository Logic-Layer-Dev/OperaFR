const defaultResponse = require("../utils/defaultResponse");
const prisma = require("../../config/prisma.config");
const randomPassword = require("../utils/randomPassword");
const sha256 = require("sha256");

class UserServices{
    async createUser(req) {
        let {
            username,
            superuser = false,
            email = null
        } = req.body
        
        if(!username) return defaultResponse(400, 'Username is required', null)
        if(!email) return defaultResponse(400, 'Email is required', null)
        
        const is_super_user = await prisma.user.findFirst({
            where: {
                id: req.id,
            }
        })

        if(!is_super_user?.superuser) return defaultResponse(401, 'Unauthorized', null)

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: email },
                    { username: username },
                ],
            },
        });

        if(users.length > 0) return defaultResponse(400, 'Username or email already exists', null)

        let password = randomPassword()
        let sha256_pass = sha256(password)

        let user_created = await prisma.user.create({
            data: {
                username,
                password: sha256_pass,
                superuser,
                email
            }  
        })

        return defaultResponse(201, 'User created', {
            username: user_created.username,
            email: user_created.email,
            password
        })
    }

    async getUsers(req) {
        const is_super_user = await prisma.user.findFirst({
            where: {
                id: req.id,
            }
        })

        if(!is_super_user?.superuser) return defaultResponse(401, 'Unauthorized', null)

        const users = await prisma.user.findMany({
            select: {
                username: true,
                email: true,
                api_token: true,
                superuser: true,
                active: true
            }
        })

        return defaultResponse(200, 'Users listed', users)
    }

    async editUser(req){
        let {
            username,
            superuser = null,
            email = null,
            active = null,
            password = null
        } = req.body

        if(!username) return defaultResponse(400, 'User id is required', null)

        const is_super_user = await prisma.user.findFirst({
            where: {
                id: req.id,
            }
        })

        if(!is_super_user?.superuser) return defaultResponse(401, 'Unauthorized', null)

        let user = await prisma.user.findFirst({
            where: {
                username: username
            }
        })

        if(!user) return defaultResponse(400, 'User not found', null)

        let data = {}

        if(superuser != null) data.superuser = superuser == 1 ? true : false
        if(email != null) data.email = email
        if(active != null) data.active = active == 1 ? true : false
        if(password != null) {
            let sha256_pass = sha256(password)
            data.password = sha256_pass
        }

        if(email != null){
            let check_email_exists = await prisma.user.findFirst({
                where: {
                    email: email
                }
            })

            if(check_email_exists) return defaultResponse(400, 'Email already exists', null)
        }

        let user_updated = await prisma.user.updateMany({
            where: {
                username: username
            },
            data
        })

        if(user_updated.count == 0) return defaultResponse(400, 'User not found', null)

        let user_att = await prisma.user.findFirst({
            where: {
                username: username
            }
        })

        return defaultResponse(200, 'User updated successfully', {
            username: user_att.username,
            email: user_att.email,
            superuser: user_att.superuser,
            active: user_att.active
        })
    }
}

module.exports = new UserServices();