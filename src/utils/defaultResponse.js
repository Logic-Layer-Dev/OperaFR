module.exports = function(status, message, content) {
    return {
        success: status,
        message: message,
        content: content
    }
}