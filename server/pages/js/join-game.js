window.addEventListener('load', () => {
    document.getElementById('joinBtn').addEventListener('click', attemptJoin);
    document.getElementById('gameAddress').value = window.location.host;
});

function attemptJoin() {
    const name = document.getElementById('gameName').value.trim();
    const address = document.getElementById('gameAddress').value.trim();
    const roomId = document.getElementById('gameId').value.trim();

    if (name.length === 0 || address.length === 0) {
        window.alert('Invalid name / address');
        return;
    }

    const gameData = JSON.stringify({
        event: 'JOIN_ROOM',
        roomId: roomId,
        name: name
    });

    const socket = new WebSocket(`ws://${address}`);
    socket.addEventListener('open', () => {
        console.log('Connected to websocket server');

        socket.send(gameData);
    });

    socket.addEventListener('close', () => {
        console.log('Disconnected from websocket server');
    });

    socket.addEventListener('message', message => {
        const data = JSON.parse(message.data);
        console.log(data);

        handleReceivedData(data);
    });

    socket.addEventListener('error', ev => {
        console.log('Websocket error occured');
        console.warn(ev);
    });

}

function handleReceivedData(data) {
    switch (data.event) {
        case 'UPDATE_ROOM': _updateRoomInfo(data); break;
    }
}

function _updateRoomInfo(data) {
    // update names
    let nameFields = document.getElementsByName('playerName');
    for (let i in data.names) {
        nameFields[i].innerHTML = data.names[i];
    }

    // see if we have enough players to start the game
    if (data.action === 'START_GAME') {
        console.info('We can now start the game');
    }
}
