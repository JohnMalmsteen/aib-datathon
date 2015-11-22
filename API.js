/*
  pull in the required node modules
*/
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
  set some paramaters for the express app
*/
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*'); // null or url

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

/*
  use the router() to handle the routes
*/
var router = express.Router();

/*
  if you don't have an environment port for the process set then you can set it here, we're using 5000
*/
var port = process.env.PORT || 5000;

/*
  URL for the local mongod instance, connect to it with mongoose which will handle the models and communication with the database
*/
var url = 'mongodb://localhost:27017/datathon';
mongoose.connect(url);

/*
  pull in the customer schema
*/
var Customer = require('./app/models/customer');

var customerCount;

/*
  since we don't delete customer records ever we can set the ID to be the count +1 of the current customers
*/
Customer.count({}, function( err, count){
    customerCount = count++;
});

/*
  root get route
  returns the /views/index.html file
*/
router.get('/', function(req, res) {
   res.contentType('text/html');
   res.status(200).sendFile(path.join(__dirname + '/views/index.html'));
});

/*
  /datathon get route which returns the datathon.html view
*/
router.get('/datathon', function(req, res){
   var result = [];
   result.push({id: 0, header: "Datathon", info: "Customer Insights"});

   res.contentType('text/html');
   res.status(200).sendFile(path.join(__dirname + '/views/datathon.html'));
});

/*
  post method for the /datathon/customer route
  originally we were going to have a get all customers route for GET here as well 
  but all customers is a pretty big transfer
*/
router.route('/datathon/customer')
   .post(function(req, res) {
      var customer = new Customer();      // create a new instance of the Customer model
      customer._id = ++customerCount;
      customer.balance = req.body.balance;
      customer.income = req.body.income;
      customer.payday = req.body.payday;
      customer.age = req.body.age;
      customer.sex = req.body.sex;
      customer.county = req.body.county;
      customer.status = true;
      customer.rent_transactions = [];
      customer.transaction = [];  // set the Customers details (comes form the request)

      // save the cusotmer and check for errors
      customer.save(function(err) {
          if (err){
             res.send(err);
             customerCount--;
          }
          else{
            res.json({ message: 'Customer created!', id: customer._id  });
          }
      });

   });

/*
  GET request to get customers by ID
*/
router.route('/datathon/customer/:id').get(function(req, res) {
  // some input validation
  if (!isNaN(req.params.id)) {
    if (req.params.id > 0 && req.params.id <= customerCount) {
      Customer.findById(req.params.id, function(err, customer) {
          if (err){
            console.log(err);
            res.send(err);
          }
          else{
             res.json(customer);
          }

      });
    }
    else{
      res.send("ID must be a number between 0 and " + customerCount);
    }
  }else{
    res.send("ID must be a positive number.");
  }
});

/*
  this PUT route allows the API user to update the payday and county information of a user but could just as easily update all the other fields as well
*/
router.route('/datathon/customer/:id').put(function(req, res) {
  if (!isNaN(req.params.id)) {
    if (req.params.id > 0 && req.params.id <= customerCount) {
      // use our customer model to find the customer we want
      Customer.findById(req.params.id, function(err, customer) {

          if (err){
            res.send(err);
          }
          else{
            //  customer.balance = req.body.balance;
            //  customer.income = req.body.income;
             customer.payday =  req.body.payday;
            //  customer.age = req.body.age;
            //  customer.sex = req.body.sex;
             customer.county = req.body.county;  // update the customers info

             // save the customer
             customer.save(function(err) {
               if (err){
                 res.send(err);
               }
               else{
                res.json({ message: 'Customer updated!' });
               }
             });
          }

      });
    }
    else{
      res.send("ID must be a number between 0 and " + customerCount);
    }
  }else{
    res.send("ID must be a positive number.");
  }
 });

/*
  this togglestatus PUT route allows the API user to deactivate accounts or reactivate them, it is a boolean toggle
*/
router.route('/datathon/customer/togglestatus/:id').put(function(req, res){
  //input validation on the ID selector
  if (!isNaN(req.params.id)) {
    if (req.params.id > 0 && req.params.id <= customerCount) {
      Customer.findById(req.params.id, function(err, customer) {
        if (err){
          res.send(err);
        }
        else{
          if(customer.status === undefined){
             customer.status = false;
          }
          else{
             customer.status = !customer.status;
          } // update the customers info

          for(var transact in customer.transactions){
             if(transact.ammount === null || isNaN(transact.ammount)){
                transact.ammount = 0;
             }
          }
          // save the customer
          customer.save(function(err) {
                if (err){
                  res.send(err);
                }
                else{
                  if(customer.status === false){
                     res.json({ message: 'Customer deactivated' });
                  }
                  else{
                     res.json({ message: 'Customer reactivated' });
                  }
                }
              });
          }
    });
    }
    else{
      res.send("ID must be a number between 0 and " + customerCount);
    }
  }else{
    res.send("ID must be a positive number.");
  }

});

/*
  this DELETE route doesnt actually delete any records, although it can if you uncomment the first block and comment out the second one
  DELETING was deemed to be not dystopian enough
*/
 router.route('/datathon/customer/:id').delete(function(req, res) {
     /*Customer.remove({
         _id: req.params.id
     }, function(err, customer) {
         if (err)
             res.send(err);

         res.json({ message: 'Successfully deleted' });
     });*/

     // I decided deleting data is not really a very big brother banky thing to do.
     // keep everything forever:

     if (!isNaN(req.params.id)) {
       if (req.params.id > 0 && req.params.id <= customerCount) {
         Customer.findById(req.params.id, function(err, customer) {

            if (err){
              res.send(err);
            }
            else{
              customer.status = false;// update the customers info

               // save the customer
               customer.save(function(err) {
                      if (err){
                        res.send(err);
                      }else{
                        res.json({ message: 'Customer deactivated' });
                      }
               });
            }
        });
       }
       else{
         res.send("ID must be a number between 0 and " + customerCount);
       }
     }else{
       res.send("ID must be a positive number.");
     }

 });

/*
  This POST route adds a transaction for a user
  push more tranchactions onto the transactions array of a customer
*/
router.route('/datathon/customer/add/transaction/:id').post(function(req, res){
  if (!isNaN(req.params.id)) {
    if (req.params.id > 0 && req.params.id <= customerCount) {
      Customer.findById(req.params.id, function(err, customer) {
        if (err){
            res.send(err);
        }else{
          var date = new Date();
          customer.transactions.push({date: date, category: req.body.category, subcategory: req.body.subcategory, ammount: req.body.ammount, type: req.body.type});
          if(req.body.type === 'D' || req.body.type === 'd')
            customer.balance -= req.body.ammount;
          else
            customer.balance += req.body.ammount;
          customer.save(function(err) {
             if (err){
               res.send(err);
             }else{
               res.json({ message: 'Customer updated!' });
             }
          });
        }
      });
    }
    else{
      res.send("ID must be a number between 0 and " + customerCount);
    }
  }else{
    res.send("ID must be a positive number.");
  }

});

/*
  This POST route adds rent transactions
  rent transactions were stored in the original source data in the same way as mortgage transactions (because the bank sees it as you renting the house from them I guess)
  pushes rent_transactions onto the customer.rent_transactions array and saves it to the DB
*/
router.route('/datathon/customer/add/rent/:id').post(function(req, res){
  if (!isNaN(req.params.id)) {
    if (req.params.id > 0 && req.params.id <= customerCount) {
      Customer.findById(req.params.id, function(err, customer) {
         if (err){
           res.send(err);
         }else{
           var date =  new Date();
           customer.rent_transactions.push({rent_date: date, ammount: req.body.ammount});
           customer.balance -= req.body.ammount;
           customer.save(function(err) {
               if (err){
                 res.send(err);
               }
               else{
                 res.json({ message: 'Customer updated!' });
               }
           });
         }
      });
    }
    else{
      res.send("ID must be a number between 0 and " + customerCount);
    }
  }else{
    res.send("ID must be a positive number.");
  }
});

/*
  register our routes
  the root route could actually be changed to anything here
*/
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server listening on port ' + port);
