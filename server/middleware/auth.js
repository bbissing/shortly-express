const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // different format values coming in
  if (req.cookies && Object.keys(req.cookies).length) {
    if (req.cookies.shortlyid.includes('=')) {
      var currentHash = req.cookies.shortlyid.split('=')[1];
    } else {
      var currentHash = req.cookies.shortlyid;
    }
    // verify that the cookie is valid (i.e., it is a session that is stored in your database).
    models.Sessions.get({hash: currentHash})
      .then((results) => {
        // looks up the user data related to that session,
        // and assigns an object to a session property on the request that contains relevant user information.
        if (results.user) {
          req.session = {userId: results.userId, hash: currentHash, user: {username: results.user.username}};
        } else {
          req.session = {userId: results.userId, hash: currentHash};
        }
        next();
      })
      // If an incoming cookie is not valid, what do you think you should do with that session and cookie?
      // clears and reassigns a new cookie if there is no session assigned to the cookie
      .catch((err) => {
        models.Sessions.create()
          .then((results) => {
            models.Sessions.getAll()
              .then((results) => {
                var newHash = results[results.length - 1].hash;
                res.cookies.shortlyid = 'shortlyid=' + newHash;
                next();
              });
          });
      });
  } else {
    // generate a session with a unique hash and store it the sessions database.
    models.Sessions.create()
      .then((results) => {
        models.Sessions.get({id: results.insertId})
          .then((results) => {
            var newHash = results.hash;
            // use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).
            res.cookie('shortlyid', newHash);
            // according to test: add session to request ?
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

