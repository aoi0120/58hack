const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const secret = process.env.SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfiguration" });
    }
    const decoded = jwt.verify(token, secret, {
      algorithms: [process.env.JWT_ALG || "HS256"],
    });
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;
