require("dotenv").config(); // Ładuje zmienne środowiskowe z pliku .env
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Importujemy cookie-parser

const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dishRoutes = require("./routes/dishRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware do przetwarzania JSON
app.use(cors()); // Middleware do obsługi CORS
app.use(cookieParser()); // Używamy cookie-parser do przetwarzania ciasteczek

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant API!");
});

app.use("/api/users", userRoutes); // Ścieżka dla użytkowników
app.use("/api/orders", orderRoutes); // Ścieżka dla zamówień
app.use("/api/dishes", dishRoutes); // Ścieżka dla dań

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
