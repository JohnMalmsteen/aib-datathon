var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
    _id: String,
    balance: Number,
    income: Number,
    payday: Number,
    age: Number,
    sex: String,
    county: String,
    rent_transactions: [{
      rent_date: Date,
      ammount: Number
   }],
   transactions: [{
      date: Date,
      category: String,
      subcategory: String,
      ammount: Number,
      type: String
   }]
});

module.exports = mongoose.model('Customer', CustomerSchema);
