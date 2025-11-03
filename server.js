const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = "mysecretkey";

// Simulated user and account
const user = { username: "user1", password: "password123" };
let balance = 1000;

// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
}

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== user.username || password !== user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// Balance route
app.get("/balance", authenticateToken, (req, res) => {
  res.json({ balance });
});

// Deposit route
app.post("/deposit", authenticateToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }
  balance += amount;
  res.json({ message: `Deposited $${amount}`, newBalance: balance });
});

// Withdraw route
app.post("/withdraw", authenticateToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }
  if (amount > balance) {
    return res.status(400).json({ message: "Insufficient funds" });
  }
  balance -= amount;
  res.json({ message: `Withdrawn $${amount}`, newBalance: balance });
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
