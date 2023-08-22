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

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err){
            return res.status(401).send(defaultResponse(401, 'Token not valid.', null))
        };

        req.username = decoded.username;
        req.id = decoded.id;

        next();
    });
};