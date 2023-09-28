const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

// Middleware to generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    // Add other user data as needed
  };

  const options = {
    expiresIn: "1h", // Token expiration time
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
    return res.status(401).json({ message: "Token not provided" });
  }

  // Extract the token without the "Bearer " prefix
  const token = authHeader.slice(7);

  try {
    // Verify and decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user information to the request
    next(); // Continue to the next middleware
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { generateToken, verifyToken };
