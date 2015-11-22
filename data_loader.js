/*
  pull in the necessary node modules as variables
*/
var fs = require('fs');
var parse = require('csv-parse');
var test = require('assert');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

/*
  URL for the local mongod instance
*/
var url = 'mongodb://localhost:27017/datathon';

/*
  test connect to the database
*/
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});

/*
  create an output stream writer for throwing the safe spend limits into
  note: this was only for the datathon problem and is not used in the API linked data and semantic web project.
*/
var stream = fs.createWriteStream('./data.csv', { flags: 'w',
  defaultEncoding: 'utf8',
  fd: null,
  mode: 0o666 });
  // 0o666 mode causes an error on the digital ocean server, 0666 works fine however

/*
  this function iterates through all the entries in the database and calculates their rough safe to spend limit
  done quickly just to meet the requirements of the datathon.
*/
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


/*
  database call that kicks of the safe to spend caclulation function above
*/
/*MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  findCustomer(db, function() {
      stream.end();
      db.close();

  });
});
*/

/*
  paths to the CSV files provided by AIB (they're all at top level although not pushed to github as they are quite large)
*/
var inputFile='Balances.csv';
var incomeFile='Income.csv';
var demoFile='Demographics.csv';
var rentFile='Rent.csv';
var transactFile='Transactions.csv';

/*
  setting up a customers object to use as a map to build all the customers onto fromt he various source data files
  the key will be the customer id which should be unique and then the value will be the actual customer
  I found it was much better to build them all in memory that constantly update the database with the new information as it came in
  as there were simply far too many connections issued to the database at one time 
  all of the documents get put in at once at the end as a insert many async function
*/
var customers = new Object();

/*
  parses the balances.csv file and passes the flow of control over to the next parser.
  at this point it would probably be more efficient to thread all the other parsers as their hooks to add items to will be in the customers object
  but this is not a time critical operation as it is only done once and not by a user.
  In the case of more similar datasets having to be added all the time then that would be worth doing
*/
var parser = parse({delimiter: ','}, function (err, data) {
  data.forEach(function (line) {
    // do something with the line
    var customer = {};
    customer._id = line[0];
    customer.balance = parseInt(line[1]);
    customer.status = true;
    customers[customer._id] = customer;
  });
  // kick it to the next parser
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

    // cheap and nasty regex solution to turn the date format in the csv into a proper javascript date type
    var rentDate = new Date(line[1].replace( /(\d{2})[-/](\d{2})[-/](\d+)/, "$2/$1/$3"));
    customers[line[0]].rent_transactions.push({"rent_date": rentDate, "ammount": parseInt(line[2])});
  });

  fs.createReadStream(transactFile).pipe(transactparser);
});

/*
  we're going to need an array rather than an object for the insertsion function so I instantiate it here
*/
var uploadList =[];
var transactparser = parse({delimiter: ','}, function(err, data){
  var first = true;
  data.forEach(function(line){
    if(customers[line[0]].transactions === undefined){
      customers[line[0]].transactions = [];
    }
    // the same dirty regex solution to the date problem
    var transactionDate = new Date(line[1].replace( /(\d{2})[-/](\d{2})[-/](\d+)/, "$2/$1/$3"));

    // here I solve for the extraneous commas that are in the Transaction.csv source file where there is one of the subcategories called "Newspapers, Magazines, & Books"
    if(line[4] === ' Magazines'){
      if(line[7] === 'D'){
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": "Newspapers, Magazines, & Books", "ammount": parseInt(line[6]), "type": line[7]});
      }else{
        // flip the ammount to a negative if it is a credit type transaction instead of debit
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": "Newspapers, Magazines, & Books", "ammount": parseInt(line[6]) * -1, "type": line[7]});
      }

    }
    else{
      if(line[5] === 'D'){
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": line[3], "ammount": parseInt(line[4]), "type": line[5]});
      }else{
        // flip the ammount to a negative if it is a credit type transaction instead of debit
        customers[line[0]].transactions.push({"date": transactionDate, "category": line[2], "subcategory": line[3], "ammount": parseInt(line[4]) *-1, "type": line[5]});
      }

    }
  });
  
  console.log('done - pushing to database');
  
  /*
    convert the object to an array of customers
  */
  for (var property in customers) {
      if (customers.hasOwnProperty(property)) {
         uploadList.push(customers[property]);
      }
  }

  customers = null;

  /*
    perform the insertMany on the database and print to console the number of records entered, there should be 10k
  */
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

/*
  last line of the script is the entry point, because reasons.
*/
fs.createReadStream(inputFile).pipe(parser);
