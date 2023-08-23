require("dotenv").config();

const jwt = require('jsonwebtoken');
const defaultResponse = require('../utils/defaultResponse');
const prisma = require('../../config/prisma.config');

module.exports = async (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send(defaultResponse(401, 'Token not send.', null));
    }

    let is_api_token = await prisma.user.findFirst({
        where: {
            api_token: token
        }
    })

    if(is_api_token){
        if(!is_api_token.active) return res.status(401).send(defaultResponse(401, 'User is inactive.', null))

        let limit = is_api_token.api_expires_at
        let now = new Date()

        if(now > limit){
            return res.status(401).send(defaultResponse(401, 'Token expired.', null))
        }
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err){
            return res.status(401).send(defaultResponse(401, 'Token not valid.', null))
        };

        let user_active = await prisma.user.findFirst({
            where: {
                id: decoded.id
            }
        })

        if(!user_active) return res.status(401).send(defaultResponse(401, 'Current user not found. Go to login route and reauth', null))
        if(!user_active.active) return res.status(401).send(defaultResponse(401, 'User is inactive.', null))

        req.username = decoded.username;
        req.id = decoded.id;

        next();
    });
};