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
}

module.exports = new UserController()