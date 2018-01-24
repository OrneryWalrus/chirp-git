var express = require('express');
var router = express.Router();

// get home page
router.get('/', function(req, res, next) {
    console.log('req.user homepage GET: ' + req.user);
    res.render('index', {
        title: 'Chirp'
    });
});

module.exports = router;