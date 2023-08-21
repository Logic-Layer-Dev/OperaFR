module.exports = function(app) {
    app.get('/', (req, res) => {
        res.status(200).send({
            success: true,
            message: 'Welcome to Opera API',
            content: null
        })
    })
}