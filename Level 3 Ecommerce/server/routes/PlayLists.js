// routes/playlists.js
const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const User = require('../models/User');


// Create a new playlist
router.post('/', async (req, res) => {
    try {
      console.log("Request Body: ", req.body);
      const { title, description } = req.body;
      const { username } = req.headers;
      console.log("Request header: ", username);
  
      // Find the user based on the provided username
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if a playlist with the same title already exists for the same user
      const existingPlaylist = await Playlist.findOne({ title, user: user._id });
  
      if (existingPlaylist) {
        return res.status(400).json({ error: 'Playlist with the same title already exists for this user' });
      }
  
      // If no existing playlist, create a new one
      const newPlaylist = new Playlist({ title, description, user: user._id });
      const savedPlaylist = await newPlaylist.save();
      res.json(savedPlaylist);
    } catch (error) {
      console.error('Error creating playlist:', error.message);
      res.status(500).json({ error: `Failed to create playlist. ${error.message}` }); // Send a more detailed error response
    }
  });


// Get all playlists for a specific user
router.get('/', async (req, res) => {
    try {
      const { username } = req.headers; // Retrieve the username from request headers
  
      // Find the user based on the provided username
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Fetch all playlists for the user
      const playlists = await Playlist.find({ user: user._id }).populate('songs');
      res.json(playlists);
    } catch (error) {
      console.error('Error getting playlists:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Get all songs of a specific playlist for a specific user
router.get('/:playlistId/songs', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { username } = req.headers; // Retrieve the username from request headers

    // Find the user based on the provided username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Once user is found, use user's object ID to query the playlist
    const playlist = await Playlist.findOne({ _id: playlistId, user: user._id }).populate('songs');

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Return the songs of the playlist
    res.json(playlist.songs);
  } catch (error) {
    console.error('Error getting playlist songs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get a songs for a specific playlist by ID for a specific user
router.get('/:playlistId/songs', async (req, res) => {
  try {
    console.log("Playlist songs fetch");
    const { playlistId } = req.params;
    const { username } = req.headers; // Retrieve the username from request headers
    // Find the playlist by ID and username, populate the 'songs' field
    const playlist = await Playlist.findOne({ _id: playlistId, username }).populate('songs');

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json(playlist.songs); // Return only the songs array
  } catch (error) {
    console.error('Error getting playlist by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Update a playlist by removing a song
router.put('/:playlistId/songs/:songIdToRemove', async (req, res) => {
  try {
    const { playlistId, songIdToRemove } = req.params;
    const { username } = req.headers;

    // Find the playlist by ID and username
    const playlist = await Playlist.findOne({ _id: playlistId, username });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Remove the song from the playlist
    playlist.songs = playlist.songs.filter(songId => songId !== songIdToRemove);

    // Save the updated playlist
    await playlist.save();

    res.json({ message: 'Song removed successfully from playlist' });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Add a song to a playlist for a specific user
router.post('/:playlistId/add-song/:songId', async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const { username } = req.headers; // Retrieve the username from request headers

    // Check if the song and playlist exist for the given user
    const song = await Song.findById(songId);
    const playlist = await Playlist.findOne({ _id: playlistId, username });

    if (!song || !playlist) {
      return res.status(404).json({ error: 'Song or Playlist not found' });
    }

    // Check if the song already exists in the playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ error: 'Song already exists in the playlist' });
    }

    // Add the song to the playlist
    playlist.songs.push(songId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Update a playlist by removing a song
router.put('/:playlistId/remove-song/:songIdToRemove', async (req, res) => {
  try {
    const { playlistId, songIdToRemove } = req.params;

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Remove the song from the playlist
    playlist.songs = playlist.songs.filter(songId => songId.toString() !== songIdToRemove.toString());

    // Save the updated playlist
    await playlist.save();

    res.json({ message: 'Song removed successfully from playlist' });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






// Delete a playlist by ID for a specific user
router.delete('/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { username } = req.headers; // Retrieve the username from request headers

    // Find the user based on the provided username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the playlist exists for the user
    const playlist = await Playlist.findOne({ _id: playlistId, user: user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({ _id: playlistId, user: user._id });
    if (!deletedPlaylist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;