const express = require("express");
const router = express.Router();
const db = require("../db").default;

// Test DB API
router.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database query failed",
        error: err
      });
    }

    res.json({
      success: true,
      message: "Database API working perfectly",
      result: result
    });
  });
});

module.exports = router;
