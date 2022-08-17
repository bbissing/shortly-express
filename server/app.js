const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');
const app = express();
const mysql = require('mysql2');

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


var db = mysql.createConnection({
  user: 'root',
  password: '',
  database: 'shortly'
});
db.connect((err) => {
  if (err) {
    console.log('Error in db connection');
  }
});


app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup',
  (req, res) => {
    models.Users.create(req.body)
      .then((results)=> {
        res.redirect('/');
      })
      .catch((err) => {
        res.redirect('/signup');
      });
  });


app.post('/login',
  (req, res) => {
    console.log('REQ BODYYYY', req.body);
    console.log('REQ', req);
    var queryString = 'SELECT password, salt FROM Users WHERE username = ?';
    var queryArgs = [req.body.username];
    db.query(queryString, queryArgs, (err, results) => {
      if (err) {
        console.log('error getting PW from Users');
      } else {
        console.log('RESSSSSSULTS', results);
        if (!results.length) {
          console.log('fail');
          res.redirect('/login');
        } else {
          var hashedPW = results[0].password;
          var salt = results[0].salt;
          if (models.Users.compare(req.body.password, hashedPW, salt)) {
            res.redirect('/');
          } else {
            console.log('incorrect attempt');
            res.redirect('/login');
          }
        }
      }
    });
  });


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
