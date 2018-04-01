// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
const request = require('request-promise');
var shopifyAPI = require('shopify-node-api');
var moment = require('moment');
var Promise = require('promise');

const shopBaseUrl = 'https://' + process.env.API_KEY + ':' + process.env.PASSWORD + '@' + process.env.SHOPIFY_DOMAIN;

const newProductExpiryMinutes = 15;  
const newCollectionID = 34556182594;

app.get("/", (req, res) => {
      var Shopify = new shopifyAPI({
				  shop: process.env.SHOPIFY_DOMAIN, 
				  shopify_api_key: process.env.API_KEY, 
				  access_token:process.env.PASSWORD, 
			});
  var put_data = {
                  "collect":
                          {
                              "product_id": 640440139842,
                              "collection_id": newCollectionID
                          }
              };

  
  Shopify.get('/admin/collects/count.json?collection_id='+newCollectionID, function(err, data, headers){
    if(err){
      res.send(err);
    } else {
      var mydata = data.collects;
      res.send(data);
//       Shopify.get('/admin/products/count.json?created_at_min=2018-04-01', '', function(err, data, headers) {
      
//       });
//       var promise = new Promise(function (resolve, reject) {
// 				if(resolve){
//             Shopify.get('/admin/products.json?created_at_min=2018-04-01', function(err1, data, headers){
//             if(err){
//                 res.send(err1);
//               } else{
//                 var days = moment().subtract(10, 'days').calendar();
//                 res.send(moment(days).format('YYYY-MM-DD'));
//               }
//           });
//         } else {
      
//         }
//       });
    }
  });
  
//   Shopify.delete('/admin/collects/'+8967755006018+'.json', function(err, data, headers){
//   if(err){
//       res.send(err);
//     } else{
//       res.send(data);
//     }
// });
  
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
