var fs = require('fs')
var path = require('path')

var storeDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir);

var HTTP_PORT = parseInt(process.env.HTTP_PORT,10) || 8080;

exports.servers = [
  {
    type: 'http',
    config: {
      port: HTTP_PORT,
      staticDir: path.join(__dirname, 'public')
    }
  },
  {
    type: 'websockets',
    config: {
      port: HTTP_PORT,
      maxSockets: 350
    }
  }
]

exports.connections = {
  store: storeDir,
  collectStats: true
}
