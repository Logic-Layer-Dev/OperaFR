const prisma = require('../../config/prisma.config');
const readline = require('readline');
const sha256 = require('sha256');

module.exports = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const questionAsync = (pergunta) => {
        return new Promise((resolve) => {
            rl.question(pergunta, resolve);
        });
    };

    const superUser = await prisma.user.findMany({
        where: {
            AND: [{
                superuser: true
            }, {
                active: true
            }]
        }
    });

    if (superUser.length === 0) {
        //-- Create a super user
        console.log('[No super user found. You need to create one.]');
        let makeQuestions = true

        let email = null;
        let username = null;
        let password = null;
        
        while (makeQuestions) {
            email = await questionAsync('Email for superuser: ');
            username = await questionAsync('Username for superuser: ');
            password = await questionAsync('Password for superuser: ');

            //-- Check if username or email exists
            const user = await prisma.user.findMany({
                where: {
                    OR: [{
                        username
                    }, {
                        email
                    }]
                }
            });

            if (user.length > 0) {
                console.log('[Username or email already exists. Try again.]');
            } else {
                makeQuestions = false
            }
        }

        let encryptedPassword = sha256(password);
        
        await prisma.user.create({
            data: {
                email,
                username,
                password: encryptedPassword,
                superuser: true,
                active: true
            }
        });

        console.log('[Super user created. Check the documentation for more information.]');
        rl.close();
    }
}