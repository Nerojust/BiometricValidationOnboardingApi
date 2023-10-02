const mongoose = require("mongoose");

// Define a Role Schema
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Each role should have a unique name
  },
  permissions: {
    type: [String], // An array of permissions associated with this role
    default: [], // You can define default permissions for a role
  },
});

// Create a Role model based on the schema
const Role = mongoose.model("Roles", roleSchema);

module.exports = Role;
