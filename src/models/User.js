// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        // Simple phone number validation, you can enhance this as needed
        return /^[0-9]{11}$/.test(v);
      },
      message: "Invalid phone number, must be 11 digits",
    },
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  deviceId: {
    type: String,
    required: false,
  },
  accessToken: {
    type: String,
    required: false,
  },

  isActive: {
    type: Boolean,
    required: false,
    default: true,
  },

  role: {
    type: String,
    required: false,
    default: "Member",
  },

  fingerPrintKey: {
    type: String,
    minlength: 10,
  },
});

module.exports = mongoose.model("User", userSchema);
