// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
const request = require('request-promise');
var shopifyAPI = require('shopify-node-api');

const shopBaseUrl = 'https://' + process.env.API_KEY + ':' + process.env.PASSWORD + '@' + process.env.SHOPIFY_DOMAIN;

const newProductExpiryMinutes = 15;  
const newCollectionID = 34556182594;

app.get("/", (req, res) => {
      var Shopify = new shopifyAPI({
				  shop: process.env.SHOPIFY_DOMAIN, 
				  shopify_api_key: process.env.API_KEY, 
				  access_token:process.env.PASSWORD, 
			});
  Shopify.get('/admin/products.json?collection_id=' + newCollectionID, '', function(chargeErr, chargeResult, headers) {
    res.send(chargeResult);
  });
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
