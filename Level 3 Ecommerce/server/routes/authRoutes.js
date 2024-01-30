// authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const mimeTypes = require('mime-types');
const jimp = require('jimp');
const otpGenerator = require('otp-generator');
const sendEmail = require('../utils/sendEmail');
const bodyParser = require('body-parser');
const adminRoutes = require('./admin.js');




// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({
  storage: storage,
  limits: { fileSize: 30 * 3840 * 2160 }, // 30 MB limit (adjust as needed)
});



// isAdmin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Permission denied. Admins only.' });
};


// Middleware
router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Use the admin routes
router.use('/api', adminRoutes);

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log("Token :",token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token missing.' });
  }

  try {
    // Split the token correctly
    const decodedToken = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.userId = decodedToken.userId; // Attach the user ID to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};

module.exports = { verifyToken };




// Example route that requires admin privileges
router.get('/admin/dashboard', isAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard. Only accessible to admins.' });
});





// Login route
router.post('/login', [
  check('identifier').notEmpty(),
  check('password').notEmpty(),
], async (req, res) => {
  console.log("Request body: ",req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      console.log(`User logged in: ${user.username}`);

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '4h' });

      res.json({
        message: 'Login successful',
        user: {
          username: user.username,
          isAdmin: user.isAdmin,
          isPremiumUser: user.isPremiumUser,
          email: user.email,
        },
        token, // Send the token to the client
      });
      console.log(res.json)
    } else {
      console.log(`Login failed for identifier: ${identifier}`);
      res.status(401).json({ message: 'Login failed. Invalid credentials.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});




 
// Registration Form Method
router.post('/register', upload.single('avatar'), [
  check('username').notEmpty(),
  check('password').notEmpty(),
  check('name').notEmpty(),
  check('phone').notEmpty(),
  check('email').notEmpty().isEmail(),
], async (req, res) => {
  const { username, password, name, phone, email } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle the avatar field
    let avatarData = null;
    let avatarContentType = null;

    if (req.file) {
      // Access the avatar data correctly
      avatarData = req.file.buffer;
      avatarContentType = req.file.mimetype;
    }else {
      // Set default avatar path
      const defaultAvatarPath = path.join(__dirname, '..', 'avatar-default.png');
      
      // Read the default avatar file
      avatarData = fs.readFileSync(defaultAvatarPath);
      avatarContentType = 'image/png';
    }

    // Create a new user with additional fields
    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      phone,
      email,
      avatar: { data: avatarData, contentType: avatarContentType },
    });

    await newUser.save();

    res.json({ success: true, message: 'Registration successful', user: { username } });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// 
// Fetch user profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has an avatar
    if (user.avatar && user.avatar.data) {
      // Convert Buffer data to base64 string
      const base64String = user.avatar.data.toString('base64');

      // Update the user object with the image URL
      user.avatar.imageUrl = `data:${user.avatar.contentType};base64,${base64String}`;
    }

    
    

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




router.put('/profile/:username', verifyToken, upload.single('avatar'), async (req, res) => {
  console.log("Put Method invoked");
  console.log('Request size:', req.get('Content-Length'));
  const { name, phone, email, newPassword, confirmNewPassword } = req.body;
  const username = req.params.username;

  try {
    let updateFields = {};

    // Update user profile fields
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;

    // Check if newPassword and confirmNewPassword are provided
    if (newPassword && confirmNewPassword) {
      if (newPassword === confirmNewPassword) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateFields.password = hashedPassword;
      } else {
        return res.status(400).json({ message: 'New password and confirm password do not match' });
      }
    }

    // Update the avatar if provided
    if (req.file) {
      // Use mime-types to determine the MIME type based on the file extension
      const fileExtension = req.file.originalname.split('.').pop();
      const mimeType = mimeTypes.lookup(fileExtension);

      // Resize image to 100x100
      const jimpImage = await jimp.read(req.file.buffer);
      await jimpImage.resize(100, 100);

      updateFields.avatar = {
        data: await jimpImage.getBufferAsync(mimeType),
        contentType: mimeType,
      };
    }

    // Use findOneAndUpdate to update the user
    const updatedUser = await User.findOneAndUpdate(
      { username },
      updateFields,
      { new: true }
    );

    console.log("Updated User: ", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the updated user data to the frontend
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/profile/:username', async (req, res) => {
  try {
    const username = req.params.username;
    
    // Remove user data from the database based on the username
    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});










// Password reset route
router.post('/password/reset', async (req, res) => {
  try {
    console.log(req.body);
    const { emailOrPhone } = req.body;

    // Extract email from emailOrPhone
    const email = emailOrPhone.includes('@') ? emailOrPhone : null;

    if (!email) {
      return res.status(400).json({ error: 'Invalid email or phone format' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a new random password
    const generatedPassword = Math.random().toString(36).slice(-8);

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Send password reset link via email
    await sendEmail(email, 'Password Reset', `Your new password: ${generatedPassword}`);

    res.json({ message: 'Password reset link sent to your email', email });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;