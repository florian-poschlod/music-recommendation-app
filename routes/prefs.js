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


// GET preferences
router.get('/preferences/:id', (req, res) => {
  const id = req.params.id
  if (checkPermission(req, res, id)) {
    let userGenres;
    User
      .findById(id)
      .then(user => {
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


// POST preferences
router.post('/prefrences/:id', (req, res) => {

  const id = req.params.id
  const obj = {
    favGenres: Object.values(req.body)
  }

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