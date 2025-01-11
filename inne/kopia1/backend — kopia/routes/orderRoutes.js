const express = require('express');
const Order = require('../models/order');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/*
// Tworzenie nowego zamówienia
router.post("/", protect, async (req, res) => {
  const { items } = req.body;

  try {
    const order = new Order({
      user: req.user.id,
      items, // Przekazujemy tylko ID dań i ilości
    });

    await order.save();

    res.status(201).json({
      message: "Zamówienie utworzono pomyślnie",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});
*/

// Tworzenie nowego zamówienia
router.post("/", async (req, res) => {
  const { items } = req.body;

  try {
    const order = new Order({
      user: req.user.id,
      items, // Przekazujemy tylko ID dań i ilości
    });

    await order.save();

    res.status(201).json({
      message: "Zamówienie utworzono pomyślnie",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Get all orders (available to cashiers)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'firstName lastName');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
