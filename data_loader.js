var fs = require('fs');
var parse = require('csv-parse');
var test = require('assert');
var path = require('path');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/datathon';

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});

var stream = fs.createWriteStream('./data.csv', { flags: 'w',
  defaultEncoding: 'utf8',
  fd: null,
  mode: 0o666 });
  // 0o666 mode causes an error on the digital ocean server, 0666 works fine however

var findCustomer = function(db, callback) {
   var cursor =db.collection('customers').find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc !== null) {
        result = doc;
        var latest = new Date();
        var currentDate = new Date(2015, 12, 2, 0, 0, 0, 0);
        var spendLim = result.balance;
        var first = true;
        var lastRent;
        for(var property in result.rent_transactions){
          if (first){
            latest = result.rent_transactions[property].rent_date;
            lastRent = result.rent_transactions[property].ammount;
            first = false;
          }else{
            if (Date.parse(result.rent_transactions[property].rent_date) > Date.parse(latest)){
              latest = result.rent_transactions[property].rent_date;
              lastRent = result.rent_transactions[property].ammount;
            }
          }
        }
        if(latest.getDate() > 2 && latest.getDate() < result.payday){
          spendLim -= lastRent;
        }
        var timeTilPayDay;
        if(result.payday > 2){
          timeTilPayDay = result.payday - 2;
        }
        else {
          timeTilPayDay = 30-2;
        }
        var oldest;
        var newest;
        var total = 0;
        first = true;
        for(var property in result.transactions){
          if(first){
            oldest = result.transactions[property].date;
            newest = result.transactions[property].date;
            first = false;
          }else{
            if(Date.parse(result.transactions[property].date) < Date.parse(oldest)){
              oldest = result.transactions[property].date;
            }

            if(Date.parse(result.transactions[property].date) > Date.parse(newest)){
              newest = result.transactions[property].date;
            }

          }

          if(!isNaN(result.transactions[property].ammount))
            total += result.transactions[property].ammount;
        }


        var numberofdays = (Date.parse(newest) - Date.parse(oldest))/(1000*60*60*24);

        var spendperday = total/numberofdays;

        spendLim -= (spendperday * timeTilPayDay);

        spendLim *= 0.7;
        if(isNaN(spendLim) || spendLim === Infinity)
        {
          spendLim = 500;
        }
        console.log(result._id);
        stream.write(result._id + ", " + spendLim + '\n');
      } else {
        callback();
      }
   });

};



/*MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  findCustomer(db, function() {
      stream.end();
      db.close();

  });
});
*/

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
    customer.status = true;
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
  var first = true;
  data.forEach(function(line){
    if(customers[line[0]].transactions === undefined){
      customers[line[0]].transactions = [];
    }

    var transactionDate = new Date(line[1].replace( /(\d{2})[-/](\d{2})[-/](\d+)/, "$2/$1/$3"));

    if(line[4] === ' Magazines'){
      if(line[7] === 'D'){
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": "Newspapers, Magazines, & Books", "ammount": parseInt(line[6]), "type": line[7]});
      }else{
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": "Newspapers, Magazines, & Books", "ammount": parseInt(line[6]) * -1, "type": line[7]});
      }

    }
    else{
      if(line[5] === 'D'){
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": line[3], "ammount": parseInt(line[4]), "type": line[5]});
      }else{
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": line[3], "ammount": parseInt(line[4]) *-1, "type": line[5]});
      }

    }
  });
  var first = true;
  console.log('done - pushing to database');
  for (var property in customers) {
      if (customers.hasOwnProperty(property)) {
         uploadList.push(customers[property]);
      }
  }
  customers = null;

  console.log(uploadList.length);
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

// THIS LINE READS IN THE DATABASE
fs.createReadStream(inputFile).pipe(parser);
