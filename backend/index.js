setPersonnelList((prevList) => [...prevList, newPerson]);
useEffect(() => {
    // Perform actions when personnelList changes
  }, [personnelList]);
  
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Setup multer for file storage (upload to 'uploads' folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // generate unique filename
  },
});

const upload = multer({ storage });

// Parse JSON bodies
app.use(express.json());

// Connect to MySQL Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Canada@2026!',
  database: 'military_mis',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database');
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// POST route to add new personnel (with photo upload)
app.post('/api/personnel', upload.single('photo'), (req, res) => {
  const { name, rank, status } = req.body;
  const photo = req.file ? req.file.filename : null; // Get the uploaded file name

  if (!name || !rank || !status) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Use backticks around `rank` to avoid SQL errors due to the reserved keyword
  const query = 'INSERT INTO personnel (name, `rank`, status, photo) VALUES (?, ?, ?, ?)';
  db.execute(query, [name, rank, status, photo], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to add personnel' });
    }
    res.status(201).json({ message: 'Personnel added successfully', personnelId: results.insertId });
  });
});

// GET route to retrieve all personnel
app.get('/api/personnel', (req, res) => {
  const query = 'SELECT * FROM personnel';
  db.execute(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve personnel' });
    }
    res.status(200).json(results);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
