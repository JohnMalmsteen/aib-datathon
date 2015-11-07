// Import express to create and configure the HTTP server.
var express = require('express');
var fs = require('fs');
var parse = require('csv-parse');


var test = require('assert');
var path = require('path');

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

var updateCustomer = function(db, myInc, myPayDay, id, callback) {
   db.collection('customers').updateOne(
      { "_id" : id },
      {
        $set: { "income": myInc },
        $currentDate: { "payday": myPayDay }
      }, function(err, results) {
      //console.log(results);
      callback();
   });
};

// body parser is needed to parse the data from the body
var bodyParser = require('body-parser');
app.use(bodyParser());


var inputFile='Balances.csv';
var incomeFile='Income.csv';
var demoFile='Demographics.csv';
var rentFile='Rent.csv';
var transactFile='Transactions.csv';

var customers = new Object();
var parser = parse({delimiter: ','}, function (err, data) {
  data.forEach(function (line) {
    // do something with the line
    var customer = {};
    customer._id = line[0];
    customer.balance = parseInt(line[1]);
    customers[customer._id] = customer;
  });
  fs.createReadStream(incomeFile).pipe(incomeparser);
});

var incomeparser = parse({delimiter: ','}, function (err, data) {
  data.forEach(function (line) {
    // do something with the line
    customers[line[0]].income = parseInt(line[1]);
    customers[line[0]].payday = parseInt(line[2]);
  });
  fs.createReadStream(demoFile).pipe(demoParser);
});

var demoParser = parse({delimiter: ','}, function(err, data){
  data.forEach(function(line){
      customers[line[0]].age = parseInt(line[1]);
      customers[line[0]].sex = line[2];
      customers[line[0]].county = line[3];
  });

  console.log(customers["8878"]);
  fs.createReadStream(rentFile).pipe(rentparser);
});

var rentparser = parse({delimiter: ','}, function(err, data){
  data.forEach(function (line){
    if(customers[line[0]].rent_transactions === undefined){
      customers[line[0]].rent_transactions = [];
    }

    var rentDate = new Date(line[1].replace( /(\d{2})[-/](\d{2})[-/](\d+)/, "$2/$1/$3"));
    customers[line[0]].rent_transactions.push({"rent_date": rentDate, "ammount": parseInt(line[2])});
  });

  fs.createReadStream(transactFile).pipe(transactparser);
});

var uploadList =[];
var transactparser = parse({delimiter: ','}, function(err, data){
  data.forEach(function(line){
    if(customers[line[0]].transactions === undefined){
      customers[line[0]].transactions = [];
    }

    var transactionDate = new Date(line[1].replace( /(\d{2})[-/](\d{2})[-/](\d+)/, "$2/$1/$3"));

    if(line[3] === 'Magazines'){
      if(line[7] === 'D'){
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": "Newspapers, Magazines, & Books", "ammount": parseInt(line[6]), "type": line[7]});
      }else{
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": "Newspapers, Magazines, & Books", "ammount": parseInt(line[6]) * -1, "type": line[7]});
      }

    }
    else{
      if(line[4] === 'D'){
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": line[3], "ammount": parseInt(line[4]), "type": line[4]});
      }else{
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": line[3], "ammount": parseInt(line[4]) *-1, "type": line[4]});
      }

    }
  });

  console.log('done - pushing to database');
  for (var property in customers) {
      if (customers.hasOwnProperty(property)) {
        uploadList.push(customers[property]);
      }
  }
  customers = null;

  MongoClient.connect(url, function(err, db) {
  // Get the collection
    var col = db.collection('customers');
    col.insertMany(uploadList, function(err, r) {
      test.equal(null, err);
      console.log(r.insertedCount);
      // Finish up test
      db.close();
    });
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
// var ronan = {"id": 10, "name": "Ronan", "balance": 2300.23};
// var john = {"id": 11, "name": "John", "balance": 3200.32};
// customers.push(ronan);
// customers.push(john);

// ROUTES

app.get('/', function(req, res) {
  //var result = {"header": "API Homepage", "info": "Go to /datathon to access customer insights"};

  res.contentType('text/html');
  //res.status(200).json(result);
  res.status(200).sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/datathon', function(req, res) {
  var result = [];
  result.push({id: 0, header: "Datathon", info: "Customer Insights"});

  res.contentType('application/json');
  res.status(200).send(JSON.stringify(result));
});


app.get('/datathon/customer/:id', function(req, res) {
  var result;
  var found = false;
  for (var i = 0; i < customers.length; i++) {
    //console.log(parseInt(customers[i]._id));
    if (parseInt(customers[i]._id) == req.params.id) {
      result = customers[i];
      found = true;
      break;
    }
    //console.log(JSON.stringify(customers[i]));
  }

  if (found === false) {
    result = {"error": "Customer with id '" + customers[i]._id + "' not found"};
    res.status(404);
  }
  else{
    res.status(200);
  }

  // console.log(JSON.stringify(customers));
  // console.log(JSON.stringify(customer));

  res.contentType('application/json');
  res.json(result);  //send(JSON.stringify(customer));
  
  // Start the server.
  app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
