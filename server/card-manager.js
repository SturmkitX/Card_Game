const manager = require('./database-manager');

exports.findCard = function(req, res) {
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
};
