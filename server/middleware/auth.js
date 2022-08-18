const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  if (!req.cookies.length) {
    models.Sessions.create()
      .then(() => {
        models.Sessions.getAll()
          .then((results) => {
            req['session'] = {hash: results[results.length - 1].hash};
            res.cookies.shortlyid = {value: 'shortlyid=' + results.hash};
            // models.Users.get({'id': results[results.length - 1].id})
            //   .then((results) => {
            //     console.log('disone', results);
            //     req['session']['username'] = results.username;
            //   })
            //   .catch((err) => {
            //     console.log('****', err);
            //   });
            next();
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

