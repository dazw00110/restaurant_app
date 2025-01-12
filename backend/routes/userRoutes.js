const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { verifyToken, admin } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const router = express.Router();

// User registration
router.post("/register", async (req, res) => {
  const { firstName, lastName, pesel, phone, email, password, role } = req.body;

  try {
    // Walidacja wymaganych pól
    if (!firstName || !lastName || !pesel || !phone || !email || !password) {
      return res.status(400).json({ message: "Wszystkie pola są wymagane" });
    }

    // Sprawdzenie, czy użytkownik z danym adresem email istnieje
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email już istnieje" });
    }

    // Sprawdzenie, czy użytkownik z danym numerem PESEL istnieje
    const peselExists = await User.findOne({ pesel });
    if (peselExists) {
      return res.status(400).json({ message: "PESEL już istnieje" });
    }

    // Sprawdzenie, czy użytkownik z danym numerem PESEL istnieje
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Telefon już istnieje" });
    }

    // Utworzenie nowego użytkownika
    const hashedPassword = await bcrypt.hash(password, 10); // Haszowanie hasła
    const user = new User({
      firstName,
      lastName,
      pesel,
      phone,
      email,
      password: hashedPassword, // Przechowujemy haszowane hasło
      role: role || "cashier", // Domyślna rola to "cashier"
    });

    await user.save();

    res.status(201).json({
      message: "Użytkownik został pomyślnie utworzony",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Wystąpił błąd serwera" });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login request received:", { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        pesel: user.pesel,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Protect against CSRF
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    console.log("User logged in successfully:", { email, role: user.role });
    res.json({ message: "Logged in successfully", token, role: user.role });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint do wypisania wszystkich użytkowników
router.get("/", verifyToken, admin, async (req, res) => {
  try {
    // Pobranie wszystkich użytkowników z bazy
    const users = await User.find().select("-password"); // Usuwamy pole "password" z odpowiedzi
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log(err);
  }
});

// Endpoint do wypisania aktualnego użytkownika
router.get("/me", verifyToken, async (req, res) => {
  try {
    // Zakładając, że req.user zawiera dane użytkownika po weryfikacji tokenu
    const user = req.user;

    // Przekierowanie do endpointu /users/:id, gdzie :id to ID aktualnego użytkownika
    res.redirect(`/api/users/${user.id}`);
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Endpoint do wypisania użytkownika po ID
router.get("/:id", verifyToken, admin, async (req, res) => {
  let { id } = req.params;
  id = id.trim(); // Usunięcie ewentualnych białych znaków, w tym \n

  console.log("Id przekazane w zapytaniu:", id);

  // Sprawdzanie, czy id jest poprawnym ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Nieprawidłowy identyfikator użytkownika" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Endpoint do edycji użytkownika
router.put("/edit/:id", verifyToken, admin, async (req, res) => {
  try {
    const { id } = req.params; // Pobieramy ID z parametru URL
    const { firstName, lastName, phone, role, password, email, pesel } =
      req.body; // Bezpośrednie wyciąganie właściwości z body

    // Sprawdzamy, czy id jest poprawnym ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Nieprawidłowy identyfikator użytkownika" });
    }

    // Znajdź użytkownika po ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie istnieje." });
    }

    // Zaktualizuj dane użytkownika
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (pesel) user.pesel = pesel;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 10); // Haszowanie nowego hasła
    if (role) user.role = role;

    // Zaktualizowanie daty modyfikacji
    user.updatedAt = new Date(); // Aktualizacja daty modyfikacji

    const updatedUser = await user.save(); // Zapisz zmodyfikowane dane użytkownika

    res.json({
      message: "Użytkownik zaktualizowany pomyślnie.",
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        pesel: updatedUser.pesel,
        phone: updatedUser.phone,
        role: updatedUser.role,
        updated_at: updatedUser.updatedAt, // Zaktualizowana data
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Endpoint do usuwania użytkownika
router.delete("/delete/:id", verifyToken, admin, async (req, res) => {
  let { id } = req.params;
  id = id.trim(); // Usunięcie ewentualnych białych znaków, w tym \n

  // Sprawdzanie, czy id jest poprawnym ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Nieprawidłowy identyfikator użytkownika" });
  }

  try {
    // Wyszukiwanie i usuwanie użytkownika
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "Nie znaleziono użytkownika o podanym identyfikatorze.",
      });
    }

    res.json({
      message: "Użytkownik został pomyślnie usunięty",
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        pesel: user.pesel,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Błąd serwera",
      error: err.message,
    });
  }
});

module.exports = router;
