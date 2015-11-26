# Banking-API
###### Parses data from the AIB DataHack competition and displays it in a consumable RESTful API
**by Ronan Connolly & John Frizzell**  

![Money Banner](http://www.nosytourist.com/image/IranMoeny-img00.jpg "Money Banner")

Contents:
---------
1. About
2. Datasets used
3. How to Query the API
4. Example use of the API
5. Tools & Environment used
6. Installation
7. API Extension
8. References
9. Team

1 - About
---
The aim of this project is to showcase the use of a node api using five datasets given by AIB during the [AIB Datahack competition](https://www.aibdatahack.com/) on the 7th of November.
The [project](https://gist.github.com/ianmcloughlin/53d5f1655bc276373625) is for Dr Ian Mc'Loughlin, Semantic Web & Linked Data Module, GMIT.    

We chose this project due to the fact that it is based on a real scenario and the datasets are quite substantial and representational of real datasets.  

Banking is of huge importance in society, the more insight we can get into our banking data the better we can manage it.  

Our Banking-API parses the datasets with MongoDB into customer objects that can then be displayed in various ways via node/express routes in a self describing RESTful manner.  

#### Front-end & Back-end

We created our own back-end api to host the data to be consumed by this web app.  
Both the front-end web app and the back-end api are hosted on different servers.  
For information on the front-end web-app refer to the web-app github repository:   [Customer-Insights Web App](https://github.com/RonanC/customer-insights).  

The front end (web app) is hosted on heroku:  
[http://customer-insights.herokuapp.com/](http://customer-insights.herokuapp.com/)  

The back end (api) is hosted on digital ocean:  
[http://178.62.9.141:5000/](http://178.62.9.141:5000/)  


2 - Datasets used
---
We recieved the data from AIB during the [AIB Datahack competition](https://www.aibdatahack.com/) on the 7th of November.

The banking-api that we are consuming has much data.
We combined five csv files into a JSON object via MongoDB.
We tried couch initially but we had queue errors to the vast amount of data being processed.

**Balances:**  
10'001 rows  

**Income:**  
10'001 rows  

**Demographics:**  
10'001 rows  

**Rent:**   
158'923 rows  

**Transactions:**  
5'067'090 rows    


3 -  How to Query the API
---
It's a RESTful api with self-describing urls.  
With which you can use the GET, PUT, POST and DELETE HTTP verbs on to do various actions.  
When the urls are queried a JSON object will be passed back.  



### Routes
Route | HTTP Method | Description | Body
---------|------------|------------|------------
/ | GET | basic api response html page
/datathon/ | GET | basic instruction html page |
/datathon/customer/ | POST | a new customer. | {balance: Number, income: Number, payday: Number, age: Number, sex: String, county: String}
/datathon/customer/:id | GET | returns a customer by given id |
/datathon/customer/:id | PUT | update a customer by id | {payday: Number,county: String}
/datathon/customer/:id | DELETE | deactivates accounts |
/datathon/customer/togglestatus/:id | PUT | Deactivate or Reactivate a customer account |
/datathon/customer/add/transaction/:id | POST | add a new transaction to the customers transaction list | {category: String,subcategory: String,ammount: Number,type: String}
/datathon/customer/add/rent/:id | POST | add a new rent transaction to a customers | {ammount: Number}
/datathon/categories | GET | returns all categories and subcategories |

4 - Example use of the API
---
### Basic website message  
**req**  
```
datathon/  
```
**res**  
```html
Welcome to our api website
```

### Basic api message  
**req**  
```
datathon/  
```
**res**  
```html
Welcome to the datathon api
```

### Retrieves all customers (without transactions or rent)  
**req**  
```
datathon/customer  
```
**res**  
```json
[{"_id":"34","balance":1500,"status":"open","income":2500,"payday":20,"age":33,"sex":"F","county":"CORK"}, {"_id":"23","balance":6000,"status":"open","income":1250,"payday":21,"age":34,"sex":"F","county":"CARLOW"}, {"_id":"3434","balance":2500,"status":"open","income":2500,"payday":20,"age":51,"sex":"F","county":"CORK"}, {"_id":"1212","balance":4500,"status":"open","income":2750,"payday":21,"age":36,"sex":"M","county":"DUBLIN"}]
```

### Retrieves all categories  
**req**  
```
datathon/categories  
```
**res**  
```json
[{"id":"0","name":"Auto","sub":[{"name":"Auto Other"},{"name":"Car park & Tolls"},{"name":"Maintenance/Service & Parts"},{"name":"Motor rescue"},{"name":"Petrol/fuel"}]},{"id":"1","name":"Bills & Utilities","sub":[{"name":"Bills & Utilities Other"},{"name":"Cable/Satellite TV & Internet"},{"name":"Telephone/Mobile"}]},{"id":"2","name":"Family","sub":[{"name":"Childcare"},{"name":"School/College Fees"}]},{"id":"3","name":"Finance & Banking","sub":[{"name":"Finance & Banking Other"}]},{"id":"4","name":"Health & Personal Care","sub":[{"name":"Alternative Health"},{"name":"Dental care"},{"name":"Doctor"},{"name":"Hair & Beauty"},{"name":"Health & Personal Care Other"},{"name":"Hospital"},{"name":"Optician"},{"name":"Pharmacy"}]},{"id":"5","name":"Household/Home","sub":[{"name":"Computers & technology"},{"name":"DIY/Home Improvement"},{"name":"Electrical Goods"},{"name":"Garden"},{"name":"Household & Home Other"},{"name":"Household Maintenance"},{"name":"Textiles & Furnishings"}]},{"id":"6","name":"Insurance","sub":[{"name":"Insurance"}]},{"id":"7","name":"Leisure & Entertainment","sub":[{"name":"Bars & Clubs"},{"name":"Cinema & Theatre"},{"name":"Club Memberships"},{"name":"Food & Dining"},{"name":"Gaming"},{"name":"Leisure & Entertainment Other "},{"name":"Music"},{"name":"Newspapers"}]},{"id":"8","name":"Miscellaneous","sub":[{"name":"Charities & Donations"},{"name":"Legal"},{"name":"Miscellaneous Other"},{"name":"Postage/Courier"},{"name":"Professional Services"},{"name":"Stationary & Printing"},{"name":"Subscriptions"}]},{"id":"9","name":"Pets","sub":[{"name":"Pet shop"},{"name":"Veterinary"}]},{"id":"10","name":"Shopping","sub":[{"name":"Catalogue shopping"},{"name":"Clothing & Accessories"},{"name":"Department Store"},{"name":"Groceries"},{"name":"Online Shopping"},{"name":"Shopping Other "},{"name":"Sporting"},{"name":"Toys & Games"}]},{"id":"11","name":"Tax","sub":[{"name":"Tax"}]},{"id":"12","name":"Travel/Transportation","sub":[{"name":"Air Travel"},{"name":"Hotel/Lodging"},{"name":"Public Transport"},{"name":"Taxi"},{"name":"Travel & Transportation Other"},{"name":"Travel Agencies"},{"name":"Vehicle rental"}]},{"id":"13","name":"Withdrawals & Transfers","sub":[{"name":"ATM"},{"name":"Cash Advance"},{"name":"Transfer"}]}]
```

### Specific api query  
**req**   
```
/datathon/customer/3    
```
**res**  
```json
{"_id":"34","balance":1500,"status":true,"income":2500,"payday":20,"age":33,"sex":"F","county":"CORK","rent_transactions":[{"rent_date":"2015-05-24T23:00:00.000Z","ammount":700},{"rent_date":"2015-08-23T23:00:00.000Z","ammount":700},{"rent_date":"2015-02-23T00:00:00.000Z","ammount":700},{"rent_date":"2015-03-23T00:00:00.000Z","ammount":700},{"rent_date":"2014-08-24T23:00:00.000Z","ammount":700},{"rent_date":"2014-11-24T00:00:00.000Z","ammount":700},{"rent_date":"2014-09-22T23:00:00.000Z","ammount":700},{"rent_date":"2015-09-22T23:00:00.000Z","ammount":700},{"rent_date":"2014-10-22T23:00:00.000Z","ammount":700},{"rent_date":"2015-07-22T23:00:00.000Z","ammount":700},{"rent_date":"2014-07-22T23:00:00.000Z","ammount":700},{"rent_date":"2015-04-22T23:00:00.000Z","ammount":700},{"rent_date":"2015-06-22T23:00:00.000Z","ammount":700},{"rent_date":"2015-10-22T23:00:00.000Z","ammount":700},{"rent_date":"2014-12-23T00:00:00.000Z","ammount":700},{"rent_date":"2015-01-23T00:00:00.000Z","ammount":700}]}
```

### Specific api query (error)  
**req**   
```
/datathon/customer/e2    
```
**res**  
```html
ID must be a positive number.
```


5 - Tools & Environment used
---
### API  
 - Created the web service with node and express
 - Used the express router to manage the routes
 - MongoDB database
 - mongoose.js to provide interaction with Mongo through a model - controller pattern
 - Deployed to [DigitalOcean](https://www.digitalocean.com/)
 - Used datasets as listed above from the AIB DataHack competition


6 - Installation
---
### Dependencies  
Once you have cloned the git repo, you need to run the 'npm install' command.  
This will install all the depencies that are listed in the package.json file.
```sh
$ npm install
```

### Notes:
The first time you run this program you need to have the CSV files in the folder.  

You then uncomment line number 265 in the data_loader.js script: "//fs.createReadStream(inputFile).pipe(parser);"  

Run the data_loader.js with the flag: "--max_old_space_size=2000000"  
as the size of the transaction.csv file leads to process out of memory GC errors.

```sh
$ node --max_old_space_size=2000000 data_loader.js
```

Once loaded into MongoDB you can export the datathon database and import it on your server.  

The API that serves up the data is run without any flags:
```sh
$ node API.js
  ```

7 - API Extension 
---
###"Safe to Spend" balance  
During the AIB Datathon we calculated each customers (10'000) safe to spend balance based on how much they earn, when they get paid, how much they usually spend during each month and other factors.
We intend to create a route and serve this data.
We also intend to have this "Safe to Spend" balance be dynamic, so that new transactions and customer updates change the result.

###Demographic Insights  
We intend to have data analytic algorithms to calculate different customer demographics based on different input parameters like:
- Age
- County
- Sex
- Income
- Payday
- Balance

This feature will turn the data into information.  

#####An Example might be:
Show me the average balance of  
customers by county  
who are between the age of 20 to 30.  

8 - References
---
- We relied heavily on the documentation websites for [Node](https://nodejs.org/api/), [Express](http://expressjs.com/api.html) and [Mongo](https://docs.mongodb.org/manual/).  
- Also useful for learning the mongoose structure was this [blog](https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4).

9 - Team
---
This project was created by Ronan Connolly & John Frizzell,  
Software Development students in fourth year, term 1, GMIT  
for the Semantic Web & Linked Data Module.  

<a href="https://github.com/RonanC"><img src="https://github.com/RonanC/DodgySpike/blob/master/PromoImages/Ronan.png" width="100px" height="100px" title="Ronan" alt="Ronan Image"/></a> <a href="https://github.com/JohnMalmsteen"><img src="https://avatars1.githubusercontent.com/u/7085486?v=3&s=400" width="100px" height="100px" title="Ronan" alt="Ronan Image"/></a>
