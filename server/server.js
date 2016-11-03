require('dotenv').config({silent: true});
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const api = require('./routes/api');
const auth = require('./routes/auth');
const path = require('path');
const config = require('../config');
const passport = require('./passportConfig');
const bodyParser = require('body-parser');

const app = express();

// Don't enable CORS in production.
if (/^(dev|test)$/.test(process.env.NODE_ENV)) {
  app.use(cors());
}
if (process.env.NODE_ENV !== 'test') {
  // Don't log requests during testing
  app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/', express.static(path.join(__dirname, '../client/build')));

app.use('/api', api);
app.use('/auth', auth);

app.use('*', (request, response) => {
  if (request.xhr || request.headers.accept.indexOf('json') > -1) {
    // request is an API request; respond with 404
    return response.sendStatus(404);
  }
  // request probably came from browser; send back index page and let React client handle
  return response.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`Server listening on port: ${port}`);
module.exports = app;
