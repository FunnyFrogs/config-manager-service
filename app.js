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
    app.get('/config/listservices', function (req, res) {
        db.collection('services').find({}).toArray(function (err, docs) {
            res.json({
                'services': docs
            });
        });
    });

    app.post('/config/dataCollector/:schemaName', function (req, res) {
        var inputData = req.body.inputData;
        inputData['id'] = req.params.schemaName;
        inputData['name'] = req.params.schemaName;
        db.collection('services').insertOne(inputData, function (err, doc) {
            assert.equal(null, err);
            res.json({
                message: 'create service'
            });
        });

    });

    app.get('/config/dataCollector/:schemaName', function (req, res) {
        var schemaName = req.params.schemaName;
        db.collection('services').find({
            'name': schemaName
        }).toArray(function (err, docs) {
            res.json({
                'list': docs
            });
        });
    });

    app.post('/config/createservice', function (req, res) {
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

    app.delete('/config/deleteservice/:service_id', function (req, res) {
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

    app.get('/config/listconfigs', function (req, res) {
        db.collection('configs').find({}).toArray(function (err, docs) {
            res.json({
                'configs': docs
            });
        });
    });

    app.get('/config/listconfigsbyName/:serviceName', function (req, res) {
        var serviceName = req.params.serviceName;
        db.collection('configs').find({
            'name': serviceName
        }).toArray(function (err, docs) {
            res.json({
                'configs': docs
            });
        });
    });

    app.get('/config/listconfigsbyClient/:serviceName/:clientName', function (req, res) {
        var serviceName = req.params.serviceName;
        var clientName = req.params.clientName;
        var clientList = [];
        db.collection('configs').find({
            'name': serviceName,
            'clientId': clientName
        }).toArray(function (err, docs) {
            clientList = docs;
            db.collection('configs').find({
                'name': serviceName,
                "clientId": {
                    $ne: clientName,
                    $eq: 'All'
                }
            }).toArray(function (err, docs) {
                var result = JSON.parse(JSON.stringify(docs));
                for (var i = 0; i < clientList.length; i++) {
                    result = docs.filter((val) => {
                        return val.key !== clientList[i].key
                    });
                    docs = JSON.parse(JSON.stringify(result));
                }
                if (result) {
                    var finalResult = result.concat(clientList);
                } else {
                    var finalResult = clientList;
                }

                res.json({
                    'configs': finalResult
                });
            });
        });
    });

    app.get('/config/configByIdIp/:serviceName/:clientId/:ipaddress', function (req, res) {
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

    app.post('/config/createconfig', function (req, res) {
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

    app.put('/config/updateconfig', function (req, res) {
        const query = {
            id: req.body.id
        }
        const newValue = {
            $set: {
                configname: req.body.configname,
                clientId: req.body.clientId,
                ipaddress: req.body.ipaddress,
                key: req.body.key,
                value: req.body.value
            }
        }
        db.collection('configs').updateMany(query, newValue, function (err, doc) {
            assert.equal(null, err);
            res.json({
                message: 'updated config'
            });
        });

    });

    app.delete('/config/deleteconfig/:config_id', function (req, res) {
        var configId = req.params.config_id;
        db.collection('configs').deleteMany({
            id: configId,
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