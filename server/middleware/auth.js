const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('REQUEST IS THIS:', req);
  console.log('RESPONSE IS HERE:', res);

  if (!req.cookies.length) {
    models.Sessions.create()
      .then(() => {
        models.Sessions.getAll()
          .then((results) => {
            console.log('RESSSULT', results);
            req.session = {hash: results[results.length - 1].hash};
            res.cookies.shortlyid = {value: 'shortlyid=' + results.hash};
            if (Object.keys(req.cookies).length) {
              for (var rowIndex in results) {
                console.log('THIS IS THE NEW LOG', rowIndex, req.cookies);
                if (results[rowIndex].hash === req.cookies.shortlyid) {
                  req.session.hash = results[rowIndex].hash;
                  req.session.userId = results[rowIndex].userId;
                  models.Users.get({'id': results[rowIndex].userId})
                    .then((results) => {
                      console.log('disone', results);
                      req.session.user = results.username;
                    })
                    .catch((err) => {
                      console.log('****', err);
                    });
                }
              }
              next();
            } else {
              next();
            }
          })
          .catch((err) => {
            console.log('MADDDD', err);
          });
      })
      .catch((err) => {
        console.log('OUTER', err);
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

