module.exports = function(app) {
    require('./default.routes')(app)
    require('./file.routes')(app)
    require('./user.routes')(app)
    require('./auth.routes')(app)
}