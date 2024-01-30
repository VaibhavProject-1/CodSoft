// routes/admin.js

const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const multer = require('multer'); 
const cors = require('cors');
router.use(cors());
const User = require('../models/User'); // Adjust the path based on your project structure
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const fsPromises = require('fs').promises;





//Fetch all Songs
router.get('/songs', async (req, res) => {
  try {
    const username = req.headers.username;
    const user = await User.findOne({ username: username });

    const songs = await Song.find();

    // Map songs to include base64-encoded album art
    const songsWithBase64AlbumArt = songs.map((song) => {
      const albumArtData = song.albumArt && song.albumArt.data ? song.albumArt.data.toString('base64') : null;
      return {
        ...song._doc,
        albumArt: albumArtData ? `data:${song.albumArt.contentType};base64,${albumArtData}` : null,
      };
    });

    // Filter non-premium songs if the user is not premium
    if (!user || !user.isPremiumUser) {
      const nonPremiumSongs = songsWithBase64AlbumArt.filter((song) => !song.premiumSong);
      res.json(nonPremiumSongs);
    } else {
      res.json(songsWithBase64AlbumArt);
    }
  } catch (error) {
    console.error('Error getting songs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Using 'uploads' directory where the audio files are stored
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));



//Fetch a specific Song
router.get('/songs/:songId', async (req, res) => {
  console.log("Song ID method hit");
  try {
    const username = req.headers.username;
    console.log("Username for particular song from body: ", username);
    const songId = req.params.songId;
    console.log("Song ID: ", songId);

    // Construct the file path using the obtained filename
    const filePath = path.join(__dirname, `../uploads/${songId}`);
    // Log the constructed filePath for debugging
    console.log('Constructed filePath:', filePath);

    // Set content type based on file extension
    const contentType = getContentType(path.extname(filePath));
    res.set('content-type', contentType);
    res.set('accept-ranges', 'bytes');

    // Add the username header to the request object
    req.headers.username = username;
    console.log(username)

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error streaming song:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Fetch the Album Art of the Song
router.get('/album-art/:songId', async (req, res) => {
  try {
    const songId = req.params.songId;

    // Retrieve the song from the database based on songId
    const song = await Song.findById(songId);

    if (!song || !song.albumArt || !song.albumArt.data) {
      // Handle the case where the song or album art is not found
      return res.status(404).json({ error: 'Album art not found' });
    }

    // Set content type based on the album art content type
    res.set('content-type', song.albumArt.contentType);

    // Send the base64 image data in the response
    res.send(Buffer.from(song.albumArt.data, 'base64'));
  } catch (error) {
    console.error('Error fetching album art:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Helper function to determine content type based on file extension
function getContentType(fileExtension) {
  switch (fileExtension) {
    case '.mp3':
      return 'audio/mp3';
    case '.wav':
      return 'audio/wav';
    case '.ogg':
      return 'audio/ogg';
    // Add more cases for other supported file types
    default:
      return 'application/octet-stream'; // Default to binary data for unknown types
  }
}
















// Middleware function
const isAdmin = async (req, res, next) => {
  try {
    console.log("Admin middleware hit");


    // Request headers
    const username = req.headers.username;
    console.log("User is: ",username)

    // Find the user by username
    const user = await User.findOne({ username });

    if (user && user.isAdmin) {
      // User is an admin, proceed
      console.log("User is admin");
      next();
    } else {
      console.log("User is not admin");
      // User is not an admin, send an error response
      res.status(403).send('Forbidden');
    }
  } catch (error) {
    // Handle any errors
    console.error('Error in isAdmin middleware:', error);
    res.status(500).send('Server error');
  }
};








// Apply the isAdmin middleware to all admin routes
router.use(isAdmin);


//For generating unique IDs for song filenames
const { v4: uuidv4 } = require('uuid');

// Set up multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    // Generate a unique ID for the song
    const songUniqueId = uuidv4();

    // Extract the necessary details from the request
    const { title } = req.body;
    const originalnameWithoutExtension = path.parse(file.originalname).name;

    // Construct the unique filename
    const uniqueFilename = `id_${songUniqueId}_${originalnameWithoutExtension}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename); // Use a unique filename with the song's unique ID
  },
});

router.use(express.json({limit: '100mb'}));
router.use(express.urlencoded({limit: '100mb'}));
const MAX_FILE_SIZE = 900000 * 10 ** 32 * 3840 * 2160; 
const upload = multer({ storage: storage,limits: {
  fileSize: MAX_FILE_SIZE,
  fieldSize: MAX_FILE_SIZE,
}, });





//Uploading a Song
router.post('/songs', upload.single('file'), async (req, res) => {
  console.log('Request received at /api/songs');
  try {
    const { title, artist, album, duration, premiumSong, albumArt } = req.body;

    let albumArtBuffer;

    // Check if albumArt is provided
    if (albumArt) {
      // Convert the Base64 string back to a buffer
      albumArtBuffer = Buffer.from(albumArt.split(',')[1], 'base64');
    } else {
      // If albumArt is not provided, use the default album art
      const defaultAlbumArtPath = path.join(__dirname, '../defcov.jpg');
      albumArtBuffer = await fsPromises.readFile(defaultAlbumArtPath);
    }

    // Create a new Song instance without the file information for now
    const newSong = new Song({
      title,
      artist,
      album,
      duration,
      premiumSong,
      albumArt: { data: albumArtBuffer, contentType: 'image/*' }, // Set the contentType accordingly
    });

    // Save the new song to the database without the file information
    const savedSong = await newSong.save();

    // Move the uploaded file to the desired destination with the correct filename
    const destinationPath = path.join(__dirname, `../uploads/${req.file.filename}`);
    await fsPromises.rename(req.file.path, destinationPath);

    // Update the saved entry with the file information and correct ID in the title
    savedSong.file = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: destinationPath,
    };

    // Generate a unique ID for the song
    const songUniqueId = uuidv4();

    // // Update the title in the database with the correct ID
    // savedSong.title = `${title.replace(/\s+/g, '-').toLowerCase()}_id_${songUniqueId}`;

    // Save the updated song entry
    await savedSong.save();

    // Send the response
    res.json(savedSong);
  } catch (error) {
    console.error('Error adding song:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Delete a song
router.delete('/songs/:songId', async (req, res) => {
  try {
    const songId = req.params.songId;
    const deletedSong = await Song.findByIdAndDelete(songId);
    if (!deletedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Update a Song
router.put('/songs/:songId', upload.fields([
  { name: 'file' },
]), async (req, res) => {
  try {
    const uuid = require('uuid');
    console.log("Put for song received");
    console.log("Request body:", req.body);

    const songId = req.params.songId;
    console.log("Song ID:", songId);

    // Extract the fields you want to update from req.body
    const { title, artist, album, duration, audioFileInfo } = req.body;
    console.log("Received data:", { title, artist, album, duration, audioFileInfo });

    // Parse the audioFileInfo string to JSON if it exists
    let fileInfoObject;
    if (audioFileInfo) {
      fileInfoObject = JSON.parse(audioFileInfo);
    }

    // Retrieve the old song from the database to get the old file object
    const oldSong = await Song.findById(songId);
    if (!oldSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Create an update object with the fields to be updated
    const updateObject = {};

    // Check if title, artist, album, or duration are provided and update them
    if (title) updateObject.title = title;
    if (artist) updateObject.artist = artist;
    if (album) updateObject.album = album;
    if (duration) updateObject.duration = duration;

    // If audioFileInfo is provided, handle the file update
    if (fileInfoObject) {
      // Generate a UUIDv4
      const uuidv4 = uuid.v4();

      // Concatenate the UUIDv4, and the filename
      const filenameWithId = `id_${uuidv4}_${fileInfoObject.name}`;

      // Create a new file object with the updated filename
      const destinationPath = path.join(__dirname, `../uploads/${filenameWithId}`);

      // Move the file to the destination
      await fsPromises.rename(req.files.file[0].path, destinationPath);

      // Update the file object in the updateObject
      updateObject.file = {
        filename: filenameWithId,
        originalname: filenameWithId,
        path: destinationPath,
      };

      // Delete the old audio file
      if (oldSong.file && oldSong.file.path) {
        fs.unlinkSync(oldSong.file.path);
        console.log('Deleted old audio file:', oldSong.file.path);
      }
    }

    // Update the song in the database with the new audio file details
    const updatedSong = await Song.findByIdAndUpdate(songId, updateObject, { new: true });
    console.log('Updated song:', updatedSong);

    if (!updatedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Respond with the updated song
    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






// Update album art for an existing song
router.put('/songs/:songId/albumArt', async (req, res) => {
  console.log("Album Art update hit");
  console.log("Album Art route hit");
  try {
    const songId = req.params.songId;
    const { albumArt, albumArtContentType } = req.body;

    // Check if albumArt is present
    let albumArtBuffer;
    if (albumArt) {
      // Convert albumArt back to a Buffer
      albumArtBuffer = Buffer.from(albumArt, 'base64');
    }

    // Update the song in the database with the new album art details
    const updatedSong = await Song.findByIdAndUpdate(
      songId,
      { albumArt: { data: albumArtBuffer, contentType: albumArtContentType } },
      { new: true },
      { upsert: false }
    );

    console.log('Updated song with album art:', updatedSong);

    if (!updatedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Respond with the updated song
    console.log("Album Art route ending 1");
    res.json(updatedSong);
    console.log("Album Art route ending 2");
  } catch (error) {
    console.error('Error updating album art:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});








// Apply the isAdmin middleware to all admin routes except streaming
router.use((req, res, next) => {
  if (req.path !== '/songs/:songId/stream') {
    isAdmin(req, res, next);
  } else {
    next();
  }
});






module.exports = router;
