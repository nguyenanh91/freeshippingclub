// server.js
// where your node app starts
// init project
const express = require('express')
const app = express()
const request = require('request-promise');
var shopifyAPI = require('shopify-node-api');
var moment = require('moment-timezone');
var Promise = require('promise');
var ceil = require( 'math-ceil' );
var arrayCompare = require("array-compare");
var sleep = require('sleep');
//const shopBaseUrl = 'https://' + process.env.API_KEY + ':' + process.env.PASSWORD + '@' + process.env.SHOPIFY_DOMAIN;
const newProductExpiryMinutes = 43200; //30 days  
const newCollectionID = 56209277000;

function getCustomers (Shopify, tag) {
  return new Promise((resolve, reject) => {
    Shopify.get('/admin/customers/search.json?query='+escape(`'${tag}'`), function(err, data, headers){
         if (data.customers.length > 0){
           let return_customers = []
           data.customers.forEach(function(customer){
             let tags = customer.tags.split(',').map(item => item.trim())
             if (tags.includes(tag)) {
               return_customers.push(customer)
             }
           })
           return resolve({result: return_customers});
         } else{
            return resolve({result:[]});
         }
    });
  })
}

function getOrderByIds(Shopify, ids) {
  return new Promise((resolve, reject) => {
    Shopify.get(`/admin/orders.json?ids=${ids}`, function(err, data, headers){
        return resolve({result: data.orders})
    });
  })
}

function checkExpiredVIPCustomers(Shopify, customers, tag) {
  customers.forEach(async function(customer){
    let lastest_purchase_date = ''
    let tags = customer.tags.split(',').map(item => item.trim())
    let order_ids = []
    tags.forEach(function(t) {
      if (t != tag && t.startsWith(tag)) {
        order_ids.push(t.split(tag)[1].split('-')[1])
      }
    })
    if (order_ids.length > 0) {
      let orders = await getOrderByIds(Shopify, order_ids.join(','))
      orders.result.forEach(function(order){
        if (order.financial_status == 'paid') {
          lastest_purchase_date = lastest_purchase_date > order.processed_at ? lastest_purchase_date : order.processed_at
        }
      })
      let lastest_purchase_time = Date.parse(lastest_purchase_date)
      let expired_time = 0
      let now = Date.now()
      if (tag == '6-months-free-shipping') {
        expired_time = lastest_purchase_time + 6 * 30 * 86400000
      } else {
        expired_time = lastest_purchase_time + 12 * 30 * 86400000
      }
      if (expired_time <= now) {
        // expired => remove tag
        let new_tags = []
        tags.forEach(function(t) {
          if (!t.startsWith(tag)) {
            new_tags.push(t)
          }
        })
        Shopify.put(`/admin/customers/${customer.id}.json`, {
            "customer": {
              "tags": new_tags.join(', ')
            }
          }, function(err, data, headers){
        });
      }
    }
  })
}

app.get("/", async (req, res) => {
     var Shopify = new shopifyAPI({
				  shop: process.env.SHOPIFY_DOMAIN, 
				  shopify_api_key: process.env.API_KEY, 
				  access_token:process.env.PASSWORD, 
			});
    try {
      let customers = await getCustomers(Shopify, '12-months-free-shipping')
      if (customers.result.length > 0) {
        checkExpiredVIPCustomers(Shopify, customers.result, '12-months-free-shipping')
      }
      
      customers = await getCustomers(Shopify, '6-months-free-shipping')
      if (customers.result.length > 0) {
        checkExpiredVIPCustomers(Shopify, customers.result, '6-months-free-shipping')
      }
      res.send('Customers have been updated.');
    } catch (error) {
        res.send(error.message+' '+error.stack);
    }
});
// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
