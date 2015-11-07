// Import express to create and configure the HTTP server.
var express = require('express');
var fs = require('fs');
var parse = require('csv-parse');

var test = require('assert');

var path = require('path');

// Creete a couch connector instance

// Create a HTTP server app.
var app = express();
app.set('port', (process.env.PORT || 5000));

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/datathon';

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});


// body parser is needed to parse the data from the body
var bodyParser = require('body-parser');
app.use(bodyParser());


var inputFile='Balances.csv';
var customers = [];
var parser = parse({delimiter: ','}, function (err, data) {
  data.forEach(function (line) {
    // do something with the line
    var customer = {};
    customer._id = line[0];
    customer.balance = parseInt(line[1]);
    customers.push(customer);
  });

  MongoClient.connect(url, function(err, db) {
  // Get the collection
    var col = db.collection('customers');
    col.insertMany(customers, function(err, r) {
      test.equal(null, err);
      console.log(r.insertedCount);
      // Finish up test
      db.close();
    });
  });
});


var incomeparser = parse({delimiter: ','}, function (err, data) {
  data.forEach(function (line) {
    // do something with the line
    var customer = {};
    customer._id = line[0];
    customer.income = parseInt(line[1]);
    customer.payday = parseInt(line[2]);
    for(i = 0; i < 100000; i++){

    }
    updateCustomer(customer._id, customer.income, customer.payday);
  });
});

fs.createReadStream(inputFile).pipe(parser);

// middleware:
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'null'); // null or url

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.set('view engine', 'jade');

// MOCK DATA
var customers = [];
var customer;
var ronan = {"id": 10, "name": "Ronan", "balance": 2300.23};
var john = {"id": 11, "name": "John", "balance": 3200.32};
customers.push(ronan);
customers.push(john);

// ROUTES

app.get('/', function(req, res) {
  //var result = {"header": "API Homepage", "info": "Go to /datathon to access customer insights"};

  res.contentType('text/html');
  //res.status(200).json(result);
  res.status(200).sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/datathon', function(req, res) {
  //var result = {"header": "Datathon", "info": "Customer Insights", "usage": "/datathon/:id = get user info by id"};

  res.contentType('text/html');
  res.status(200).sendFile(path.join(__dirname + '/views/datathon.html'));
});

app.get('/datathon/customer', function(req, res) {
  res.contentType('application/json');
  res.status(200).json(customers);
});

app.get('/datathon/customer/:id', function(req, res) {
  for (var i = 0; i < customers.length; i++) {
    if (customers[i].id == req.params.id) {
      customer = customers[i];
      break;
    }
    //console.log(JSON.stringify(customers[i]));
  }

  // console.log(JSON.stringify(customers));
  // console.log(JSON.stringify(customer));

  res.contentType('application/json');
  res.status(200).json(customer);  //send(JSON.stringify(customer));
});

// Start the server.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
