const WebsocketServer = require('ws');
let server = undefined;
let pools = new Map();

exports.init = function(httpServer) {
    server = new WebsocketServer.Server({
        server: httpServer
    });
    // console.log(server);

    server.on('connection', (client) => {
        console.log('New client connected');

        client.on('message', data => {
            console.log('Received client data');
            handleClientMessage(JSON.parse(data), client);
        });
    });

    server.on('error', () => {
        console.log('Websocket server error');
    });
};

exports.addToPoolRequest = function(req, res) {
    if (!req.body) {
        res.status(400).json({status: 'error', message: 'No body'});
        return;
    }
    console.log(req.body);

    let roomId = req.body.roomId;
    let name = req.body.name;

    let ns = server.of(`/${roomId}`);
    ns.clients((err, clients) => {
        if (err) {
            console.warn(err);
            res.status(400).json({status: 'error', message: err});
            return;
        }

        if (clients.length > 2) {
            console.log('Clients list:', clients);
            res.status(400).json({status: 'error', message: 'Too many players'});
            return;
        }

        res.status(200).json({
            status: 'ok',
            message: result,
            pool: (code === 200) ? pools.get(roomId) : []
        });
    });
};

function handleClientMessage(message, client) {
    switch (message.event) {
        case 'JOIN_ROOM': _joinRoomClient(message, client); break;
        case 'LEAVE_ROOM': _leaveRoomClient(message, client); break;
    }
}

function _joinRoomClient(message, client) {
    if (!pools.get(message.roomId)) {
        pools.set(message.roomId, []);
    }

    const arr = pools.get(message.roomId);
    if (arr.length === 2) {
        client.send(JSON.stringify({status: 'error', message: 'Player limit exceeded'}));
        return;
    }

    arr.push({name: message.name, socket: client});
    client.send(JSON.stringify({status: 'ok'}));

    // send a broadcast message
    const nextAction = (arr.length === 2) ? 'START_GAME' : 'NONE';
    const socketList = arr.map(a => a.socket);
    const nameList = arr.map(a => a.name);
    for (let socket of socketList) {
        socket.send(JSON.stringify({event: 'UPDATE_ROOM', names: nameList, action: nextAction}));
    }

}

function _leaveRoomClient(message, client) {
    if (!pools.get(message.roomId)) {
        client.send(JSON.stringify({status: 'error'}));
        return;
    }

    const arr = pools.get(message.roomId);
    if (arr.findIndex(c => c.socket === client) < 0) {
        client.send(JSON.stringify({status: 'error'}));
        return;
    }

    // if we have less than 2 end the game
    client.send(JSON.stringify({status: 'ok'}));
    arr.clear();
    pools.delete(message.roomId);
}
