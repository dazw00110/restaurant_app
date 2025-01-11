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
    unique: true,
  },
  phone: {
    type: String,
    match: /^[0-9]{9}$/,
    required: true,
    unique: true,
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

// Metoda do porównania podanego hasła z zapisanym hasłem
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
