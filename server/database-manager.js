const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const arr = JSON.parse(fs.readFileSync('./cards/cardlist.json', {encoding: 'utf8'}));
const len = arr.length;
const db = new sqlite3.Database('./cards.db', err => {
    if (err) {
        throw err;
    }
});

exports.populate = function() {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS Cards (id text primary key, name text not null unique, ' +
            'type text not null, description text, attack integer, defense integer, level integer, ' +
            'race text, archetype text, attribute text)', err => {
            if (err) {
                throw err;
            }
        });

        for (let index=0; index < len; ) {
            let increment = Math.min(len - index, 50);
            let tempArr = arr.slice(index, index + increment);
            index += increment;

            let sql = 'INSERT INTO Cards (id, name, type, description, attack, defense, level, race, archetype, attribute) VALUES ';
            let propString = '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?),';
            let arr2 = [];
            tempArr.forEach(card => {
                arr2.push(card.id, card.name, card.type, card.desc, card.atk, card.def, card.level, card.race, card.archetype,
                    card.attribute);
                sql += propString;
            });
            sql = sql.substr(0, sql.length - 1);
            db.run(sql, arr2, err => {
                if (err) {
                    throw err;
                }
            });

        }


        db.close();
        console.info('Finished populating database');
    });
};

exports.findById = function(id) {
    let sql = 'SELECT * FROM Cards WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

exports.findByName = function(name) {
    let sql = "SELECT * FROM Cards WHERE name LIKE '%' || ? || '%'";
    return new Promise((resolve, reject) => {
        db.all(sql, [name], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.closeDB = function() {
    db.close();
};




