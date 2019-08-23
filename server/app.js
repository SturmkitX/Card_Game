const express = require('express');
const http = require('http');
const manager = require('./database-manager');
const cardManager = require('./card-manager');
const socketManager = require('./socket-manager');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);

manager.init();
app.use(bodyParser.json());

app.get('/api/getCard', cardManager.findCard);
app.use(express.static('cards'));
app.use(express.static('pages'));

process.on('exit', manager.closeDB);

socketManager.init(server, manager);

server.listen(3000, '0.0.0.0', () => console.log('Server started on port 3000!'));
