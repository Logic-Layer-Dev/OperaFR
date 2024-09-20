const path = require('path');

module.exports = function(app) {
    app.get('/dashboard', (req, res) => {
        res.sendFile(path.join(__dirname, '../dashboard/index.html')); 
    });
}