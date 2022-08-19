const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('test');
  if (!req.cookies) {
    models.Sessions.create()
      .then(() => {
        models.Sessions.getAll()
          .then((results) => {
            console.log('Auth: With Cookies');
            req.session = {hash: results[results.length - 1].hash};
            res.cookies.shortlyid = {value: 'shortlyid=' + results.hash};

            for (var rowIndex in results) {
              if (results[rowIndex].hash === res.cookies.shortlyid) {
                req.session.hash = results[rowIndex].hash;
                req.session.userId = results[rowIndex].userId;
                models.Users.get({'id': results[rowIndex].userId.toString()})
                  .then((results) => {
                    req.session.user = {username: results.username};
                    next();
                  })
                  .catch((err) => {
                    console.log('****', err);
                  });
              }
            }
            next();
          })
          .catch((err) => {
            // console.log('MADDDD', err);
          });
      })
      .catch((err) => {
        console.log('OUTER', err);
      });
  } else {
    next();
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

