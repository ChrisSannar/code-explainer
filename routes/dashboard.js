// Handles dashboard operations (mostly users)
var express = require('express');
var router = express.Router();
const path = require('path');
const auth = require(path.join(__dirname, '..', 'middleware', 'auth'));

// Our mongoose connection to the database, set up when we declare the router
let mongooseConnection;
let Users;

router.use(auth.cookieChecker);

/***

router.post('/new-user', function (req, res, next) {
  // res.json(temp);
  if (mongooseConnection) {
    let newUser = new Users(req.body);
    newUser.save()
      .then(result => res.status(200).json(result._id))
      .catch(err => res.status(500).json(err));
  } else {
    res.status(500).send('Mongoose has not established a connection');
  }
})

// ***/

router.get('/login', auth.redirectIfSignedIn, function (req, res, next) {
  res.status(200).sendFile(path.join(__dirname, '..', 'dashboard', 'login.html'))
});

// Attempting to login
router.post('/login', function (req, res, next) {
  let body = req.body;

  // Make sure the user exists in the first place
  Users.findOne({ email: body.email })
    .then((user) => {

      // If no user, then redirect
      if (!user) {
        res.redirect('/dashboard/login');
      } else {
        user.comparePassword(body.password, function (err, passing) {
          if (err) return next();
          if (passing) {
            req.session.user = Object.assign({}, user); // Set the session with the user
            res.redirect('/dashboard');
          } else {
            return res.redirect('/dashboard/login');
          }
        });
      }

    }).catch(err => {
      res.status(400).json(err);
    });

});

router.get('/logout', function (req, res, next) {
  if (req.session.user) {
    res.clearCookie('user_sid');
    res.status(200).send('OK');
  } else {
    res.redirect('/dashboard/login');
  }
})

router.post('/new-password', function (req, res, next) {
  // Only allow this when while we're in a session
  // if (req.session.user && req.cookies.user_sid) {
  let { email, newPassword, oldPassword } = req.body; // Extract all our data from the body

  // Get the user we're looking for
  Users.findOne({ email: email })
    .then(user => {
      // // Make sure the old password matches
      user.comparePassword(oldPassword, function (err, pass) {
        if (err) return next();

        // If they do, then update it
        if (pass) {
          user.updateOne({ password: newPassword })
            .then(result => {
              res.status(200).send('OK');
            })
            .catch(err => {
              return res.status(500).send('Failed to Hash Password'); // This shouldn't happen...
            });
        } else {
          return res.status(401).send('Incorrect Old Password');
        }
      });
    })
    .catch(err => {
      return res.status(404).send('Could Not Find User');
    });
  // } else {
  //   return res.status(401).send('Unauthroized to Change Passwords');
  // }
});

router.get('/', auth.signedInChecker, function (req, res, next) {
  res.status(200).sendFile(path.join(__dirname, '..', 'dashboard', 'index.html'));
});

// Server the files statically for any other routes
router.use(express.static('dashboard'));

// Pass in the connection and 
module.exports = function (connection) {
  mongooseConnection = connection;
  Users = require(path.join(__dirname, '..', 'models', 'user.schema'))(mongooseConnection);
  return router;
}