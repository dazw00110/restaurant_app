const express = require("express");
const Dish = require("../models/dish");
const { verifyToken, admin } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

// Dodanie nowego dania
router.post("/", verifyToken, admin, async (req, res) => {
  const dishes = req.body.dishes; // Zmieniamy, żeby otrzymać tablicę dań

  try {
    const addedDishes = [];
    for (const dishData of dishes) {
      const { name, price, description } = dishData;
      const dish = new Dish({ name, price, description });
      await dish.save();
      addedDishes.push(dish);
    }
    res.status(201).json({ message: "Dishes added successfully", dishes: addedDishes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Trasa PUT do aktualizacji dania
router.put("/edit/:id", verifyToken, admin, async (req, res) => {
  try {
    const { id } = req.params; // Pobieramy ID z parametru URL
    const { price, description, name } = req.body; // Wyciąganie właściwości z ciała zapytania

    // Sprawdzamy, czy id jest poprawnym ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Nieprawidłowy identyfikator dania" });
    }

    // Znajdź danie po ID
    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ message: "Danie nie istnieje." });
    }

    // Zaktualizuj dane dania
    if (price) dish.price = price;
    if (description) dish.description = description;
    if (name) dish.name = name;
    updated_at = new Date(); // Aktualizacja daty modyfikacji

    // Zapisz zmodyfikowane dane dania
    const updatedDish = await dish.save();

    res.json({
      message: "Danie zaktualizowane pomyślnie.",
      dish: updatedDish,
    });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

router.delete("/delete/:id",verifyToken, admin, async (req, res) => {
  try {
    let { id } = req.params; // Pobranie ID dania z parametrów URL
    id = id.trim();
    // Sprawdzamy, czy id jest poprawnym ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Nieprawidłowy identyfikator dania" });
    }

    // Wyszukaj i usuń danie po ID
    const dish = await Dish.findByIdAndDelete(id);
    if (!dish) {
      return res.status(404).json({ message: "Danie nie istnieje" });
    }

    // Zwrócenie odpowiedzi po udanym usunięciu
    res.json({
      message: "Danie zostało pomyślnie usunięte",
      deletedDish: {
        id: dish._id,
        name: dish.name,
        price: dish.price,
        description: dish.description,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Get all dishes (available to everyone)
router.get("/", verifyToken, async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get dish by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // Pobranie ID dania z parametrów URL

    // Sprawdzamy, czy id jest poprawnym ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Nieprawidłowy identyfikator dania" });
    }

    // Wyszukaj danie po ID
    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ message: "Danie nie istnieje" });
    }

    // Zwrócenie szczegółów dania
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

module.exports = router;
