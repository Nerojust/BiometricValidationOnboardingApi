// routes/users.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // Import the User model
const logger = require("../utils/Logger");

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

//get all events
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.successResponse(users);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Login user
router.post("/login",validateLogin, async (req, res) => {
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
      res.errorResponse(401, "Invalid password");
      return;
    }

    if (user.fingerPrintKey !== fingerPrintKey) {
      res.errorResponse(401, "Invalid fingerprint");
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

  // Find the user by username and check if he exists
  const user = await User.findOne({ username: username });
  if (user) {
    res.errorResponse("User already exists.");
    return;
  }
  //also check if his phone number exists before
  const userWithPhoneNumber = await User.findOne({ phoneNumber: phoneNumber });
  if (userWithPhoneNumber) {
    res.errorResponse("Phone number already exists.");
    return;
  }

  try {
    // Create a new User instance and save it to the database
    const newUser = new User(req.body);
    const user = await newUser.save();

    res.successResponse(user,201, "Registration Successful",);
  } catch (error) {
    res.errorResponse(error.message);
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
