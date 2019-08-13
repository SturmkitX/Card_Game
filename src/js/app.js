'use strict';
import {DatabaseManager} from './database.js';

const API_POINT = 'https://db.ygoprodeck.com/api/v5/cardinfo.php';
function loadMagician() {
    const req = new XMLHttpRequest();
    req.open('GET', `${API_POINT}?fname=${escape('Dark Magician')}`);
    req.responseType = 'json';
    req.addEventListener('load', () => {
        console.log(req.response);
    });
    req.send();


}

window.addEventListener('load', () => {
    // loadMagician();
    let manager = new DatabaseManager();
    manager.create().then(db => {
        console.log(db);
    }).catch(code => {
        console.warn('Error code', code);
    });
});
