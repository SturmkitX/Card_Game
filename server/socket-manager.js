const WebsocketServer = require('ws');
let server = undefined;
let pools = new Map();
let dbManager = undefined;

exports.init = function(httpServer, manager) {
    server = new WebsocketServer.Server({
        server: httpServer
    });
    // console.log(server);
    dbManager = manager;

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

function handleClientMessage(message, client) {
    switch (message.event) {
        case 'JOIN_ROOM': _joinRoomClient(message, client); break;
        case 'LEAVE_ROOM': _leaveRoomClient(message, client); break;

        // room specific commands (in-game)
        case 'AUTHENTICATE_ROOM': _authClient(message, client); break;
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
    const canStart = (arr.length === 2);
    const nextAction = canStart ? 'START_GAME' : undefined;
    const nextId = canStart ? `${message.roomId}-${Date.now()}` : undefined;
    const socketList = arr.map(a => a.socket);
    const nameList = arr.map(a => a.name);
    for (let socket of socketList) {
        socket.send(JSON.stringify({event: 'UPDATE_ROOM', names: nameList, action: nextAction, id: nextId}));
    }

    if (canStart) {
        pools.delete(message.roomId);
    }

}

async function _authClient(message, client) {
    const {roomId, name, normalDeck, extraDeck} = message;
    if (!pools.get(roomId)) {
        pools.set(roomId, []);
    }

    const arr = pools.get(roomId);
    arr.push({roomId: roomId, name: name, normalDeck: normalDeck, extraDeck: extraDeck, socket: client});
    if (arr.length === 2) {
        // broadcast the game begin signal
        let playerList = await _generatePlayerList(roomId);
        const socketList = arr.map(a => a.socket);
        for (let socket of socketList) {
            socket.send(JSON.stringify({event: 'BEGIN_GAME', players: playerList}));
        }
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

async function _generatePlayerList(roomId) {
    const arr = pools.get(roomId);
    let playerList = [];

    for (let player of arr) {
        playerList.push({
            name: player.name,
            normalDeck: await dbManager.findMultipleById(player.normalDeck),
            extraDeck: await dbManager.findMultipleById(player.extraDeck)
        });
    }

    console.log(playerList);
    return playerList;
}
