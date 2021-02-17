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
  ],
  param: {
    tempo: { type: Number, default: 120 },
    acousticness: { type: Number, default: 5 }
  }
})

const User = mongoose.model('User', userSchema);

module.exports = User;