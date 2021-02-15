const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  favGenres: [
    {type: String}
  ],
  favArtists: [
    { type: String }
  ]
})

const User = mongoose.model('User', userSchema);

module.exports = Celebrity;