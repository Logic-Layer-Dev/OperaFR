const fs = require('fs');

module.exports = async (req, res, next) => {
    if (req.headers['content-type'] === 'application/octet-stream') {
        const chunks = [];

        req.on('data', chunk => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            const fileBuffer = Buffer.concat(chunks);
            const default_name = new Date().getTime().toString();
            const extension = req.headers['x-file-extension'] || 'bin';

            fs.writeFileSync(`uploads/${default_name}.${extension}`, fileBuffer);

            req.file = {
                buffer: fileBuffer,
                originalname: default_name + '.' + extension,
                filename: default_name + '.' + extension,
            };

            req.body.folder_id = req.headers['x-folder-id'] || null;

            next();
        });
    } else {
        next();
    }
};