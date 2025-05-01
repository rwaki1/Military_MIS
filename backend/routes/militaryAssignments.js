const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const db = require('../db'); // Make sure your db connection is correct

// 📁 Setup file upload via multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ POST /api/personnel - Insert with duplicate check
router.post('/personnel', upload.single('photo'), (req, res) => {
  const {
    name,
    grade,
    status,
    date_of_birth,
    army_number,
    role,
    region,
    brigade,
    battalion,
    weapon_serial_number,
    radio_serial_number,
  } = req.body;

  const photo = req.file ? req.file.filename : null;

  // 🔍 Check for duplicate army_number
  const checkQuery = 'SELECT * FROM personnel WHERE army_number = ?';
  db.query(checkQuery, [army_number], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('❌ Error checking army number:', checkErr);
      return res.status(500).json({ message: 'Error checking army number' });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({ message: '❗ Army number already exists' });
    }

    // ➕ Insert into personnel
    const insertPersonnel = `
      INSERT INTO personnel (name, grade, status, date_of_birth, army_number, photo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(insertPersonnel, [name, grade, status, date_of_birth, army_number, photo], (err) => {
      if (err) {
        console.error('❌ Error inserting personnel:', err);
        return res.status(500).json({ message: 'Failed to insert personnel', error: err });
      }

      // ➕ Insert into military_assignments
      const insertAssignment = `
        INSERT INTO military_assignments (army_number, role, region, brigade, battalion, weapon_serial_number, radio_serial_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertAssignment, [army_number, role, region, brigade, battalion, weapon_serial_number, radio_serial_number], (err2) => {
        if (err2) {
          console.error('❌ Error inserting assignment:', err2);
          return res.status(500).json({ message: 'Failed to insert assignment', error: err2 });
        }

        res.status(200).json({ message: '✅ Personnel and assignment added successfully', photo });
      });
    });
  });
});

// ✅ GET /api/personnel - Joined personnel + assignments
router.get('/personnel', (req, res) => {
  const query = `
    SELECT 
      p.name,
      p.grade,
      p.status,
      p.date_of_birth,
      p.army_number,
      p.photo,
      m.role,
      m.region,
      m.brigade,
      m.battalion,
      m.weapon_serial_number,
      m.radio_serial_number
    FROM 
      personnel p
    LEFT JOIN 
      military_assignments m ON p.army_number = m.army_number
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching personnel data:', err);
      return res.status(500).json({ message: 'Failed to fetch data', error: err });
    }

    res.status(200).json(results);
  });
});

module.exports = router;
