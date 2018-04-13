What this app does?
===================
This is a Shopify private app.

It adds products created within 30days into a collection and removes products from the collection that are older than 30days

It is built for using only on one Shopify Store



Setup
=====

Step 1 - Edit .env file

1. API_KEY
2. PASSWORD
3. SHOPIFY_DOMAIN="weightlessno.myshopify.com"

Note - When you create a private app on shopify you will be given the API_KEY and PASSWORD.


Step 2 - Edit server.js file

const newProductExpiryMinutes = 43200; //30 days  
const newCollectionID

newCollectionID is the collection id that you would like this app to automatically update.


Execution
=========
Every time you run this url on browser: https://cautious-yew.glitch.me/ it will trigger this app to refresh the collection.

You do not want to run this url every few minutes by yourself.  The easiest way is to register a scheduler fro https://cron-job.org to run this url every 3-5 minutes.


