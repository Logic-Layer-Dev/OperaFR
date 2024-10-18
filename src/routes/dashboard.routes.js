require('dotenv').config(); 
const path = require('path');

module.exports = function(app) {
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    app.get('/dashboard', (req, res) => {
        const serverIp = process.env.SERVER_IP; 
        res.render('dashboard', { serverIp }); 
    });

    app.get('/dashboard/login', (req, res) => {
        const serverIp = process.env.SERVER_IP; 
        res.render('login', { serverIp }); 
    });
}