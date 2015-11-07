// Import express to create and configure the HTTP server.
var express = require('express');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

// Create a HTTP server app.
var app = express();


var inputFile='Balances.csv';

var parser = parse({delimiter: ','}, function (err, data) {
  async.eachSeries(data, function (line, callback) {
    // do something with the line
    console.log(line);
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
  res.send(JSON.stringify(result));
});