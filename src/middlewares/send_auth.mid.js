const defaultResponse = require("../utils/defaultResponse");

require("dotenv").config();

module.exports = async (req, res, next) => {
    const valid_ips = JSON.parse(process.env.VALID_SENDER_IPS);
    if(!valid_ips.includes(req.ip) && !valid_ips.includes('*')) return res.status(401).json(defaultResponse(401, `Unauthorized`, null))
    next();
}