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
router.get('/recom-artist/:id', (req, res) => {
  const id = req.params.id;

  if (checkPermission(req, res, id)) {

    async function asyncCall() {

      //gets the user from the db
      const user = await User.findById(id)
      const arists = user.favArtists;
      const tempo = user.param.tempo;
      const acousticness = user.param.acousticness/10;
      let artistArray =[];

      for (ele of arists) {
        //gets the ids of the artists
        const data = await spotifyApi.searchArtists(ele)
        artistArray.push(data.body.artists.items[0].id) 
      }  

      //gets recommendations based on the seed and params
      const recom  = await spotifyApi.getRecommendations({
        seed_artists: artistArray,
        min_tempo: tempo - 10,
        max_tempo: tempo + 10,
        min_acousticness: acousticness - 0.1,
        max_acousticness: acousticness + 0.1,
        limit: 1
      })
      
      let recommendations = recom.body;
      let names = {
        albumName: recom.body.tracks[0].album.name,
        artistName: recom.body.tracks[0].artists[0].name
      };
      let albumId = recom.body.tracks[0].album.id
      let image = recommendations.tracks[0].album.images[0].url;
      //console.log(names, albumId, image);

      //gets the tracks from the album
      const albumTracks = await spotifyApi.getAlbumTracks(albumId)
      let tracks = albumTracks.body.items;
      //console.log(data.body);
      res.render('recommendation', { image, id, tracks, names})

    }

    asyncCall();
    

  }
})




module.exports = router;