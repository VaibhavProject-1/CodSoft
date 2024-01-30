// utils/sendEmail.js
const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text,resetLink) {
  try {
    const transporter = nodemailer.createTransport({
      // Configure your email provider here
      // For example, for Gmail, you would use:
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from:process.env.EMAIL_USERNAME,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

module.exports = sendEmail;