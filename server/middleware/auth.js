const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  if (req.cookies && Object.keys(req.cookies).length) {
    var currentHash = req.cookies.shortlyid.split('=')[1];
    // verify that the cookie is valid (i.e., it is a session that is stored in your database).
    models.Sessions.get({hash: currentHash})
      .then((results) => {
        console.log('Results', results);
        // looks up the user data related to that session,
        // and assigns an object to a session property on the request that contains relevant user information.
        req.session = {userId: results.userId, hash: currentHash};
        next();
      })
      // If an incoming cookie is not valid, what do you think you should do with that session and cookie?
      .catch((err) => {
        console.log('Idk yet', err);
      });
  } else {
    // generate a session with a unique hash and store it the sessions database.
    models.Sessions.create()
      .then(() => {
        models.Sessions.getAll()
          .then((results) => {
            var newHash = results[results.length - 1].hash;
            // use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).
            res.cookies = {shortlyid: {value: 'shortlyid=' + newHash}};
            // according to test: add session to request
            req.session = {hash: newHash};
            next();
          })
          .catch((err) => {
            console.log('THIS ONE', err);
          });
      })
      .catch((err) => {
        console.log('DISSSS ONE', err);
      });
  }
};


/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

