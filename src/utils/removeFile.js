const fs = require('fs');
const path = require('path');

module.exports = (file_path) => {
    try{
        fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', file_path));
        return true;
    } catch(err) {
        console.error("[ERROR: removeFile.js]", err);
        return false;
    }
}