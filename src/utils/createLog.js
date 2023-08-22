const prisma = require('../../config/prisma.config')

module.exports = async function(user_id, action, custom_log) {
    try{
        let info_action = {
            action: action,
            custom_log: JSON.stringify(custom_log)
        }
    
        await prisma.logs.create({
            data: {
                action: JSON.stringify(info_action),
                userId: user_id,
                createdAt: new Date()
            }
        })
    
        return true
    } catch (err) {
        throw err
    }
}