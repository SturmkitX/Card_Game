const fs = require('fs');
let arr = JSON.parse(fs.readFileSync('./cardlist.json'));
let indices = arr.map(v => `https://storage.googleapis.com/ygoprodeck.com/pics/${v.id}.jpg`);
fs.writeFileSync('./pics_urls.txt', indices.join('\n'));

