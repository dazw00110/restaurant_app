const express = require("express");
const Dish = require("../models/dish");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Add a new dish (available to admin)
router.post("/", admin, async (req, res) => {
  const { name, price, description } = req.body;

  try {
    const dish = new Dish({ name, price, description });
    await dish.save();
    res.status(201).json({ message: "Dish added successfully", dish });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all dishes (available to everyone)
router.get("/", async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
