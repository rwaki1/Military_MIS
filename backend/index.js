require('dotenv').config(); // Always load env first

const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'military_mis'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to the database');
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 🔄 GET all personnel + military assignment
app.get('/api/personnel', (req, res) => {
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
    FROM personnel p
    LEFT JOIN military_assignments m ON p.army_number = m.army_number
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching personnel:', err);
      return res.status(500).json({ message: 'Failed to fetch personnel' });
    }
    res.status(200).json(results);
  });
});

// ➕ POST new personnel
app.post('/api/personnel', upload.single('photo'), (req, res) => {
  const {
    name, grade, status, date_of_birth, army_number,
    role, region, brigade, battalion,
    weapon_serial_number, radio_serial_number
  } = req.body;
  const photo = req.file ? req.file.filename : null;

  // First check if army_number exists
  db.query('SELECT * FROM personnel WHERE army_number = ?', [army_number], (err, results) => {
    if (err) {
      console.error('❌ Error checking army_number:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Army number already exists' });
    }

    // Insert personnel
    const insertPersonnel = `
      INSERT INTO personnel (name, grade, status, date_of_birth, army_number, photo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(insertPersonnel, [name, grade, status, date_of_birth, army_number, photo], (err2) => {
      if (err2) {
        console.error('❌ Error inserting personnel:', err2);
        return res.status(500).json({ message: 'Failed to add personnel' });
      }

      const insertAssignment = `
        INSERT INTO military_assignments (army_number, role, region, brigade, battalion, weapon_serial_number, radio_serial_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(insertAssignment, [army_number, role, region, brigade, battalion, weapon_serial_number, radio_serial_number], (err3) => {
        if (err3) {
          console.error('❌ Error inserting assignment:', err3);
          return res.status(500).json({ message: 'Failed to add military assignment' });
        }

        res.status(200).json({ message: '✅ Personnel and assignment added successfully', photo });
      });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
