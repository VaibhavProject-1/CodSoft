// premiumRoutes.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const Payment = require('../models/Payment');
const User = require('../models/User');

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.key_id, // environment variable
  key_secret: process.env.key_secret, // environment variable
});



router.post('/create-order', async (req, res) => {
  try {
    // Round the amount to the nearest integer paise
    const amountInPaise = Math.max(Math.round(req.body.amount * 100), 100);

    // Create a new order with Razorpay
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: req.body.currency || 'INR',
    });

    console.log('Order Created:', order);

    if (order.status === 'created') {
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        duration: req.body.duration,
        status: 'success',
      });
    } else {
      console.error('Unexpected order status:', order.status);
      res.status(400).json({ error: 'Unexpected order status' });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to save payment data
router.post('/save-payment', async (req, res) => {
  try {
    console.log("Request body for save payment: ",req.body)
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, duration, username, email } = req.body;

    // Save payment data to MongoDB
    const payment = new Payment({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      email: email,
      duration,
      username,
    });

    const savedPayment = await payment.save();

    console.log('Saved Payment:', savedPayment);

    res.json({ status: 'success', message: 'Payment data saved successfully' });
  } catch (error) {
    console.error('Error saving payment data:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});


// Route to update user's premium status
router.post('/update-user-status', async (req, res) => {
  try {
    const { username, duration } = req.body;

    // Fetch user information from the database based on the username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Update user document
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + duration);

    await User.findOneAndUpdate({ username }, {
      isPremiumUser: true,
      premiumExpiration: expirationDate,
    });

    res.json({ status: 'success', message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});




module.exports = router;