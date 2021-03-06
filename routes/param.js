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

router.post('/parameters/:id', (req, res) => {

  const id = req.params.id
  const obj = {
    param: {
      tempo: req.body.tempo,
      acousticness: req.body.acousticness
    }
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