# Calorie Counter API

The server for Calorie counter app.

## Fetch requests

Base URL: https://calm-citadel-38607.herokuapp.com/api

### /day

GET - returns lists of days on server.

POST - adds a new list of days to the server.

### /meal

GET - returns lists of meals on server.

POST - adds a new list of meals to the server.


### /meal/:meal_id

GET- return a specific meal with details related to the meal

DELETE- lets you delete meals on the server.

## Technology used

Technology used
This application was built with Node.js, Express, Knex, and many smaller libraries to help with specific functions like security, authorization, etc.

To install locally
1 .Clone github repo to your machine
2. Run command 'npm install' to install dependencies locally
3. Run command 'npm run dev' to start up server locally
