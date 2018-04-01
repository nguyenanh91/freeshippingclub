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

function getUsers () {
  return new Promise((resolve, reject) => {
      var Shopify = new shopifyAPI({
				  shop: process.env.SHOPIFY_DOMAIN, 
				  shopify_api_key: process.env.API_KEY, 
				  access_token:process.env.PASSWORD, 
			});
    Shopify.get('/admin/collects.json?collection_id='+newCollectionID+'&limit=250', function(err, data, headers){
         if(data.collects.length){
           var collectData = data.collects;
           var j = 0;
           for(var i=0;i<collectData.length;i++){
							var id = collectData[i].id;
							  Shopify.delete('/admin/collects/'+id+'.json', function(err, data, headers){
                 if(j == collectData.length){
                   return resolve(true);
                 }
                  j++;
              });
						}
         } else{
           console.log('testing');
           return resolve(true);
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
getUsers() 
  .then(users => {
    var days = moment().subtract(10, 'days').calendar();
    var creatTime = moment(days).format('YYYY-MM-DD');
    Shopify.get('/admin/products.json?created_at_min=2018-04-01&limit=250', function(err, data, headers){
      var proData = data.products;
      if(proData.length){
        for(var i=0;i<proData.length;i++){
							var id = proData[i].id;
							var putData = { "collect":
                                  {
                                      "product_id": id,
                                      "collection_id": newCollectionID
                                  }
                               };
             Shopify.post('/admin/products.json', putData, function(err, data, headers){
              console.log(data);
            });
				}
      }
            if(err){
                res.send(err);
              } else{
                res.send(data);
              }
          });  
  
  })
  .catch(err => {
    res.send(err);
  })
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
