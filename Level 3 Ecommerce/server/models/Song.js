const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: String,
  releaseDate: Date,
  genre: String,
  duration: { type: Number, required: true },
  file: {
    filename: String,
    originalname: String,
    path: String,
  },
  albumArt: {
    data: Buffer,
    contentType: String,
  },
  premiumSong: { type: Boolean, default: false }, // Default to false for non-premium songs
  // Other metadata fields...
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;
