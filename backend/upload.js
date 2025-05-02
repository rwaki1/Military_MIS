const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

// ✅ CSV path
const csvFilePath = 'C:/Users/LENOVO/military-mis/backend/csv_files/personnel.csv';

// ✅ MySQL DB connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Canada@2026!',
  database: 'military_mis',
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database.');
  processCSV();
});

function processCSV() {
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', () => {
      console.log(`📄 CSV read complete. Rows found: ${results.length}`);

      results.forEach((row, i) => {
        const {
          name,
          grade,
          status,
          army_number,
          date_of_birth,
          photo,
          role,
          region,
          brigade,
          battalion,
          weapon_serial_number,
          radio_serial_number,
        } = row;

        const personnelQuery = `
          INSERT INTO personnel (name, grade, status, army_number, date_of_birth, photo)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            grade = VALUES(grade),
            status = VALUES(status),
            date_of_birth = VALUES(date_of_birth),
            photo = VALUES(photo)
        `;

        const personnelValues = [
          name,
          grade,
          status,
          army_number,
          date_of_birth || '1970-01-01',
          photo || null,
        ];

        db.query(personnelQuery, personnelValues, (err) => {
          if (err) {
            console.error(`❌ Personnel insert failed (row ${i + 1}):`, err.sqlMessage);
            return;
          }

          const assignmentQuery = `
            INSERT INTO military_assignments 
              (army_number, role, region, brigade, battalion, weapon_serial_number, radio_serial_number)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              role = VALUES(role),
              region = VALUES(region),
              brigade = VALUES(brigade),
              battalion = VALUES(battalion),
              weapon_serial_number = VALUES(weapon_serial_number),
              radio_serial_number = VALUES(radio_serial_number)
          `;

          const assignmentValues = [
            army_number,
            role,
            region,
            brigade,
            battalion,
            weapon_serial_number,
            radio_serial_number,
          ];

          db.query(assignmentQuery, assignmentValues, (err2) => {
            if (err2) {
              console.error(`❌ Assignment insert failed (row ${i + 1}):`, err2.sqlMessage);
            } else {
              console.log(`✅ Row ${i + 1} inserted: ${name}`);
            }
          });
        });
      });

      // Delay DB close to ensure all inserts complete
      setTimeout(() => {
        db.end();
        console.log('🔚 DB connection closed.');
      }, 3000);
    })
    .on('error', (err) => {
      console.error('❌ Error reading CSV:', err.message);
      db.end();
    });
}
