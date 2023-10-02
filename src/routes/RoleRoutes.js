// rolesRoutes.js

const express = require("express");
const router = express.Router();
const Role = require("../models/Roles"); // Import the Role model
const logger = require("../utils/Logger");
const {
  verifySuperAdminAccessAndToken,
} = require("../utils/auth/Authentication");

// Create a new role
router.post("/", verifySuperAdminAccessAndToken, async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const role = new Role({ name, permissions });
    await role.save();
    res.successResponse(role, 201);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Get all roles
router.get("/", async (req, res) => {
  try {
    const roles = await Role.find();
    res.successResponse(roles);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

// Get a specific role by ID
router.get("/:roleId", async (req, res) => {
  const { roleId } = req.params;
  try {
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a role by ID
router.put("/:roleId", async (req, res) => {
  const { roleId } = req.params;
  const { name, permissions } = req.body;
  try {
    const role = await Role.findByIdAndUpdate(
      roleId,
      { name, permissions },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a role by ID
router.delete("/:roleId", async (req, res) => {
  const { roleId } = req.params;
  try {
    const role = await Role.findByIdAndRemove(roleId);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
