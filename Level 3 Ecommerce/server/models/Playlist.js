// models/playlist.js
const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who created the playlist
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true }],
});

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
