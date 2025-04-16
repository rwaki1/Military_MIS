// backend/controllers/personnelController.js
const db = require("../config/db");

// GET all personnel
const getAllPersonnel = (req, res) => {
  db.query("SELECT * FROM personnel", (err, results) => {
    if (err) {
      console.error("Error fetching personnel:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

// POST new personnel
const addPersonnel = (req, res) => {
  const { name, rank, status } = req.body;

  if (!name || !rank || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = "INSERT INTO personnel (name, rank, status) VALUES (?, ?, ?)";
  db.query(sql, [name, rank, status], (err, result) => {
    if (err) {
      console.error("Error adding personnel:", err);
      return res.status(500).json({ error: "Insert failed" });
    }
    res.status(201).json({ id: result.insertId, name, rank, status });
  });
};

module.exports = { getAllPersonnel, addPersonnel };
