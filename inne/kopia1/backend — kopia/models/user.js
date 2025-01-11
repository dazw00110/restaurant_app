const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  pesel: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    type: String,
    match: /^[0-9]{9}$/,
    required: true,
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "cashier"],
    default: "cashier", // Domyślnie kasjer, admin może ustawić rolę
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Przed zapisaniem użytkownika, hasło jest haszowane
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // Jeżeli hasło nie zostało zmienione, przechodzimy dalej
  }

  // Haszowanie hasła przed zapisaniem
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metoda do porównania podanego hasła z zapisanym hasłem
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
 