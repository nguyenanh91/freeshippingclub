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
const newProductExpiryDay = 1;  
const newCollectionID = 34556182594;

function getCollectProducts (Shopify) {
  return new Promise((resolve, reject) => {
    Shopify.get('/admin/collects/count.json?collection_id='+newCollectionID, function(err, data, headers){
         if(data.count !=0){
           var products = ceil(data.count/250);
           var current_product_id_in_collection = [];
           var current_collect_id =  {};
           var loop = 0;
           for(var j=1;j<=products;j++){
               loop++;
               Shopify.get('/admin/collects.json?collection_id='+newCollectionID+'&limit=250&page='+j+'', '', function(err, collectData, headers) {
                 for(var i=0;i<collectData.collects.length;i++){
                       var pid = collectData.collects[i].product_id;
                       current_product_id_in_collection.push(collectData.collects[i].product_id);
                       current_collect_id[pid] = collectData.collects[i].id;
                 }
                  if(loop == products){return resolve({result:current_product_id_in_collection,collect:current_collect_id});}
               });
           }
         } else{
            return resolve({result:null});
         }
    });
  })
}

function getNewProducts (Shopify) {
  return new Promise((resolve, reject) => {
    Shopify.get('/admin/shop.json', function(err, shopData, headers){
        var timezone = shopData.shop.iana_timezone;
        var days = moment().subtract(newProductExpiryDay, 'd');
      
        var creatTime = moment(days).tz(timezone).format('YYYY-MM-DD');
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
                      if(loop == products){console.log('dasdsaas');return resolve({result:target_product_id_in_collection});}
                   });
               }
             } else {
                return resolve({result:null});
             }
        });
    });
  });
}

function deleteOldProducts (Shopify,Result,oldData) {
  return new Promise((resolve, reject) => {
       if(Result.missing != undefined && Result.missing.length > 0){
         var loop = 0;
         var data = Result.missing;
         for(var j=0;j<data.length;j++){
              var index = data[j];
              var pid = index.a;
              var collectId = oldData[pid];
              Shopify.delete('/admin/collects/'+collectId+'.json', function(collecterr, resdata, headers){
                 loop++;
                 sleep.sleep(1);
                 if(loop == data.length){
                   return resolve({success:true});
                 }
              });
         }
       } else {
         return resolve({success:true});
       }
  })
}

function addNewProducts (Shopify,Result) {
  return new Promise((resolve, reject) => {
       if(Result.added != undefined && Result.added.length >0){
         var loop = 0;
         var data = Result.added;
         for(var j=0;j<data.length;j++){
              var index = data[j];
              var pid = index.b;
              var putData = { "collect":
                               { "product_id": pid,"collection_id": newCollectionID }
                            };
              Shopify.post('/admin/collects.json', putData, function(posterr, adddata, headers){
                 loop++;
                 sleep.sleep(1);
                 if(loop == data.length){
                   return resolve({success:true,message:'Product(s) are added to new collection.'});
                 }
               });
         }
       } else {
         return resolve({success:true,message:'No new product is available'});
       }
  });
}


app.get("/", async (req, res) => {
     var Shopify = new shopifyAPI({
				  shop: process.env.SHOPIFY_DOMAIN, 
				  shopify_api_key: process.env.API_KEY, 
				  access_token:process.env.PASSWORD, 
			});
    try {
        const currentData = await getCollectProducts(Shopify);
        const newData = await getNewProducts(Shopify);
      console.log(currentData);
        if(currentData.result.length >0 || newData.result.length>0){
          var allResult = await arrayCompare(currentData.result, newData.result );
          console.log(allResult);
          const deleteData = await deleteOldProducts(Shopify,allResult,currentData.collect);
          const addData = await addNewProducts(Shopify,allResult);
          res.send(addData);
        } else {
          console.log('else');
          //res.send('Collection is up to date');
        }
    } catch (error) {
      console.log(error);
      res.send(error);
    }
      // getCollectProducts(Shopify).then(currentData => {
      //     getNewProducts(Shopify).then(newData => {
      //         if(currentData.result.length >0 || newData.result.length>0){
      //             var allResult = arrayCompare(currentData.result, newData.result );
      //             deleteOldProducts(Shopify,allResult,currentData.collect).then(deleteData => {
      //                 addNewProducts(Shopify,allResult).then(addData => {
      //                     res.send(addData);
      //                 }).catch(adderror => {
      //                     res.send(adderror);
      //                 });
      //             }).catch(deleteError => {
      //                 res.send(deleteError);
      //             });
      //         } else {
      //           res.send('Collection is up to date');
      //         }
      //     }).catch(newError => {
      //           res.send(newError);
      //     });
      // }).catch(currentError => {
      //       res.send(currentError);
      // });
});
// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
