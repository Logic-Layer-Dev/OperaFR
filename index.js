require('dotenv').config()

var process = require('process')
const app = require('./config/express.config')

//Import routes
require('./src/routes/index')(app)

//Start the server
app.listen(process.env.PORT, async () => {
    console.log(`Opera started on port ${process.env.PORT || 2111}...`)
});