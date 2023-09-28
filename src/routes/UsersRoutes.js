// routes/users.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // Import the User model
const logger = require("../utils/Logger");
const { generateToken, verifyToken } = require("../utils/auth/Authentication");
const { removeSensitiveDataFromObject } = require("../utils/Utils");

// Validation middleware for user registration
const validateRegistration = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("phoneNumber")
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid phone number"),
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("fingerPrintKey")
    .optional({ nullable: true })
    .isLength({ min: 10 })
    .withMessage("Fingerprint key must be at least 10 characters long"),
];

// Validation middleware for login
const validateLogin = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("fingerPrintKey").optional({ nullable: true }),
];

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

    if (!user) {
      res.errorResponse("User not found", username);
      return;
    }

    logger.info("found the user");

    if (user.password !== password) {
      res.errorResponse("Invalid password", 401);
      return;
    }
    //since it is optional do a check for it
    if (user.fingerPrintKey && user.fingerPrintKey !== fingerPrintKey) {
      res.errorResponse("Invalid fingerprint", 401);
      return;
    }
    // Generate a JWT token and send it in the response
    user.accessToken = generateToken(user);
    // Convert user to a plain JavaScript object and remove the password field
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.fingerPrintKey;
    delete userObject.__v;

    res.successResponse(userObject);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Register a new user
router.post("/register", validateRegistration, async (req, res) => {
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
    res.errorResponse("Username is required");
    return;
  }

  if (!password) {
    res.errorResponse("Password is required");
    return;
  }

  if (!phoneNumber) {
    res.errorResponse("Phone Number is required");
    return;
  }

  if (!firstName) {
    res.errorResponse("FirstName is required");
    return;
  }

  if (!lastName) {
    res.errorResponse("LastName is required");
    return;
  }

  // Find the user by username
  const user = await User.findOne({
    username: username,
  });

  if (user) {
    res.errorResponse("Username already exists: " + username);
    return;
  }

  // Find the user by username
  const user1 = await User.findOne({
    phoneNumber: phoneNumber,
  });

  if (user1) {
    res.errorResponse("Phone number already exists: " + phoneNumber);
    return;
  }
  try {
    // Create a new User instance and save it to the database
    const user = await new User(req.body).save();
    res.successResponse(
      removeSensitiveDataFromObject(user),
      201,
      "Registration Successful"
    );
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Update user by ID
router.put("/:id", verifyToken, async (req, res) => {
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
router.delete("/:id", verifyToken, async (req, res) => {
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
