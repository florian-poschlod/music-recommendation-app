const router = require("express").Router();
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const SpotifyWebApi = require('spotify-web-api-node');


const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));


// Check permission
function checkPermission(req, res, id) {
  if (req.session.user === undefined) {
    console.log('User not registered')
    res.redirect('/')
  }
  else if (req.session.user._id === id) {
    //console.log(id)
    return true;
    res.render('home', { id });
  }
  else {
    console.log('User not logged in.')
    res.redirect('/')
  }
}


// GET signup
router.get('/signup', (req, res) => {
  res.render('signup');
})


// GET login
router.get('/login', (req, res) => {
  res.render('login');
})


// GET preferences
router.get('/preferences/:id', (req, res) => {
  const id = req.params.id
  if (checkPermission(req, res, id)) {
    let userGenres;
    User
      .findById(id)
      .then(user => {
        //console.log(user);
        userGenres = user.favGenres;
      })
      .catch(err => {
        console.log(err);
      })
    spotifyApi
      .getAvailableGenreSeeds()
      .then(function (data) {
        let genreSeeds = data.body;
        let newArray = genreSeeds.genres.filter(element => {
          if (userGenres.includes(element)) return false
          else return true
        })
        console.log(newArray);
        console.log('at get prefs', id);
        res.render('preferences', { genres: newArray, userGenres, id });
      })
      .catch(err => {
        console.log(err);
      })
  }
})


// GET home
router.get('/home/:id', (req, res) => {
  const id = req.params.id;
  if (checkPermission(req, res, id)) {
    res.render('home', { id });
  }
})


//GET logout
router.get('/logout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  })
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
            req.session.user = userFromDB;
            res.redirect(`/preferences/${userFromDB._id}`);
          })
      }
    })
    .catch(err => {
      console.log(err);
    })
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
        req.session.user = userFromDB;
        //console.log('req.session.user', req.session.user);
        const id = userFromDB._id;
        res.redirect(`/home/${id}`);
      } else {
        res.render('login', { message: 'Invalid credentials' });
      }
    })
    .catch(e => {
      console.log(e);
    })
})


// POST preferences
router.post('/prefrences/:id', (req, res) => {

  const id = req.params.id
  const obj = {
    favGenres: Object.values(req.body)
  }
  //find recommendations baed on genre seeds
  //

  
  console.log(id);
  console.log(obj);
  User.findByIdAndUpdate(id, obj, { new: true })
    .then(user => {
      console.log(user, 'has been successfully updated.');
      res.redirect(`/home/${id}`)
    })
    .catch(err => {
      console.log(err);
    });
})


module.exports = router;