// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
const request = require('request-promise');

const shopBaseUrl = 'https://' + process.env.API_KEY + ':' + process.env.PASSWORD + '@' + process.env.SHOPIFY_DOMAIN;

const newProductExpiryMinutes = 15;  
const newCollectionID = 34556182594;

app.get("/", (req, res) => {
  
  const shopRequestUrl = shopBaseUrl + '/admin/products.json?collection_id=' + newCollectionID;
  const shopRequestUrl = shopBase
  request.get(shopRequestUrl)
  .then((shopResponse) => {
    res.end(shopResponse);
  })
  .catch((error) => {
    res.status(error.statusCode).send(error.error.error_description);
  });
  
  //res.send('Hello World!');
})


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
