// ROUTES FOR OUR API
// =============================================================================
var express = require('express');
var router = express.Router(); // get an instance of the express Router
var Services = require('../models/services');



// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
        res.json({
            message: 'hooray! welcome to our api!'
        });
    })
    .post('/_createservice', function (req, res) {
        var service = new Services();
        service.name = req.body.name;
        service.id = '1234'
        service.save(function (err) {
            if (err)
                res.send(err);
            res.json({
                message: 'service created!'
            });
        });
    })
    .get('/_listservices', function (req, res) {
        Services.find(function (err, services) {
            if (err)
                res.send(err);

            res.json({
                message: 'get test'
            });
        });
    })
module.exports = router;