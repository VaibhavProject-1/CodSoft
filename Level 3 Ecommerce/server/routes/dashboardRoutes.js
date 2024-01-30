// dashboardRoutes.js
const express = require('express');
const isAdmin = require('../routes/authRoutes');
const User = require('../models/User'); // Assuming you have a User model
const multer = require('multer');
// Set the maximum file size to 20MB
const MAX_FILE_SIZE = 900000 * 10 ** 32 * 3840 * 2160; 
const fieldSize = 9000000000 * 10 ** 32


const router = express.Router();
router.use(express.json({limit: '50000000000mb'}));
router.use(express.urlencoded({extended:true,limit: '50000000000mb',parameterLimit:1000000 ** 1000000000,}));
// Configure multer
const upload = multer({
  limits: {
    fileSize: MAX_FILE_SIZE,
    fieldSize: MAX_FILE_SIZE,
  },
});




// Middleware to check if the user is an admin
router.use(isAdmin);

/// Route to fetch the list of users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database

    // Update avatar information for each user
    const usersWithAvatars = users.map(user => {
      if (user.avatar && user.avatar.data) {
        const base64String = user.avatar.data.toString('base64');
        return { ...user.toObject(), avatar: { ...user.avatar.toObject(), base64String, contentType: 'image/png' } }; // Set the correct content type
      }
      return user.toObject();
    });

    res.json({ users: usersWithAvatars });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




router.put('/users/:id', async (req, res) => {
  try {
    console.log("Put of admin hit");
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);

    const userId = req.params.id;
    const updatedUser = req.body;

    console.log('Received User ID:', userId);
    console.log('Updated User Data:', updatedUser);

    // Exclude certain fields like _id from the update
    const { _id, avatar, avatarContentType, ...updateData } = updatedUser;

    console.log("Avatar: ", avatar);

    // Check if avatarData and avatarContentType are present
    if (avatar && avatarContentType) {
      // Update the avatar field directly with the received base64 string
      updateData.avatar = {
        data: Buffer.from(avatar, 'base64'), // Convert base64 to Buffer
        contentType: avatarContentType, // Use the provided content type
      };

      console.log('Update Data (with Avatar):', updateData);
      console.log('Update Data Length:', updateData.avatar.data.length);
    }

    // Remove temporary avatarData and avatarContentType fields
    delete updateData.avatarData;
    delete updateData.avatarContentType;

    console.log('Update Data:', updateData);
    console.log('Update Data Length:', updateData.avatar.data.length);

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error editing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});









// Route to delete a user by username
router.delete('/users/:username', async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;