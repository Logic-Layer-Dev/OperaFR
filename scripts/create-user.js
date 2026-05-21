require('dotenv').config();

const prisma = require('../config/prisma.config');
const sha256 = require('sha256');

const email = process.env.SUPERUSER_EMAIL;
const username = process.env.SUPERUSER_USER;
const password = process.env.SUPERUSER_PASSWORD;

let encryptedPassword = sha256(password);

async function run() {
    if (!email || !username || !password) {
        throw new Error('Missing env vars. Set SUPERUSER_EMAIL/SUPERUSER_USER/SUPERUSER_PASSWORD.');
    }

    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: encryptedPassword,
            superuser: true,
            active: true
        }
    });

    const folder = await prisma.folder.create({
        data: {
            name: 'default',
        }
    });

    console.log(`Superuser created with id ${user.id}`);
    console.log(`Folder created with id ${folder.id}`);
}

run()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
