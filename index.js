// Import express to create and configure the HTTP server.
var express = require('express');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');
var path = require('path');
// Creete a couch connector instance

// Create a HTTP server app.
var app = express();
app.set('port', (process.env.PORT || 5000));

var nodeCouchDB = require("node-couchdb");
var couch = new nodeCouchDB("localhost", 5984);
// insert a document
function insertCustomer(cust){
  couch.insert("customers", cust, function (err, resData) {
      if (err)
          return console.error(err);
      //console.dir(resData)
  });
}


// body parser is needed to parse the data from the body
var bodyParser = require('body-parser');
app.use(bodyParser());


var inputFile='Balances.csv';

var parser = parse({delimiter: ','}, function (err, data) {
  async.eachSeries(data, function (line, callback) {
    // do something with the line
    var customer = {};
    customer._id = line[0];
    customer.balance = parseInt(line[1]);
    insertCustomer(customer);
    callback();
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
