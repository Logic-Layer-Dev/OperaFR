require("dotenv").config();

const jwt = require('jsonwebtoken');
const defaultResponse = require('../utils/defaultResponse');

module.exports = async (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send(defaultResponse(401, 'Token not send.', null));
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