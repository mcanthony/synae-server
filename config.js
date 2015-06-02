var fs = require('fs')
var path = require('path')

var storeDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir);

exports.http = {
    port: process.env.HTTP_PORT || 8080
  , staticDir: path.join(__dirname, 'public')
}

// same port as http
exports.websockets = {}


exports.connections = {
    store: storeDir
  , collectStats: true
}


exports.osc = {
  port: 9000
}
