// app.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const usersRouter = require("./src/routes/UsersRoutes");
const eventsRouter = require("./src/routes/EventRoutes");
const roleRouter = require("./src/routes/RoleRoutes");

const generalResponse = require("./src/utils/ResponseComponent");

const app = express();

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Middleware
app.use(bodyParser.json());
//for response to every request
app.use(generalResponse);
// Routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/roles", roleRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
