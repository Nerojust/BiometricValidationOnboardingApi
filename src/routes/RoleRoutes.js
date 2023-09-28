const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const RoleRoutes = require("../models/Roles");
const logger = require("../utils/Logger");

// Create a new role permission
router.post(
  "/",
  [
    check("roleName", "Role name is required").not().isEmpty(),
    check("permissions", "Permissions are required").isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roleName, permissions } = req.body;

    try {
      let rolePermission = await RolePermission.findOne({ roleName });

      if (rolePermission) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Role permission already exists" }] });
      }

      rolePermission = new RolePermission({ roleName, permissions });
      await rolePermission.save();

      res.json(rolePermission);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Get all role permissions
router.get("/", async (req, res) => {
  logger.info("About to get all roles");
  try {
    const rolePermissions = await RoleRoutes.find();
    res.successResponse(rolePermissions);
    // res.json(rolePermissions);
  } catch (err) {
    res.errorResponse(error.message);
    // res.status(500).send("Server Error");
  }
});

// Get a single role permission by ID
router.get("/:id", async (req, res) => {
  try {
    const rolePermission = await RolePermission.findById(req.params.id);

    if (!rolePermission) {
      return res.status(404).json({ msg: "Role permission not found" });
    }

    res.json(rolePermission);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Role permission not found" });
    }

    res.status(500).send("Server Error");
  }
});

// Update a role permission by ID
router.put("/:id", async (req, res) => {
  const { roleName, permissions } = req.body;

  try {
    let rolePermission = await RolePermission.findById(req.params.id);

    if (!rolePermission) {
      return res.status(404).json({ msg: "Role permission not found" });
    }

    rolePermission.roleName = roleName;
    rolePermission.permissions = permissions;

    await rolePermission.save();

    res.json(rolePermission);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Role permission not found" });
    }

    res.status(500).send("Server Error");
  }
});

// Delete a role permission by ID
router.delete("/:id", async (req, res) => {
  try {
    const rolePermission = await RolePermission.findById(req.params.id);

    if (!rolePermission) {
      return res.status(404).json({ msg: "Role permission not found" });
    }

    await rolePermission.remove();

    res.json({ msg: "Role permission removed" });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Role permission not found" });
    }

    res.status(500).send("Server Error");
  }
});

module.exports = router;
