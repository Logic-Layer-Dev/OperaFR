require('dotenv').config()

var process = require('process')
const app = require('./config/express.config');
const runZeroMqReply = require('./config/zeromq.reply.config');
const runZeroMqTopic = require('./config/zeromq.topic.config');
const checkNoSuperUser = require('./src/utils/checkNoSuperUser');

//Import routes
require('./src/routes/index')(app)

//Start the server
app.listen(process.env.PORT, async () => {
    console.log(`Opera started on port ${process.env.PORT || 2111}...`)

    //Check if is the first instance of the application
    checkNoSuperUser()
    
    //ZeroMQ tcp servers
    runZeroMqReply()
    runZeroMqTopic()
});