const defaultResponse = require("../utils/defaultResponse");
const prisma = require("../../config/prisma.config");
const randomPassword = require("../utils/randomPassword");
const sha256 = require("sha256");

class UserController {
    async createUser(req, res) {
        let {
            username,
            superuser = false,
            email = null
        } = req.body
        
        if(!username) return res.status(400).json(defaultResponse(400, 'Username is required', null))
        if(!email) return res.status(400).json(defaultResponse(400, 'Email is required', null))
        
        const is_super_user = await prisma.user.findFirst({
            where: {
                id: req.id,
            }
        })

        if(!is_super_user?.superuser) return res.status(401).json(defaultResponse(401, 'Unauthorized', null))

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: email },
                    { username: username },
                ],
            },
        });

        if(users.length > 0) return res.status(400).json(defaultResponse(400, 'Username or email already exists', null))

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

        return res.status(201).json(defaultResponse(201, 'User created', {
            username: user_created.username,
            email: user_created.email,
            password
        }))
    }

    async editUser(req, res) {
        let {
            user_id,
            superuser = null,
            email = null,
            active = null,
        } = req.body

        if(!user_id) return res.status(400).json(defaultResponse(400, 'User id is required', null))

        const is_super_user = await prisma.user.findFirst({
            where: {
                id: req.id,
            }
        })

        if(!is_super_user?.superuser) return res.status(401).json(defaultResponse(401, 'Unauthorized', null))

        let user = await prisma.user.findFirst({
            where: {
                id: user_id
            }
        })

        if(!user) return res.status(400).json(defaultResponse(400, 'User not found', null))

        let data = {}

        if(superuser != null) data.superuser = superuser == 1 ? true : false
        if(email != null) data.email = email
        if(active != null) data.active = active == 1 ? true : false

        if(email != null){
            let check_email_exists = await prisma.user.findFirst({
                where: {
                    email: email
                }
            })

            if(check_email_exists) return res.status(400).json(defaultResponse(400, 'Email already exists', null))
        }

        let user_updated = await prisma.user.update({
            where: {
                id: user_id
            },
            data
        })

        return res.status(200).json(defaultResponse(200, 'User updated successfully', {
            username: user_updated.username,
            email: user_updated.email,
            superuser: user_updated.superuser,
            active: user_updated.active
        }))
    }
}

module.exports = new UserController()