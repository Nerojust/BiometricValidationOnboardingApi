const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Initialize AWS S3
AWS.config.update({
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  region: 'YOUR_S3_REGION',
});

const s3 = new AWS.S3();

// Configure multer-s3 to handle file uploads to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'your-s3-bucket-name',
    acl: 'public-read', // Adjust ACL as needed
    key: function (req, file, cb) {
      const username = req.body.username; // You may need to adjust this based on your form field name
      const imageFileName = 'profile-image.jpg'; // Change to your image file name
      cb(null, `user-profiles/${username}/${imageFileName}`);
    },
  }),
});

// Validation middleware for user registration
const validateRegistration = [
  body('firstname').notEmpty().withMessage('First name is required'),
  body('lastname').notEmpty().withMessage('Last name is required'),
  body('phonenumber').isMobilePhone('any', { strictMode: false }).withMessage('Invalid phone number'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('fingerprintkey').optional({ nullable: true }).isLength({ min: 10 }).withMessage('Fingerprint key must be at least 10 characters long'),
];

router.post("/register", upload.single('profileImage'), validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation error during user registration:", errors.array());
      res.errorResponseWithCode(400, errors.array());
      return;
    }

    logger.info("About to register user with payload", req.body);
    const {
      username,
      password,
      phoneNumber,
      firstName,
      lastName,
      fingerPrintKey,
    } = req.body;

    // ... your validation checks

    // The uploaded image file can be accessed as req.file
    if (req.file) {
      const imageUrl = req.file.location; // S3 URL of the uploaded image
      // You can save this URL to your user profile or database
    }

    // Create a new User instance and save it to the database
    const user = await new User(req.body).save();

    logger.info("User registration successful", user);
    res.successResponse(user, 201, "Registration Successful");
  } catch (error) {
    logger.error("Error registering user:", error.message);
    res.errorResponseWithCode(500, error.message);
  }
});
