const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: [
    {
      type: String,
      required: true,
    },
  ],
});

const RolePermission = mongoose.model("Roles", rolePermissionSchema);

module.exports = RolePermission;
