require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const daysRouter = require('./day/day-router');
const mealsRouter = require('./meal/meal-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/day', daysRouter);
app.use('/api/meal', mealsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello world!' });
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'internal server error'}};
  } else {
    response = { message: error.message, error};
  }
  res.status(500).json(response);
  
});

module.exports = app;