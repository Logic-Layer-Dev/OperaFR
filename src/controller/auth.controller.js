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
            id: user.id,
            username: user.username,
        }, process.env.JWT_SECRET, {
            expiresIn: 28800 // expires in 8 hours
        });

        return res.status(200).json(defaultResponse(200, 'Login success', {
            token
        }))
    }
}

module.exports = new FileController()