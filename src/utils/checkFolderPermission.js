const prisma = require('../../config/prisma.config')

module.exports = async function(user_id, folder_id) {
    let have_current_permission = await prisma.user.findFirst({
        where: { id: user_id },
        include: {
            permissions: {
                where: {
                    folderId: folder_id
                },
                include: {
                    folder: true
                }
            }
        }
    })

    if(
        !have_current_permission.superuser && 
        !have_current_permission.permissions[0]?.permission == 'admin'
    ) return false

    return true
}