// routes/users.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const logger = require("../utils/Logger");
const { verifyToken } = require("../utils/auth/Authentication");
const Event = require("../models/Event");

//get all events
router.get("/",verifyToken, async (req, res) => {
  try {
    const events = await Event.find();
    res.successResponse(events);
  } catch (error) {
    res.errorResponse(error.message);
  }
});

router.post("/", verifyToken, async (req, res) => {
  // Check query parameters (e.g., specific conditions)
  if (req.query.validate === "true") {
    // Perform additional validation logic
  }

  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event); // Return the newly created event
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  // Check query parameters (e.g., specific conditions)
  if (req.query.validate === "true") {
    // Perform additional validation logic
  }

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  // Check query parameters (e.g., specific conditions)
  if (req.query.validate === "true") {
    // Perform additional validation logic
  }

  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated event
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/events/:id", verifyToken, async (req, res) => {
  // Check query parameters (e.g., specific conditions)
  if (req.query.validate === "true") {
    // Perform additional validation logic
  }

  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
