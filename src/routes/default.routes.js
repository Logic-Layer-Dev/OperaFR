const { version } = require('../../package.json')
const defaultResponse = require('../utils/defaultResponse')

module.exports = function(app) {
    app.get('/', (req, res) => {
        res.status(200).send(defaultResponse(200, `Welcome to Opera API. Version ${version}`, null))
    })
}