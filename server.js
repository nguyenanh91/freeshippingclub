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

function getTimeZone(Shopify) {
  return new Promise((resolve, reject) => {
    Shopify.get('/admin/shop.json', function(err, data, headers){
      return resolve(data.shop.iana_timezone)
    })
  })
}

function getCustomers (Shopify, tag, page = 1) {
  return new Promise((resolve, reject) => {
    let return_customers = []
    
    Shopify.get('/admin/customers/search.json?query='+escape(`'${tag}'`)+`&limit=250&page=${page}`, function(err, data, headers){
       if (data.customers.length > 0){
         data.customers.forEach(function(customer){
           let tags = customer.tags.split(',').map(item => item.trim())
           if (tags.includes(tag)) {
             return_customers.push(customer)
           }
         })
       }
       return resolve({result: return_customers})
    })
  })
}

function getOrderByIds(Shopify, ids) {
  return new Promise((resolve, reject) => {
    Shopify.get(`/admin/orders.json?ids=${ids}`, function(err, data, headers){
        return resolve({result: data.orders})
    });
  })
}

function checkExpiredVIPCustomers(Shopify, customers, tag, timeZone) {
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
      let lastest_purchase_time = moment.tz(lastest_purchase_date, timeZone).utc().valueOf()
      let expired_time = 0
      let now = moment.utc().valueOf()
      
      if (tag == '6-months-free-shipping') {
        //expired_time = lastest_purchase_time + 6 * 30 * 86400000
        expired_time = lastest_purchase_time + 6 * 60 * 1000
      } else {
        //expired_time = lastest_purchase_time + 12 * 30 * 86400000
        expired_time = lastest_purchase_time + 12 * 60 * 1000
      }
      if (expired_time && expired_time <= now) {
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
      let timeZone = await getTimeZone(Shopify)
      let page = 1
      let customers = []
      let cus = null
      do {
        cus = await getCustomers(Shopify, '12-months-free-shipping', page++)
        customers = customers.concat(cus.result)
      } while (cus.result.length > 0)
      if (customers.length > 0) {
        checkExpiredVIPCustomers(Shopify, customers, '12-months-free-shipping', timeZone)
      }
      
      page = 1
      customers = []
      cus = null
      do {
        cus = await getCustomers(Shopify, '6-months-free-shipping', page++)
        customers = customers.concat(cus.result)
      } while (cus.result.length > 0)
      if (customers.length > 0) {
        checkExpiredVIPCustomers(Shopify, customers, '6-months-free-shipping', timeZone)
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
