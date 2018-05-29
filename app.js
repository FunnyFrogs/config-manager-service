// get all required items
var express = require('express');
var engines = require('consolidate');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var assert = require('assert');
var logger = require('morgan');
var path = require('path');
const uuidv1 = require('uuid/v1');
var port = process.env.PORT || 8082;
var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/config_db';

var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());



// make sure we can connect to database before starting server
MongoClient.connect(mongoUri, function (err, db) {
    assert.equal(null, err);
    console.log('Successfully connected to mondodb');
    app.get('/listservices', function (req, res) {
        db.collection('services').find({}).toArray(function (err, docs) {
            res.json({
                'services': docs
            });
        });
    });

    app.post('/createservice', function (req, res) {
        var servicename = req.body.servicename;
        var id = uuidv1();
        db.collection('services').insertOne({
            id: id,
            name: servicename
        }, function (err, doc) {
            assert.equal(null, err);
            res.json({
                message: 'create service'
            });
        });

    });

    app.delete('/deleteservice/:service_id', function (req, res) {
        var serviceId = req.params.service_id;
        db.collection('services').deleteMany({
            id: serviceId,
        }, function (err, doc) {
            assert.equal(null, err);
            res.json({
                message: 'deleted service'
            });
        });

    });

    app.get('/listconfigs', function (req, res) {
        db.collection('configs').find({}).toArray(function (err, docs) {
            res.json({
                'configs': docs
            });
        });
    });

    app.get('/listconfigsbyName/:serviceName', function (req, res) {
        var serviceName = req.params.serviceName;
        db.collection('configs').find({
            'name': serviceName
        }).toArray(function (err, docs) {
            res.json({
                'configs': docs
            });
        });
    });

    app.get('/configByIdIp/:serviceName/:clientId/:ipaddress', function (req, res) {
        var serviceName = req.params.serviceName;
        var clientId = req.params.clientId;
        var ipaddress = req.params.ipaddress;
        db.collection('configs').find({
            'name': serviceName,
            'clientId': clientId,
            'ipaddress': ipaddress
        }).toArray(function (err, docs) {
            res.json({
                'configs': docs
            });
        });
    });

    app.post('/createconfig', function (req, res) {
        var servicename = req.body.servicename;
        var configname = req.body.configname;
        var clientId = req.body.clientId;
        var ipaddress = req.body.ipaddress;
        var key = req.body.key;
        var value = req.body.value;
        var id = uuidv1();
        db.collection('configs').insertOne({
            id: id,
            name: servicename,
            configname: configname,
            clientId: clientId,
            ipaddress: ipaddress,
            key: key,
            value: value
        }, function (err, doc) {
            assert.equal(null, err);
            res.json({
                message: 'create config'
            });
        });

    });

    app.delete('/deleteconfig/:config_id', function (req, res) {
        var serviceId = req.params.service_id;
        db.collection('configs').deleteMany({
            id: serviceId,
        }, function (err, doc) {
            assert.equal(null, err);
            res.json({
                message: 'deleted configuration'
            });
        });

    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });


    app.listen(port, function () {
        console.log('http://localhost:8082/');
    });

});