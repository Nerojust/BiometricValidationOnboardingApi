// routes/users.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // Import the User model
const logger = require("../utils/Logger");

// Login user
router.post("/login", async (req, res) => {
  // Extract credentials from request body
  const { username, password, fingerPrintKey } = req.body;
  logger.info("About to login username " + username);
  try {
    if (!username) {
      res.errorResponse("Username is required");
      return;
    }

    if (!password) {
      res.errorResponse("Password is required");
      return;
    }

    if (!fingerPrintKey) {
      res.errorResponse("Fingerprint key is required");
      return;
    }
    logger.info("request body validated");

    // Find the user by username
    const user = await User.findOne({ username: username });

    logger.info("found the user");

    if (!user) {
      res.errorResponse("User not found");
      return;
    }

    if (user.password !== password) {
      res.errorResponseWithCode(401, "Invalid password");
      return;
    }

    if (user.fingerPrintKey !== fingerPrintKey) {
      res.errorResponseWithCode(401, "Invalid fingerprint");
      return;
    }
    res.successResponse(user);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Register a new user
router.post("/register", validateRegistration, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  logger.info("About to register user with payload", req.body);
  const {
    username,
    password,
    phoneNumber,
    firstName,
    lastName,
    fingerPrintKey,
  } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  if (!phoneNumber) {
    return res.status(400).json({ message: "PhoneNumber is required" });
  }

  if (!firstName) {
    return res.status(400).json({ message: "FirstName is required" });
  }

  if (!lastName) {
    return res.status(400).json({ message: "LastName is required" });
  }

  try {
    // Create a new User instance and save it to the database
    const newUser = new User(req.body);
    const user = await newUser.save();

    console.log("Registration successful", user);
    res.status(201).json({ message: "Registration Successful", user: user });
  } catch (error) {
    console.log("Error registering user", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Update user by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Find and update the user by ID
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the user by ID
    const deletedUser = await User.findByIdAndRemove(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user by ID
router.delete("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Find and delete the user by ID
    const deletedUser = await User.findOneAndRemove(username);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ... (Login route and other routes with validation)

module.exports = router;
