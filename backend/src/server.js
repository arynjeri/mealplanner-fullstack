require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const recipeRoutes = require('./routes/recipeRoutes');
const mealRoutes = require('./routes/mealRoutes');


const app = express();
app.use(cors());

// Initialize WebSockets with CORS 
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

// Middleware to attach io instance to req for use in controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use(express.json());

// Triggers every 15 minutes to scan for upcoming meals
// Checks if any meal slots are exactly 1 hour away from the user's current timeline
setInterval(async () => {
    try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Target reminders precisely 1 hour ahead
        // Breakfast (e.g., 08:00 -> Remind at 07:00)
        // Lunch (e.g., 13:00 -> Remind at 12:00)
        // Dinner (e.g., 20:00 -> Remind at 19:00)
        
        if (currentHour === 7 && currentMinute < 15) {
            io.emit('notification', { title: "🍳 Breakfast Reminder", message: "Your breakfast slot is coming up in an hour! Check your schedule." });
        }
        if (currentHour === 12 && currentMinute < 15) {
            io.emit('notification', { title: "🥗 Lunch Reminder", message: "Lunch time is approaching in 1 hour. Get ready to cook!" });
        }
        if (currentHour === 19 && currentMinute < 15) {
            io.emit('notification', { title: "🍲 Dinner Reminder", message: "Dinner slot starts in 1 hour. Tap to see your prepped notes." });
        }
    } catch (err) {
        console.error("Cron notification failure:", err);
    }
}, 15 * 60 * 1000); // 15-minute loop interval check

// Socket connection listener
io.on('connection', (socket) => {
    console.log(`Client connected to WebSockets feed: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected from WebSocket stream.');
    });
});

// Connect to MongoDB
connectDB();


//image upload folder
app.use('/uploads', express.static(path.join(__dirname, '../public/images')));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', protect, recipeRoutes);
app.use('/api/meals', protect, mealRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with WebSocket support!`);
});