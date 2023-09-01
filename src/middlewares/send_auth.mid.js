require("dotenv").config();

module.exports = async (req, res, next) => {
    const valid_ips = JSON.parse(process.env.VALID_SENDER_IPS);

    if(valid_ips.includes('*')) next();
    if(!valid_ips.includes(req.ip)) return res.status(401).send({error: 'Unauthorized'});

    next();
}