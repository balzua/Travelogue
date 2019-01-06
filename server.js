const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const tripRouter = require('trips/router');

//Mongoose promise fix
mongoose.Promise = global.Promise;

//Important configuration information
const {PORT, DATABASE_URL} = require('./config');

//Express app, logging middleware, static asset middleware
const app = express();
app.use(morgan('common'));
app.use(express.static('public'));
let server;

//Routers
app.use('/trips', tripRouter);

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
        if (err) {
            return reject(err);
        }
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        })
        .on('error', err => {
            mongoose.disconnect();
            reject(err);
        });
    });
});
}

function closeServer() {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          reject(err);
          // so we don't also call `resolve()`
          return;
        }
        resolve();
      });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { runServer, app, closeServer };