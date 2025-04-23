const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

// ✅ CSV path (update filename if needed)
const csvFilePath = 'C:/Users/LENOVO/military-mis/backend/csv_files/personnel.csv';

// ✅ MySQL DB connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Canada@2026!',
  database: 'military_mis'
});

// ✅ Connect to DB
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database.');
  processCSV();
});

// ✅ Process CSV and insert into DB
function processCSV() {
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', () => {
      console.log(`📄 CSV read complete. Rows found: ${results.length}`);

      results.forEach((row, i) => {
        const { name, rank, status, army_number, role, photo } = row;

        const query = `
          INSERT INTO personnel (name, \`rank\`, status, army_number, role, photo)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [name, rank, status, army_number, role, photo], (err) => {
          if (err) {
            console.error(`❌ Row ${i + 1} insert failed:`, err.sqlMessage);
          } else {
            console.log(`✅ Row ${i + 1} inserted: ${name}`);
          }
        });
      });

      // Close connection after delay to let inserts finish
      setTimeout(() => {
        db.end();
        console.log('🔚 DB connection closed.');
      }, 2000);
    })
    .on('error', (err) => {
      console.error('❌ Error reading CSV:', err.message);
      db.end();
    });
}
