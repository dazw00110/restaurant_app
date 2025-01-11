const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Register a new user (cashier)
router.post("/register", async (req, res) => {
  const { firstName, lastName, pesel, phone, email, password, role } = req.body;

  try {
    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      pesel,
      phone,
      email,
      password,
      role,
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log(err);
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Logged in successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
// Endpoint do wypisania wszystkich użytkowników
router.get("/", protect, admin, async (req, res) => {
  try {
    // Pobranie wszystkich użytkowników z bazy
    const users = await User.find().select("-password"); // Usuwamy pole "password" z odpowiedzi
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log(err);
  }
});
*/

// Endpoint do wypisania wszystkich użytkowników
router.get("/", async (req, res) => {
  console.log("GET /api/users/ - Request received");
  try {
    const users = await User.find().select("-password");
    console.log("Users fetched:", users);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    // req.user zawiera dane użytkownika po zweryfikowaniu tokenu
    const user = req.user;

    // Możesz teraz zwrócić dane użytkownika
    res.json({
      message: "Aktualny użytkownik",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

module.exports = router;
