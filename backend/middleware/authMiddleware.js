const jwt = require("jsonwebtoken");

// Middleware do weryfikacji tokena
const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Pobierz token z ciasteczka

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // Weryfikacja tokena
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Przechowuj dane użytkownika w obiekcie req
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Brak uprawnień do wykonania tej operacji" });
  }
};

module.exports = { verifyToken, admin };
