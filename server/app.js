const express = require('express');
const manager = require('./database-manager');
const app = express();

app.get('/', (req, res) => {
    res.status(200).send('Hello World');
});
app.get('/api/getCard', (req, res) => {
    let searchFunction;
    if (req.query.id) {
        searchFunction = manager.findById(req.query.id);
    } else if (req.query.name) {
        searchFunction = manager.findByName(req.query.name);
    }

    if (!searchFunction) {
        res.status(400).send({status: 'error', message: 'Please specify an ID or a name'});
    } else {
        searchFunction.then(result => {
            res.status(200).json({status: 'ok', result: result});
        }).catch(err => {
            res.json({status: 'error', message: err});
        })
    }
});
app.use(express.static('cards'));
app.use(express.static('pages'));

process.on('exit', manager.closeDB);

app.listen(3000, '0.0.0.0', () => console.log('Server started on port 3000!'));
