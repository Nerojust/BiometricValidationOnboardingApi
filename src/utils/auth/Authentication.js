const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Role = require("../../models/Roles");
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
    // verifyAccessRole(req, res);

    next(); // Continue to the next middleware
  } catch (error) {
    res.errorResponse("Token error: " + error.message, 401);
  }
};

// Middleware to check if the user is a super admin
const verifyAccessRole = async (req, res, next) => {
  console.log(req.query);
  const user = await User.findById(req.query.customerId);

  if (!user) {
    res.errorResponse("User not found");
    return;
  }
  const allowedRoles = process.env.ALLOWED_PEOPLE_TO_PERFORM_ACTION.split(",");
  const userRole = user.role;
  console.log("User's role is", userRole, "allowed roles are", allowedRoles);
  if (!allowedRoles.includes(userRole)) {
    res.errorResponse("Permission denied", 403);
    return;
  }
  next(); // Continue to the next middleware
};

const verifyCreateDeleteAccessRole = async (req, res, next) => {
  const userId = req.query.customerId;

  if (!userId) {
    res.errorResponse("User ID is required");
    return;
  }

  try {
    // Find the user's role based on userId
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.errorResponse("User not found", 404);
      return;
    }

    // Check if the user has the required roles
    const userRole = user.role;

    // Check if the user's role is allowed based on the Role schema
    const userRoleData = await Role.findOne({ name: userRole });
    if (!userRoleData) {
      res.errorResponse("Role not found", 500);
      return;
    }

    const userPermissions = userRoleData.permissions;

    // Check if any of the user's permissions allow create/delete actions
    const allowedActions = process.env.ALLOWED_ACTIONS.split(",");

    const canCreateDelete = userPermissions.some((permission) =>
      permission.actions.some((action) => allowedActions.includes(action))
    );

    if (!canCreateDelete) {
      res.errorResponse("Permission denied", 403);
      return;
    }

    next(); // Continue to the next middleware
  } catch (error) {
    console.error(error);
    res.errorResponse("Internal Server Error", 500);
  }
};

module.exports = {
  generateToken,
  verifyToken,
  verifyAccessRole,
  verifyCreateDeleteAccessRole,
};
