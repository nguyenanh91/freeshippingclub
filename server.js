// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
const request = require('request-promise');

const shopBaseUrl = 'https://' + process.env.API_KEY + ':' + process.env.PASSWORD + '@' + process.env.SHOPIFY_DOMAIN;

app.get("/", (req, res) => {
  
  const shopRequestUrl = shopBaseUrl + '/admin/products.json';
  
  request.get(shopRequestUrl)
  .then((shopResponse) => {
    res.end(shopResponse);
  })
  .catch((error) => {
    res.status(error.statusCode).send(error.error.error_description);
  });
  
  //res.send('Hello World!');
})



// Simple in-memory store
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
]

app.get("/dreams", (request, response) => {
  response.send(dreams)
})

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", (request, response) => {
  dreams.push(request.query.dream)
  response.sendStatus(200)
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
