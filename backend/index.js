require('dotenv').config(); // Always load env first

const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');

const app = express(); // ✅ Move this BEFORE app.use()

// const personnelRoutes = require('./routes/personnelRoutes');
// const militaryUnitsRoutes = require('./routes/militaryUnitsRoutes');

// app.use('/api/personnel', personnelRoutes);
// app.use('/api/military-units', militaryUnitsRoutes);

const battalionsRoutes = require('./routes/battalionsRoutes');
const brigadesRoutes = require('./routes/brigadesRoutes');
const gradesRoutes = require('./routes/gradesRoutes');
const regionsRoutes = require('./routes/regionsRoutes');
const rolesRoutes = require('./routes/rolesRoutes');

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

/**
 * 🔄 GET all personnel with joined assignment and grade data
 */
app.get('/api/personnel', (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.grade_id,
      g.grade_name,
      p.status,
      p.date_of_birth,
      p.army_number,
      p.photo,
      r.role_name AS role,
      reg.region_name AS region,
      b.brigade_name AS brigade,
      bat.battalion_name AS battalion,
      m.weapon_serial_number,
      m.radio_serial_number
    FROM personnel p
    LEFT JOIN grades g ON p.grade_id = g.id
    LEFT JOIN military_assignments m ON p.army_number = m.army_number
    LEFT JOIN roles r ON m.role_id = r.id
    LEFT JOIN regions reg ON m.region_id = reg.id
    LEFT JOIN brigades b ON m.brigade_id = b.id
    LEFT JOIN battalions bat ON m.battalion_id = bat.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching personnel:', err);
      return res.status(500).json({ message: 'Failed to fetch personnel', error: err });
    }
    res.status(200).json(results);
  });
});

/**
 * ➕ POST new personnel with assignment
 */
app.post('/api/personnel', upload.single('photo'), (req, res) => {
  const {
    name,
    grade_id,
    status,
    date_of_birth,
    army_number,
    role_id,
    region_id,
    brigade_id,
    battalion_id,
    weapon_serial_number,
    radio_serial_number
  } = req.body;

  const photo = req.file ? req.file.filename : null;

  // Check for duplicate army_number
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
      INSERT INTO personnel (name, grade_id, status, date_of_birth, army_number, photo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertPersonnel,
      [name, grade_id || null, status, date_of_birth, army_number, photo],
      (err2) => {
        if (err2) {
          console.error('❌ Error inserting personnel:', err2);
          return res.status(500).json({ message: 'Failed to add personnel', error: err2 });
        }

        // Insert military assignment
        const insertAssignment = `
          INSERT INTO military_assignments (
            army_number, role_id, region_id, brigade_id, battalion_id,
            weapon_serial_number, radio_serial_number
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertAssignment,
          [
            army_number,
            role_id || null,
            region_id || null,
            brigade_id || null,
            battalion_id || null,
            weapon_serial_number || null,
            radio_serial_number || null
          ],
          (err3) => {
            if (err3) {
              console.error('❌ Error inserting assignment:', err3);
              return res.status(500).json({ message: 'Failed to add military assignment', error: err3 });
            }

            res.status(201).json({
              message: '✅ Personnel and assignment added successfully',
              photo
            });
          }
        );
      }
    );
  });
});

//Routes
app.use('/api/battalions', battalionsRoutes);
app.use('/api/brigades', brigadesRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/roles', rolesRoutes);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
