require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const recipeRoutes = require('./routes/recipeRoutes');
const mealRoutes = require('./routes/mealRoutes');


const app = express();
app.use(cors());

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

//image upload folder
app.use('/uploads', express.static(path.join(__dirname, '../public/images')));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', protect, recipeRoutes);
app.use('/api/meals', protect, mealRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});