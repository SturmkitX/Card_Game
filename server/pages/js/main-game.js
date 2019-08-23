let socket = undefined;
let started = true;     // change later
let players = [];
let ownIndex = 0;
let ownName;

window.addEventListener('load', () => {
    // decode URL data
    const dataParam = new URL(window.location.href).searchParams.get('data');
    if (!dataParam) {
        window.alert('Invalid connection data');
        return;
    }

    let data = JSON.parse(window.atob(dataParam));
    ownName = data.name;
    socket = new WebSocket(`ws://${data.address}`);
    socket.addEventListener('open', () => {
        console.log('Connected to websocket server');

        authClient(data);
    });

    socket.addEventListener('close', () => {
        console.log('Disconnected from server');
    });

    socket.addEventListener('error', ev => {
        console.log('Websocket error');
        console.warn(ev);
    });

    socket.addEventListener('message', message => {
        const parsed = JSON.parse(message.data);
        console.log(parsed);

        handleReceivedMessage(parsed);
    });

    document.getElementById('drawCardBtn').addEventListener('click', drawCard);
});

function authClient(data) {
    // get IDs of cards in the decks
    const normalDeck = JSON.parse(localStorage.getItem('normalDeck')).map(c => c.id);
    const extraDeck = JSON.parse(localStorage.getItem('extraDeck')).map(c => c.id);

    console.log(normalDeck, extraDeck);

    const obj = JSON.stringify({
        event: 'AUTHENTICATE_ROOM',
        roomId: data.roomId,
        name: data.name,
        normalDeck: normalDeck,
        extraDeck: extraDeck
    });
    socket.send(obj);
}

function handleReceivedMessage(message) {
    switch (message.event) {
        case 'BEGIN_GAME': _beginGame(message); break;
    }
}

function _beginGame(data) {
    console.info('Commencing game');
    console.log(data.players);

    players = data.players;
    ownIndex = data.players.findIndex(p => p.name === ownName);
}

function drawCard() {
    const handField = document.getElementById('ownHandCards');
    let deck = players[ownIndex].normalDeck;
    let randIndex = Math.floor(Math.random() * deck.length);
    let card = deck[randIndex];

    const img = document.createElement('img');
    img.src = `/pics/${card.id}.jpg`;
    img.classList.add('img-fluid');

    const col = document.createElement('div');
    col.classList.add('col');
    col.appendChild(img);
    handField.appendChild(col);
}
