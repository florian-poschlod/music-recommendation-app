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
  const data1 = req.body
  console.log(data1)
  if (checkPermission(req, res, id)) {
    User.findById(id)
      .then(userFromDB => {
        const genres = userFromDB.favGenres;
        console.log(userFromDB);
        const tempo = userFromDB.param.tempo;
        const acousticness = userFromDB.param.acousticness/10;
        spotifyApi.getRecommendations({////////
          seed_genres: genres,
          min_tempo: tempo - 10,
          max_tempo: tempo + 10,
          min_acousticness: acousticness - 0.1,
          max_acousticness: acousticness + 0.1,
          limit: 1
        })
          .then(data => {
            let recommendations = data.body;
            let names = {
              albumName: data.body.tracks[0].album.name,
              artistName: data.body.tracks[0].artists[0].name
            };
            //console.log(names);
            let albumId = data.body.tracks[0].album.id
            let image = recommendations.tracks[0].album.images[0].url;
            spotifyApi.getAlbumTracks(albumId)//////////
              .then(data => {
                let tracks = data.body.items;
                //console.log(data.body);
                res.render('recommendation', { image, id, tracks, names})
              })
              .catch(err => {
                console.log('Something went wrong!', err);
              })
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