// Import express to create and configure the HTTP server.
var express = require('express');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');
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

app.get('/datathon', function(req, res) {
  var result = [];
  result.push({id: 0, header: "Datathon", info: "Customer Insights"});

  res.contentType('application/json');
  res.status(200).send(JSON.stringify(result));
});

app.get('/datathon', function(req, res) {
  var result = [];
  result.push({id: 0, header: "Datathon", info: "Customer Insights"});

  res.contentType('application/json');
  res.status(200).send(JSON.stringify(result));
});

// Start the server.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
