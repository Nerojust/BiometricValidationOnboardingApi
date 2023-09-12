// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/UsersRoutes');

const app = express();

// Connect to MongoDB (replace 'mongodb://localhost:27017/myapp' with your MongoDB URI)
// mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('Connected to MongoDB');
//     })
//     .catch((error) => {
//         console.error('MongoDB connection error:', error);
//     });

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/users', usersRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
