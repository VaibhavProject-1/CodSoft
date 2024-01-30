const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8001; ;
const bodyParser = require('body-parser');
// Increase payload limit
app.use(bodyParser.json({ limit: '100mb' }));
// Increase raw body limit
app.use(express.raw({ limit: '100mb' }));

require('dotenv').config();



const corsOptions = {
  // origin: 'http://127.0.0.1:3006', // Adjust this to your frontend domain
  origin: process.env.FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware before other routes
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());



const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');
const premiumRoutes = require('./routes/premiumRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const playlistsRouter = require('./routes/PlayLists');



// Connect to MongoDB (make sure you have MongoDB installed and running)
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use the authentication routes
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/premium', premiumRoutes);
// Dashboard routes
app.use('/api/admin', dashboardRoutes);
app.use('/api/playlists',playlistsRouter)



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
