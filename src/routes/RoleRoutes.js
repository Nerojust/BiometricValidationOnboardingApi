// rolesRoutes.js

const express = require("express");
const router = express.Router();
const Role = require("../models/Roles"); // Import the Role model
const logger = require("../utils/Logger");
const {
  verifyAccessRole,
  verifyToken,
  verifyCreateDeleteAccessRole,
  verifyAccessRole2,
} = require("../utils/auth/Authentication");

// Create a new role
router.post("/", verifyToken, verifyAccessRole, async (req, res) => {
  try {
    console.log("Role body", req.body);
    const { name, permissions } = req.body;

    if (!name) {
      res.errorResponse("Role name is required");
      return;
    }
    if (
      !permissions.some(
        (permission) =>
          permission.resource &&
          permission.actions &&
          permission.actions.length > 0
      )
    ) {
      res.errorResponse("At least one permission is required");
      return;
    }

    const role = new Role(req.body);
    await role.save();
    res.successResponse(role, 201);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Get all roles
router.get("/", verifyToken, async (req, res) => {
  console.log(req.route);

  // Split the originalUrl by '/' and get the last element
  const urlParts = req.originalUrl.split("/");
  const lastPart = urlParts[urlParts.length - 2];

  console.log("Last part after /:", lastPart);

  try {
    const roles = await Role.find();
    res.successResponse(roles);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Get a specific role by ID
router.get("/", verifyToken, async (req, res) => {
  const { id } = req.query;
  try {
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.successResponse(role);
  } catch (error) {
    res.errorResponse(error.message);
  }
});
// Get a specific role by ID
router.get("/", verifyToken, async (req, res) => {
  const { customerId } = req.query;
  try {
    const role = await Role.findById(customerId);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.successResponse(role);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Update a role by ID
router.put("/", verifyToken, verifyAccessRole, async (req, res) => {
  const { id } = req.query;
  const { name, permissions } = req.body;

  if (!name) {
    res.errorResponse("Role name is required");
    return;
  }
  if (
    !permissions.some(
      (permission) => permission.resource && permission.actions.length > 0
    )
  ) {
    res.errorResponse("At least one permission is required");
    return;
  }

  try {
    const role = await Role.findByIdAndUpdate(
      id,
      { name, permissions },
      { new: true }
    );

    if (!role) {
      res.errorResponse("Role not found");
      return;
    }

    res.successResponse(role);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Delete a role by ID
router.delete(
  "/",
  verifyToken,
  verifyCreateDeleteAccessRole,
  async (req, res) => {
    const { id } = req.query;
    try {
      const role = await Role.findByIdAndRemove(id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      res.successResponse("Role deleted successfully");
    } catch (error) {
      res.errorResponse(error.message);
    }
  }
);

module.exports = router;
