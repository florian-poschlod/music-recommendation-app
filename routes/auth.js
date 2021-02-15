const router = require("express").Router();
const User = require('../models/User.js');
const bcrypt = require('bcrypt');

// GET signup
router.get('/signup', (req, res) => {
  res.render('signup');
})

// POST signup
router.post('/signup', (req, res) => {
  const { username, password } = req.body;
  //Check, if username is empty
  if (username === '') {
    res.render('signup', { message: 'Your username cannot be empty' });
    return
  }
  //Check, if password has minumum 8 chars
  if (password.length < 8) {
    return res.render('signup', { message: 'Your password has to be 8 chars min' });
  }
  // Check if the username already exists
  User.findOne({ username: username })
    .then(userFromDB => {
      // Check, if username is already taken
      if (userFromDB !== null) {
        res.render('signup', { message: 'Username is already taken' });
      } else {
        // Add new user withcredentials to the DB
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(password, salt)

        User.create({ username: username, password: hash })
          .then(userFromDB => {
            console.log(userFromDB);
            res.redirect('/preferences');
          })
      }
    })
    .catch(err => {
      console.log(err);
    })
})

// GET login
router.get('/login', (req, res) => {
  res.render('login');
})

// POST login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check, if the entered username exists in the DB
  User.findOne({ username: username })
    .then(userFromDB => {
      if (userFromDB === null) {
        // If user doesn't exist, show login again
        res.render('login', { message: 'Invalid credentials' });
        return;
      }
      // If username exists in DB, check, if the password is correct
      if (bcrypt.compareSync(password, userFromDB.password)) {
        // console.log('user from db: ', userFromDB);
        req.session.user = userFromDB;
        console.log('req.session.user', req.session.user);
        res.redirect('/home');
      } else {
        res.render('login', { message: 'Invalid credentials' });
      }
    })
    .catch(e => {
      console.log(e);
    })
})


module.exports = router;