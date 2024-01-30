// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  payment_id: {
    type: String,
    required: true,
  },
  order_id: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
