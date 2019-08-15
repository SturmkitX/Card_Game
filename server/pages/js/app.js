'use strict';

const host = `http://${window.location.host}`;
const extraCardTypes = ['Fusion', 'Pendulum', 'XYZ', 'Skill', 'Synchro', 'Link'];
const deckPreviewColumnLimit = 6;
let extraDeck;
let normalDeck;

window.addEventListener('load', () => {
    document.getElementById('searchBtn').addEventListener('click', searchCard);
    document.getElementById('saveBtn').addEventListener('click', saveDecks);
    updateLeftCard({id: 'back'});

    // load the decks
    let deck = localStorage.getItem('normalDeck');
    normalDeck = (deck != null) ? JSON.parse(deck) : [];

    deck = localStorage.getItem('extraDeck');
    extraDeck = (deck != null) ? JSON.parse(deck) : [];

    updateDecksPreview();
});

function searchCard() {
    const name = document.getElementById('cardNameField').value;
    const req = new XMLHttpRequest();
    req.open('GET', `${host}/api/getCard?name=${window.escape(name)}`);
    req.responseType = 'json';
    req.onload = () => {
        console.log(req.response);
        updatePreview(req.response.result);
    };
    req.send();
}

function updatePreview(cards) {
    const previewTable = document.getElementById('cardSearchPreview');
    previewTable.innerHTML = '';
    for (let card of cards) {
        let row = document.createElement('div');
        row.classList.add('row');
        previewTable.appendChild(row);

        let img = document.createElement('img');
        img.classList.add('img-fluid');
        img.style.paddingTop = '5px';
        img.src = `${host}/pics/${card.id}.jpg`;
        img.addEventListener('mouseover', () => {
            updateLeftCard(card);
        });
        img.addEventListener('click', () => {
            insertCardDeck(card);
        });

        let col = document.createElement('div');
        col.classList.add('col');
        col.appendChild(img);
        row.appendChild(col);
    }
}

function updateLeftCard(card) {
    // console.log(card);

    document.getElementById('cardPreview').src = `${host}/pics/${card.id}.jpg`;
    document.getElementById('cardPreviewName').innerHTML = (card.name != null) ? card.name : '-';
    document.getElementById('cardPreviewType').innerHTML = (card.type != null) ? card.type : '-';
    document.getElementById('cardPreviewArchetype').innerHTML = (card.archetype != null) ? card.archetype : '-';
    document.getElementById('cardPreviewRace').innerHTML = (card.race != null) ? card.race : '-';
    document.getElementById('cardPreviewDescription').innerHTML = (card.description != null) ? card.description : '-';
    document.getElementById('cardPreviewAttack').innerHTML = (card.attack != null) ? '' + card.attack : '-';
    document.getElementById('cardPreviewDefense').innerHTML = (card.defense != null) ? '' + card.defense : '-';
    document.getElementById('cardPreviewAttribute').innerHTML = (card.attribute != null) ? '' + card.attribute : '-';

}

function insertCardDeck(card) {
    let special = false;
    for (let type of extraCardTypes) {
        if (card.type.includes(type)) {
            special = true;
            break;
        }
    }

    let maxCards = 60;
    let selectedDeck = normalDeck;
    let selectedDeckString = 'Normal deck';
    if (special) {
        maxCards = 15;
        selectedDeck = extraDeck;
        selectedDeckString = 'Extra deck';
    }

    if (selectedDeck.length === maxCards) {
        window.alert(`${selectedDeckString} can have max. ${maxCards} cards`);
        return;
    }

    let appears = selectedDeck.filter(c => c.id === card.id).length;
    if (appears === 3) {
        window.alert('You can have a card up to 3 times');
        return;
    }

    selectedDeck.push(card);
    updateDecksPreview();
}

function updateDecksPreview() {
    console.log(normalDeck.length, extraDeck.length);
    const normalDeckField = document.getElementById('normalCardDeck');
    const extraDeckField = document.getElementById('extraCardDeck');
    normalDeckField.innerHTML = '';
    extraDeckField.innerHTML = '';

    // draw the normal cards first
    let rowsNumber = Math.ceil(normalDeck.length / deckPreviewColumnLimit);
    for (let i=0; i < rowsNumber; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        normalDeckField.appendChild(row);

        for (let j=0; j < deckPreviewColumnLimit; j++) {
            let index = i * deckPreviewColumnLimit + j;
            if (index >= normalDeck.length) {
                break;
            }

            const card = normalDeck[index];
            const img = document.createElement('img');
            img.classList.add('img-fluid');
            img.style.paddingTop = '5px';
            img.src = `${host}/pics/${card.id}.jpg`;
            img.addEventListener('click', () => {
                let foundIndex = normalDeck.findIndex(c => c.id === card.id);
                normalDeck.splice(foundIndex, 1);
                updateDecksPreview();
            });

            const col = document.createElement('div');
            col.classList.add('col-2');
            col.appendChild(img);
            row.appendChild(col);
        }
    }

    // draw the extra cards
    rowsNumber = Math.ceil(extraDeck.length / deckPreviewColumnLimit);
    for (let i=0; i < rowsNumber; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        extraDeckField.appendChild(row);

        for (let j=0; j < deckPreviewColumnLimit; j++) {
            let index = i * deckPreviewColumnLimit + j;
            if (index >= extraDeck.length) {
                break;
            }

            const card = extraDeck[index];
            const img = document.createElement('img');
            img.classList.add('img-fluid');
            img.style.paddingTop = '5px';
            img.src = `${host}/pics/${card.id}.jpg`;
            img.addEventListener('click', () => {
                let foundIndex = extraDeck.findIndex(c => c.id === card.id);
                extraDeck.splice(foundIndex, 1);
                updateDecksPreview();
            });

            const col = document.createElement('div');
            col.classList.add('col-2');
            col.appendChild(img);
            row.appendChild(col);
        }
    }

}

function saveDecks() {
    localStorage.setItem('normalDeck', JSON.stringify(normalDeck));
    localStorage.setItem('extraDeck', JSON.stringify(extraDeck));
    window.alert('Saved deck');
}
