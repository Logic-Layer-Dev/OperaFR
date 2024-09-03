require('dotenv').config()

var process = require('process')
const app = require('./config/express.config');
const runZeroMq = require('./config/zeromq.config');
const checkNoSuperUser = require('./src/utils/checkNoSuperUser');

//Import routes
require('./src/routes/index')(app)

//Start the server
app.listen(process.env.PORT, async () => {
    checkNoSuperUser()
    runZeroMq()
    console.log(`Opera started on port ${process.env.PORT || 2111}...`)
});