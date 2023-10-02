const jwt = require("jsonwebtoken");
const User = require("../../models/User");
require("dotenv").config(); // Load environment variables

// Middleware to generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    // Add other user data as needed
  };

  const options = {
    expiresIn: process.env.JWT_DURATION, // Token expiration time
  };

  // Sign the token with the secret key
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  return token;
};

// Middleware to verify JWT token
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // return res.status(401).json({ message: "Token not provided" });
    res.errorResponse("Token not provided: ", 401);
    return;
  }

  // Extract the token without the "Bearer " prefix
  const token = authHeader.slice(7);

  try {
    // Verify and decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user information to the request

    if (!req.query.customerId) {
      res.errorResponse("Customer Id is required");
      return;
    }

    if (req.query.customerId !== req.user.userId) {
      res.errorResponse(
        "Invalid user, only logged in user can perform this operation"
      );
      return;
    }
    checkSuperAdmin(req, res);

    next(); // Continue to the next middleware
  } catch (error) {
    res.errorResponse("Token error: " + error.message, 401);
  }
};

// Middleware to check if the user is a super admin
const verifySuperAdminAccessAndToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // return res.status(401).json({ message: "Token not provided" });
    res.errorResponse("Token not provided: ", 401);
    return;
  }

  // Extract the token without the "Bearer " prefix
  const token = authHeader.slice(7);

  try {
    // Verify and decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user information to the request

    const { customerId = userId } = req.query;

    if (!userId) {
      res.errorResponse("Customer Id is required");
      return;
    }
    const user = await User.findOne({
      _id: userId,
    });

    if (!user) {
      res.errorResponse("User not found");
      return;
    }

    if (userId !== req.user.userId) {
      res.errorResponse(
        "Invalid user, only logged in user can perform this operation"
      );
      return;
    }

    const userRole = req.user.role; // Assuming you have a "role" field in your user schema
    if (userRole !== "super admin") {
      res.errorResponse("Permission denied", 403);
      return;
    }

    next(); // Continue to the next middleware
  } catch (error) {
    res.errorResponse("Token error: " + error.message, 401);
  }
};

module.exports = { generateToken, verifyToken, verifySuperAdminAccessAndToken };
