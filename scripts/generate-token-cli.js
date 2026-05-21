require('dotenv').config();

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const envPath = path.resolve(__dirname, '..', '.env');

const username = process.env.SUPERUSER_USER || process.env.USER;
const password = process.env.SUPERUSER_PASSWORD || process.env.PASSWORD;
const baseUrl = process.env.SERVER_IP || `http://localhost:${process.env.PORT || 2111}`;
const daysExpiration = process.env.TOKEN_DAYS_EXPIRATION || 30;

function requestJson(url, method, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const transport = parsed.protocol === 'https:' ? https : http;

        const req = transport.request(
            {
                protocol: parsed.protocol,
                hostname: parsed.hostname,
                port: parsed.port,
                path: `${parsed.pathname}${parsed.search}`,
                method,
                headers
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data || '{}');
                        resolve({ statusCode: res.statusCode, json });
                    } catch (error) {
                        reject(new Error(`Invalid JSON response from ${url}`));
                    }
                });
            }
        );

        req.on('error', reject);

        if (body) {
            req.write(body);
        }

        req.end();
    });
}

function setEnvVar(fileContent, key, value) {
    const escapedValue = String(value).replace(/\r?\n/g, '');
    const line = `${key}=${escapedValue}`;
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (regex.test(fileContent)) {
        return fileContent.replace(regex, line);
    }

    const suffix = fileContent.endsWith('\n') ? '' : '\n';
    return `${fileContent}${suffix}${line}\n`;
}

async function run() {
    if (!username || !password) {
        throw new Error('Missing env vars. Set SUPERUSER_USER/SUPERUSER_PASSWORD or USER/PASSWORD.');
    }

    const loginBody = JSON.stringify({
        username,
        password
    });

    const loginResponse = await requestJson(
        `${baseUrl}/login`,
        'POST',
        {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginBody)
        },
        loginBody
    );

    const authToken = loginResponse?.json?.content?.token;
    if (!authToken) {
        throw new Error(`Login failed: ${loginResponse?.json?.message || 'token not returned'}`);
    }

    const generateBody = JSON.stringify({
        days_expiration: daysExpiration
    });

    const generateResponse = await requestJson(
        `${baseUrl}/generate_token`,
        'POST',
        {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(generateBody),
            Authorization: authToken
        },
        generateBody
    );

    const userApiKey = generateResponse?.json?.content?.token;
    if (!userApiKey) {
        throw new Error(`Token generation failed: ${generateResponse?.json?.message || 'token not returned'}`);
    }

    const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const updatedEnv = setEnvVar(envContent, 'USER_API_KEY', userApiKey);
    fs.writeFileSync(envPath, updatedEnv, 'utf8');

    console.log('USER_API_KEY updated in .env');
}

run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
