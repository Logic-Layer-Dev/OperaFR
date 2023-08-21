module.exports = function(app) {
    require('./default.routes')(app)
    require('./file.routes')(app)
}