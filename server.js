// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
const request = require('request-promise');
var shopifyAPI = require('shopify-node-api');
var moment = require('moment');
var Promise = require('promise');
var ceil = require( 'math-ceil' );

const shopBaseUrl = 'https://' + process.env.API_KEY + ':' + process.env.PASSWORD + '@' + process.env.SHOPIFY_DOMAIN;

const newProductExpiryMinutes = 1;  
const newCollectionID = 34556182594;

function getCollectProducts (Shopify) {
  return new Promise((resolve, reject) => {
    Shopify.get('/admin/collects/count.json?collection_id='+newCollectionID, function(err, data, headers){
         if(data.count !=0){
           var products = ceil(data.count/250);
           var current_product_id_in_collection = [];
           var loop = 0;
           for(var j=1;j<=products;j++){
               loop++;
               Shopify.get('/admin/collects.json?collection_id='+newCollectionID+'&limit=250&page='+j+'', '', function(err, collectData, headers) {
                 for(var i=0;i<collectData.collects.length;i++){
                       current_product_id_in_collection.push(collectData.collects[i].product_id);
                 }
                  if(loop == products){return resolve({result:current_product_id_in_collection});}
               });
           }
         } else{
            return resolve({result:null});
         }
    });
  })
}

function getNewProducts () {
  return new Promise((resolve, reject) => {
    var days = moment().subtract(newProductExpiryMinutes, 'd');
    var creatTime = moment(days).format('YYYY-MM-DD');
    Shopify.get('/admin/products/count.json?created_at_min='+creatTime, function(err, productData, headers){
         if(productData.count !=0){
           var products = ceil(productData.count/250);
           var target_product_id_in_collection = [];
           var loop = 0;
           for(var j=1;j<=products;j++){
               loop++;
               Shopify.get('/admin/products.json?created_at_min='+creatTime+'&limit=250&page='+j+'', '', function(err, proData, headers) {
                 for(var i=0;i<proData.products.length;i++){
                       target_product_id_in_collection.push(proData.products[i].id);
                 }
                  if(loop == products){return resolve({result:target_product_id_in_collection});}
               });
           }
         } else{
            return resolve({result:null});
         }
    });
  })
}


app.get("/", (req, res) => {
     var Shopify = new shopifyAPI({
				  shop: process.env.SHOPIFY_DOMAIN, 
				  shopify_api_key: process.env.API_KEY, 
				  access_token:process.env.PASSWORD, 
			});
      getCollectProducts(Shopify).then(currentData => {
        
        
          res.send(users);
        }).catch(error => {
            res.send(error);
        });

  // Shopify.get('/admin/products.json?collection_id=' + newCollectionID, '', function(chargeErr, chargeResult, headers) {
  //   res.send(chargeResult);
  // });
  // const shopRequestUrl = shopBaseUrl + '/admin/products.json?collection_id=' + newCollectionID;
  // const shopRequestUrl = shopBase
  // request.get(shopRequestUrl)
  // .then((shopResponse) => {
  //   res.end(shopResponse);
  // })
  // .catch((error) => {
  //   res.status(error.statusCode).send(error.error.error_description);
  // });
  
  //res.send('Hello World!');
})


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
