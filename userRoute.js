const express = require("express");
const router = express.Router();
const db = require("../config/db");

/*
-------------------------------------------------
USER REGISTRATION API
URL  : POST /api/users/register
BODY : { name, email, password }
-------------------------------------------------
*/
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  // Check if user already exists
  const checkUserQuery = "SELECT * FROM user WHERE email = ?";

  db.query(checkUserQuery, [email], (err, result) => {
   if (err) {
      console.error("Check user error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (result.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Insert new user
    const insertUserQuery =
      "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";

    db.query(insertUserQuery, [name, email, password], (err, result) => {
      if (err) {
        console.error("Insert user error:", err);
        return res.status(500).json({
          success: false,
          message: "User registration failed"
        });
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user_id: result.insertId
      });
    });
  });
});

/*
-------------------------------------------------
TEST ROUTE (OPTIONAL – FOR BROWSER CHECK)
URL : GET /api/users
-------------------------------------------------
*/
router.get("/", (req, res) => {
  res.send("User API is working");
});

module.exports = router;


/*
-------------------------------------------------
USER LOGIN API
URL  : POST /api/users/login
BODY : { email, password }
-------------------------------------------------
*/
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  // Check user in database
  const loginQuery = "SELECT * FROM user WHERE email = ?";

  db.query(loginQuery, [email], (err, result) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result[0];

    // Password check (plain text for now)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Login success
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email
      }
    });
  });
});
module.exports = router;