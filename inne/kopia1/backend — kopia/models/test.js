const bcrypt = require("bcryptjs");

// Hasło, które chcesz zapisać
const plainPassword = "adminpassword";

// Haszowanie hasła
bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
  if (err) throw err;
  console.log("Hashed password:", hashedPassword);

  // Teraz użyj 'hashedPassword' do zapisania w bazie danych
});