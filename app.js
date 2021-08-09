const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const debug = require('debug')('leaderboard_backend:dev');
const cors = require('cors');
const express = require('express');
const app = express();
const middlewareSettings = require('./utils/middlewareSettings');
const mongoose = require('mongoose');
const db = require('./db');


// routes
const player = require('./routes/player');

// initiate models
const connection = db.createConnection(mongoose);
const models = require('./models/index')(connection, mongoose);

// connect mongodb
connection.on('connected', async () => {
  debug('CONNECTED TO DB SUCCESSFULY')

  // first time populate
  await db.populateDB(models.Player, 'Player')(100000, 1);
});

connection.on('error', (err) => {
  debug('DB ERROR: %O', err);
})

// set informations
app.set('connection', connection);

app.use((req, res, next) => {
  req.connection = connection;
  next();
})

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(middlewareSettings.corsOptions));

// route middlewares
app.use('/api/players', player);

// 404 not found error
app.use((req, res, next) => {
  const error = new Error('Not found!');
  error.status = 404;
  next(error);
})

// error handler
app.use((err, req, res, next) => {
  debug('Express Error Handler: %O', err);
  res.status(err.status || 500);
  res.send('error')
})


module.exports = app;
