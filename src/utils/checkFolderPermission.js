const prisma = require('../../config/prisma.config')

module.exports = async function(user_id, folder_id, category = 'manage') {
    if(category == 'manage'){
        let have_current_permission = await prisma.user.findFirst({
            where: { id: user_id },
            include: {
                permissions: {
                    where: {
                        folderId: parseInt(folder_id)
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
    }   

    if(category == 'insert_file'){
        let have_current_permission = await prisma.user.findFirst({
            where: { id: user_id },
            include: {
                permissions: {
                    where: {
                        folderId: parseInt(folder_id)
                    },
                    include: {
                        folder: true
                    }
                }
            }
        })
    
        if(
            !have_current_permission.superuser && 
            !have_current_permission.permissions[0]?.permission == 'admin' &&
            !have_current_permission.permissions[0]?.permission == 'write'
        ) return false
    }

    return true
}