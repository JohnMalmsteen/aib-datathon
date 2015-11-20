var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

var router = express.Router();

var port = process.env.PORT || 8080;

var url = 'mongodb://localhost:27017/datathon';
mongoose.connect(url);


var Customer = require('./app/models/customer');


router.get('/', function(req, res) {
   res.contentType('text/html');
   res.status(200).sendFile(path.join(__dirname + '/views/index.html'));
});

router.get('/datathon', function(req, res){
   var result = [];
   result.push({id: 0, header: "Datathon", info: "Customer Insights"});

   res.contentType('text/html');
   res.status(200).sendFile(path.join(__dirname + '/views/datathon.html'));
});

router.route('/datathon/customer')
   .post(function(req, res) {
      var customer = new Customer();      // create a new instance of the Customer model
      customer._id = req.body._id;
      customer.balance = req.body.balance;
      customer.income = req.body.income;
      customer.payday = req.body.payday;
      customer.age = req.body.age;
      customer.sex = req.body.sex;
      customer.county = req.body.county;
      customer.rent_transactions = [];
      customer.transaction = [];  // set the Customers details (comes form the request)

      // save the cusotmer and check for errors
      customer.save(function(err) {
          if (err)
             res.send(err);

          res.json({ message: 'Customer created!' });
      });

   });

router.route('/datathon/customer/:id').get(function(req, res) {
     Customer.findById(req.params.id, function(err, customer) {
         if (err)
             res.send(err);
         res.json(customer);
     });
});

router.route('/datathon/customer/:id').put(function(req, res) {

     // use our customer model to find the customer we want
     Customer.findById(req.params.bear_id, function(err, customer) {

         if (err)
             res.send(err);

         customer.balance = req.body.balance;
         customer.income = req.body.income;
         customer.payday =  req.body.payday;
         customer.age = req.body.age;
         customer.sex = req.body.sex;
         customer.county = req.body.county;  // update the customers info

         // save the customer
         customer.save(function(err) {
             if (err)
                 res.send(err);

             res.json({ message: 'Customer updated!' });
         });

     });
 });

 router.route('/datathon/customer/:id').delete(function(req, res) {
     Customer.remove({
         _id: req.params.id
     }, function(err, customer) {
         if (err)
             res.send(err);

         res.json({ message: 'Successfully deleted' });
     });
 });

app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
