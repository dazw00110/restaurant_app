const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/user"); // Ścieżka do Twojego modelu użytkownika

// Łączymy się z MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Połączono z bazą danych MongoDB");
  })
  .catch((err) => {
    console.error("Błąd połączenia z MongoDB:", err);
  });

// Funkcja do haszowania hasła i zapisywania użytkownika
async function hashAndSavePassword() {
  const plainPassword = "adminpassword"; // Hasło, które chcesz zhaszować

  // Haszowanie hasła
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  console.log("Zhashedowane hasło:", hashedPassword);

  // Tworzymy nowego użytkownika
  const newUser = new User({
    firstName: "Admin",
    lastName: "Adminowski",
    pesel: "12345678901",
    email: "admin@example.com",
    phone: "123456789",
    password: hashedPassword,
    role: "admin", // Rola admina
  });

  try {
    // Zapisujemy użytkownika do bazy danych
    await newUser.save();
    console.log("Nowy użytkownik zapisany pomyślnie!");
  } catch (err) {
    console.error("Błąd zapisywania użytkownika:", err);
  }
}

// Uruchamiamy funkcję
hashAndSavePassword();
