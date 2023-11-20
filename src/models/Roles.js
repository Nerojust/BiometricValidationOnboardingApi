const mongoose = require("mongoose");

// Define a Role Schema
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: [
    {
      resource: {
        type: String,
        required: true,
      },
      actions: [
        {
          type: String,
          enum: ["get", "post", "patch", "put", "delete"],
        },
      ],
    },
  ],
});

// Create a Role model based on the schema
const Role = mongoose.model("Roles", roleSchema);

module.exports = Role;
