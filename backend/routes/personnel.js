const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); // Add CORS if frontend is separate

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS
app.use('/uploads', express.static('uploads')); // Serve photo files

// Setup MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password', // 🔒 Replace with actual
  database: 'military_mis',
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to the database!');
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ POST: Add personnel and assignment
app.post('/api/personnel', upload.single('photo'), (req, res) => {
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

  // First, check if the army_number already exists
  const checkQuery = 'SELECT * FROM personnel WHERE army_number = ?';
  db.query(checkQuery, [army_number], (err, results) => {
    if (err) {
      console.error('❌ Error checking personnel existence:', err);
      return res.status(500).json({ message: 'Failed to check personnel', error: err });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Personnel with this army number already exists.' });
    }

    // Proceed with the insertion if army_number is not found
    const personnelQuery = `
      INSERT INTO personnel (name, \`grade\`, status, date_of_birth, army_number, photo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
      personnelQuery,
      [name, grade, status, date_of_birth, army_number, photo],
      (err, result) => {
        if (err) {
          console.error('❌ Error inserting personnel data:', err);
          return res.status(500).json({ message: 'Error adding personnel', error: err });
        }

        const militaryAssignmentsQuery = `
          INSERT INTO military_assignments (army_number, role, region, brigade, battalion, weapon_serial_number, radio_serial_number)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
          militaryAssignmentsQuery,
          [army_number, role, region, brigade, battalion, weapon_serial_number, radio_serial_number],
          (err2, result2) => {
            if (err2) {
              console.error('❌ Error inserting assignment:', err2);
              return res.status(500).json({ message: 'Error adding assignment', error: err2 });
            }

            res.status(200).json({ message: '✅ Personnel and assignment added successfully', photo });
          }
        );
      }
    );
  });
});

// ✅ GET: Fetch personnel with assignments
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
    FROM 
      personnel p
    LEFT JOIN 
      military_assignments m ON p.army_number = m.army_number
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching data:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }
    res.status(200).json(results);
  });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
