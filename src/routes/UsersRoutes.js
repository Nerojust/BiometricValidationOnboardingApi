// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import the User model
const logger = require("../utils/Logger");
const bcrypt = require("bcrypt");

const {
  generateToken,
  verifyToken,
  verifyCreateDeleteAccessRole,
} = require("../utils/auth/Authentication");
const { encryptRequest, decryptResponse } = require("../utils/Utils");

// Login user
router.post("/login", async (req, res) => {
  // const encryptedResponse = {
  //   data: req.body.data, // Actual encrypted response data
  //   iv: req.body.iv, // Actual IV
  //   encryptedSecretKey: req.body.encryptedSecretKey, // Actual encrypted secret key
  // };
  // console.log(encryptedResponse);
  // // Decrypt the response
  // const decryptedResponse = decryptResponse(encryptedResponse);
  // console.log("Decrypted Response:", decryptedResponse);

  // Extract credentials from request body
  // const { username, password, fingerPrintKey } = decryptedResponse;
  const { username, password, fingerPrintKey } = req.body;
  logger.info("About to login username " + username);

  try {
    const requiredFields = ["username", "password", "fingerPrintKey"];

    for (const field of requiredFields) {
      // Capitalize the first letter of the field name
      const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);

      if (!req.body[field]) {
        res.errorResponse(`${capitalizedField} is required`);
        return;
      }
      // if (!decryptedResponse[field]) {
      //   res.errorResponse(`${capitalizedField} is required`);
      //   return;
      // }
    }

    const user = await User.findOne({
      $or: [{ username: username }, { fingerprint: fingerPrintKey }],
    });

    if (!user) {
      res.errorResponse("User not found", 401);
      return;
    }

    // Compare the entered password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      console.log("Fingerprint from DB: ", user.fingerPrintKey);
      console.log("Fingerprint from client:", fingerPrintKey);
      //since it is optional do a check for it
      if (user.fingerPrintKey && user.fingerPrintKey !== fingerPrintKey) {
        res.errorResponse("Invalid fingerprint", 401);
        return;
      }
      // Generate a JWT token and send it in the response
      user.accessToken = generateToken(user);

      // // Encrypt the response
      // const resp = encryptRequest(removeSensitiveDataFromObject(user));
      // console.log("Encrypted response:", resp);

      // res.successResponse(resp, 200, "Login Successful");
      res.successResponse(removeSensitiveDataFromObject(user), 200, "Login Successful");
    } else {
      res.errorResponse("Invalid password", 401);
    }
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Register a new user
router.post("/register", async (req, res) => {
  try {
    logger.info("About to register user with payload", req.body);

    const { username, password, phoneNumber } = req.body;
    const requiredFields = [
      "username",
      "password",
      "phoneNumber",
      "firstName",
      "lastName",
    ];

    for (const field of requiredFields) {
      // Capitalize the first letter of the field name
      const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);

      if (!req.body[field]) {
        res.errorResponse(`${capitalizedField} is required`);
        return;
      }
    }

    // Check if a user with the same username or phone number already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { phoneNumber }],
    });

    if (existingUser) {
      const conflictField =
        existingUser.username === username ? "Username" : "Phone number";
      res.errorResponse(
        `${conflictField} already exists: ${
          conflictField === "Username" ? username : phoneNumber
        }`,
        409
      );
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.body.password = hashedPassword;

    // Create and save the new user
    const newUser = new User(req.body);
    await newUser.save();

    res.successResponse(
      removeSensitiveDataFromObject(newUser),
      201,
      "Registration Successful"
    );
  } catch (error) {
    console.error(error);
    res.errorResponse("Internal Server Error");
  }
});

//get all events
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    res.successResponse(users);
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
router.delete(
  "/:id",
  verifyToken,
  verifyCreateDeleteAccessRole,
  async (req, res) => {
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
  }
);

// Delete user by ID
router.delete(
  "/:username",
  verifyToken,
  verifyCreateDeleteAccessRole,
  async (req, res) => {
    const { customerId } = req.params;

    try {
      // Find and delete the user by ID
      const deletedUser = await User.findOneAndRemove(customerId);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;

function removeSensitiveDataFromObject(user) {
  const userObject = user.toObject();
  delete userObject.password;
  // delete userObject.fingerPrintKey;
  delete userObject.__v;
  return userObject;
}
