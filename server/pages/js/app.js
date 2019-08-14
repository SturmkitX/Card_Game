'use strict';
import {DatabaseManager} from './database.js';

const API_POINT = 'https://db.ygoprodeck.com/api/v5/cardinfo.php';
const host = `http://${window.location.host}`;

window.addEventListener('load', () => {
    // loadMagician();
    let manager = new DatabaseManager();
    manager.create().then(db => {
        console.log(db);
    }).catch(code => {
        console.warn('Error code', code);
    });

    document.getElementById('searchBtn').addEventListener('click', searchCard);
    updateLeftCard(`${host}/pics/back.jpg`);

    // fix the card preview padding
    let incPad = document.getElementById('previewColumn').offsetWidth;
    document.getElementById('cardSearchPreview').style.marginLeft = `${incPad}px`;
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
    let latestRow;
    for (let index=0; index < cards.length; index++) {
        if (index % 12 === 0) {
            // create a new row
            let row = document.createElement('div');
            row.classList.add('row');
            previewTable.appendChild(row);
        }

        latestRow = previewTable.childNodes[previewTable.childNodes.length - 1];
        let card = cards[index];
        let img = document.createElement('img');
        img.classList.add('img-fluid');
        img.style.paddingTop = '5px';
        img.src = `${host}/pics/${card.id}.jpg`;
        img.addEventListener('mouseover', () => {
            updateLeftCard(img.src);
        });

        let col = document.createElement('div');
        col.classList.add('col-1');
        col.appendChild(img);
        latestRow.appendChild(col);
    }
}

function updateLeftCard(source) {
    let preview = document.getElementById('cardPreview');
    preview.src = source;
}
