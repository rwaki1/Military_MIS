// backend/routes/personnel.js
const express = require("express");
const router = express.Router();
const { getAllPersonnel, addPersonnel } = require("../controllers/personnelController");

router.get("/", getAllPersonnel);
router.post("/", addPersonnel);

module.exports = router;