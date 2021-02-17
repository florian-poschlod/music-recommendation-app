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
    return true;
  }
  else {
    console.log('User not logged in.')
    res.redirect('/')
  }
}


// GET recommendation
router.get('/recommendation/:id', (req, res) => {
  const id = req.params.id;
  if (checkPermission(req, res, id)) {
    User.findById(id)
      .then(userFromDB => {
        const genres = userFromDB.favGenres;
        spotifyApi.getRecommendations({
          seed_genres: genres,
          limit: 1
        })
          .then(data => {
            let recommendations = data.body;
            let image = recommendations.tracks[0].album.images[0].url;
            res.render('recommendation', { image, id })
          })
          .catch(err => {
            console.log(err);
          })
      })
      .catch(err => {
        console.log(err);
      })
  }
})

module.exports = router;