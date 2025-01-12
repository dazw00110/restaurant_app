const express = require("express");
const Order = require("../models/order");
const { verifyToken, admin } = require("../middleware/authMiddleware");
const Dish = require("../models/dish"); // Dodaj ten import na początku pliku
const mongoose = require("mongoose");

const router = express.Router();

// Tworzenie nowego zamówienia
router.post("/create", verifyToken, async (req, res) => {
  const { items } = req.body;

  try {
    // Pobranie wszystkich dań z bazy danych, które są używane w zamówieniu
    const dishes = await Dish.find({
      _id: { $in: items.map((item) => item.dish) },
    });

    // Obliczanie całkowitej ceny zamówienia
    const totalPrice = items.reduce((total, item) => {
      const dish = dishes.find(
        (d) => d._id.toString() === item.dish.toString()
      );
      if (!dish) {
        throw new Error(`Dish with ID ${item.dish} not found`);
      }
      return total + dish.price * item.quantity;
    }, 0);

    // Tworzenie nowego zamówienia z obliczoną ceną
    const order = new Order({
      user: req.user.id,
      items,
      totalPrice, // Przypisanie obliczonej ceny
    });

    await order.save();

    // Wypełnienie danych o daniach z ich cenami jednostkowymi
    const populatedOrder = await Order.findById(order._id).populate(
      "items.dish",
      "price name"
    );

    // Zmiana struktury odpowiedzi, dodanie ceny jednostkowej
    const responseOrder = populatedOrder.toObject();
    responseOrder.items = responseOrder.items.map((item) => {
      const dish = item.dish; // To jest załadowane dane dania
      return {
        ...item,
        lineTotal: dish.price * item.quantity, // Dodanie ceny jednostkowej
      };
    });

    res.status(201).json({
      message: "Zamówienie utworzono pomyślnie",
      order: responseOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Get all orders (available to cashiers)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { status } = req.query; // Filtrowanie zamówień po statusie (opcjonalne)
    const query = status ? { status } : {}; // Jeśli status jest podany, dodajemy go do query

    const orders = await Order.find(query).populate(
      "user",
      "firstName lastName"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific order by ID
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Pobranie zamówienia z bazy danych, uwzględniając dane użytkownika oraz dania w zamówieniu
    const order = await Order.findById(id)
      .populate("user", "firstName lastName")
      .populate("items.dish"); // Ważne jest, aby załadować dania z pola "items.dish"

    if (!order) {
      return res.status(404).json({ message: "Zamówienie nie znaleziono." });
    }

    // Sprawdzenie, czy wszystkie dania istnieją
    order.items.forEach((item) => {
      if (!item.dish) {
        throw new Error(`Danie o ID ${item.dish} nie istnieje.`);
      }
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Ścieżka do pobierania historii wszystkich zamówień
router.get("/history", verifyToken, async (req, res) => {
  try {
    const { status } = req.query; // Filtrowanie historii zamówień po statusie (opcjonalne)
    const query = status ? { status } : {}; // Jeśli status jest podany, dodajemy go do query

    const historyOrders = await HistoryOrder.find(query).populate(
      "user",
      "firstName lastName"
    );
    res.json(historyOrders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Edit order status (Admin only)
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status, items } = req.body;

  // Sprawdzamy, czy status jest jednym z dozwolonych
  if (!["in-progress", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Nieprawidłowy status" });
  }

  try {
    const order = await Order.findById(id);

    // Jeśli zamówienie nie istnieje, zwracamy 404
    if (!order) {
      return res.status(404).json({ message: "Zamówienie nie znaleziono." });
    }

    // Sprawdzamy czy wszystkie podane dania istnieją
    const Dish = mongoose.model("Dish"); // Model Dish dla sprawdzenia
    const dishIds = items.map((item) => item.dish);
    const dishes = await Dish.find({ _id: { $in: dishIds } });

    if (dishes.length !== dishIds.length) {
      return res.status(400).json({ message: "Niektóre dania nie istnieją." });
    }

    // Aktualizacja statusu
    order.status = status;
    if (items) {
      // Jeśli są podane nowe pozycje, aktualizujemy je
      order.items = items;
    }

    const updatedOrder = await order.save();

    res.json({
      message: "Status zamówienia zaktualizowany pomyślnie.",
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Usuwanie zamówienia
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Zamówienie nie znaleziono." });
    }

    res.json({
      message: "Zamówienie zostało pomyślnie usunięte",
      deletedOrder: order,
    });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

module.exports = router;
