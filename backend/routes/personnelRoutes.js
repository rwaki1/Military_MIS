const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');

// 🔽 Routes for Personnel CRUD & Related Filtering

// ➕ POST: Add new personnel and military assignments (with photo upload)
router.post('/', personnelController.upload.single('photo'), personnelController.addPersonnel);

// 🔍 GET: Fetch all personnel with full details
router.get('/', personnelController.getPersonnel);

// 📌 GET: Fetch brigades by selected region
router.get('/brigades', personnelController.getBrigadesByRegion);

// 📌 GET: Fetch battalions by selected brigade
router.get('/battalions', personnelController.getBattalionsByBrigade);

module.exports = router;
