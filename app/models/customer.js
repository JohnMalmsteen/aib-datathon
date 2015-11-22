var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
   date: Date,
   category: String,
   subcategory: String,
   ammount: Number,
   type: String
});


var RentTransactionSchema = new Schema({
   rent_date: Date,
   ammount: Number
});

var CustomerSchema = new Schema({
   _id: String,
   balance: Number,
   income: Number,
   payday: Number,
   age: Number,
   sex: String,
   county: String,
   status: Boolean,
   transactions: [TransactionSchema],
   rent_transactions: [RentTransactionSchema]
});



module.exports = mongoose.model('Customer', CustomerSchema);
