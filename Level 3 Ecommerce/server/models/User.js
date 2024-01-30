const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Add isAdmin field
  isAdmin: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isPremiumUser: {
    type: Boolean,
    default: false,
  },
  avatar: {
    data: Buffer, // Store binary data
    contentType: String, // Store content type (e.g., image/jpeg)
  },
  premiumExpiration: { type: Date, default: null },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
