const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  // Dodaj logowanie tokenu, aby sprawdzić, czy jest obecny
  console.log("Token z nagłówków: ", token);

  if (!token) {
    return res.status(401).json({ message: "Brak tokenu" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token jest nieprawidłowy" });
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

module.exports = { protect, admin };
