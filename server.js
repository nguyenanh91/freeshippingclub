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

function getUsers () {
  return new Promise((resolve, reject) => {
      var Shopify = new shopifyAPI({
				  shop: process.env.SHOPIFY_DOMAIN, 
				  shopify_api_key: process.env.API_KEY, 
				  access_token:process.env.PASSWORD, 
			});
    Shopify.get('/admin/collects/count.json?collection_id='+newCollectionID, function(err, data, headers){
         if(data.count !=0){
           var products = ceil(data.count/250);
           var current_product_id_in_collection = [];
           console.log(products);
           for(var j=1;j<=products;j++){
             console.log(j+' pp');
               Shopify.get('//admin/collects.json?collection_id='+newCollectionID+'&limit=250&page='+j+'', '', function(err, collectData, headers) {
                 for(var i=0;i<collectData.collects.length;i++){
                       current_product_id_in_collection.push(collectData.collects[i].product_id);
                 }
                 if(j == products){ return resolve({result:current_product_id_in_collection});}
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
      getUsers().then(users => {
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
