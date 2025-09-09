const mysql = require('mysql2');
const chalk = require('chalk').default;
const { exec } = require('child_process');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const readlineSync = require('readline-sync');

const PHOTO_DIR = 'C:\\Users\\LENOVO\\military-mis\\backend\\uploads\\';

// Helper to safely close connection only once
function safeEnd(conn) {
  if (conn && conn.state !== 'disconnected') {
    conn.end();
  }
}

function askCredentials(callback) {
  const dbUser = readlineSync.question(chalk.blue.bold('Enter DB username: '));
  const dbPass = readlineSync.question(chalk.blue.bold('Enter DB password: '), { hideEchoBack: true });
  callback(dbUser.trim(), dbPass.trim());
}

function exportToCSV(data, filename = 'personnel_export.csv') {
  const csvWriter = createCsvWriter({
    path: filename,
    header: [
      {id: 'name', title: 'Name'},
      {id: 'grade_name', title: 'Grade'},
      {id: 'status', title: 'Status'},
      {id: 'date_of_birth', title: 'Date of Birth'},
      {id: 'army_number', title: 'Army Number'},
      {id: 'role_name', title: 'Role'},
      {id: 'region_name', title: 'Region'},
      {id: 'brigade_name', title: 'Brigade'},
      {id: 'battalion_name', title: 'Battalion'},
      {id: 'weapon_serial_number', title: 'Weapon SN'},
      {id: 'radio_serial_number', title: 'Radio SN'},
      {id: 'photo', title: 'Photo'}
    ]
  });
  csvWriter.writeRecords(data)
    .then(() => {
      console.log(chalk.green(`Exported to ${filename}`));
    });
}

function displayPersonnel(match) {
  const line = chalk.yellow('+' + '-'.repeat(40) + '+');
  console.log(line);
  console.log(chalk.yellow('|') + ' ' + chalk.white.bold.bgBlue('      PERSONNEL DETAILS      ').padEnd(39) + chalk.yellow('|'));
  console.log(line);
  console.log(chalk.yellow('|') + ' Name:       ' + chalk.green.bold(match.name).padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Grade:      ' + chalk.green.bold(match.grade_name || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Status:     ' + chalk.green.bold(match.status || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' DOB:        ' + chalk.green.bold(match.date_of_birth || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Army #:     ' + chalk.green.bold(match.army_number || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Role:       ' + chalk.green.bold(match.role_name || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Region:     ' + chalk.green.bold(match.region_name || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Brigade:    ' + chalk.green.bold(match.brigade_name || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Battalion:  ' + chalk.green.bold(match.battalion_name || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Weapon SN:  ' + chalk.green.bold(match.weapon_serial_number || '').padEnd(25) + chalk.yellow('|'));
  console.log(chalk.yellow('|') + ' Radio SN:   ' + chalk.green.bold(match.radio_serial_number || '').padEnd(25) + chalk.yellow('|'));
  if (match.photo) {
    const imgFrameLine = chalk.magenta('+' + '-'.repeat(36) + '+');
    console.log(imgFrameLine);
    console.log(
      chalk.magenta('|') +
      chalk.white.bold.bgMagenta('        PHOTO PREVIEW        ').padEnd(35) +
      chalk.magenta('|')
    );
    console.log(imgFrameLine);
    console.log(
      chalk.magenta('|') +
      ' ' +
      chalk.green.bold(match.photo).padEnd(34) +
      chalk.magenta('|')
    );
    console.log(imgFrameLine);
  }
  console.log(line);
}

askCredentials((dbUser, dbPass) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: dbUser,
    password: dbPass,
    database: 'military_mis'
  });

  const choice = readlineSync.question(
    chalk.blue.bold("Search by (1) Army Number, (2) Region, (3) Brigade, (4) Battalion: ")
  );
  let promptText = "";
  let query = "";

  switch (choice.trim()) {
    case "1":
      promptText = "Enter Army Number: ";
      query = `SELECT 
        p.*,
        g.grade_name,
        ma.weapon_serial_number,
        ma.radio_serial_number,
        r.role_name,
        reg.region_name,
        b.brigade_name,
        bt.battalion_name
      FROM personnel p
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN military_assignments ma ON p.army_number = ma.army_number
      LEFT JOIN roles r ON ma.role_id = r.id
      LEFT JOIN regions reg ON ma.region_id = reg.id
      LEFT JOIN brigades b ON ma.brigade_id = b.id
      LEFT JOIN battalions bt ON ma.battalion_id = bt.id
      WHERE p.army_number = ?`;
      break;
    case "2":
      promptText = "Enter Region Name: ";
      query = `SELECT 
        p.*,
        g.grade_name,
        ma.weapon_serial_number,
        ma.radio_serial_number,
        r.role_name,
        reg.region_name,
        b.brigade_name,
        bt.battalion_name
      FROM personnel p
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN military_assignments ma ON p.army_number = ma.army_number
      LEFT JOIN roles r ON ma.role_id = r.id
      LEFT JOIN regions reg ON ma.region_id = reg.id
      LEFT JOIN brigades b ON ma.brigade_id = b.id
      LEFT JOIN battalions bt ON ma.battalion_id = bt.id
      WHERE reg.region_name LIKE CONCAT('%', ?, '%')`;
      break;
    case "3":
      promptText = "Enter Brigade Name: ";
      query = `SELECT 
        p.*,
        g.grade_name,
        ma.weapon_serial_number,
        ma.radio_serial_number,
        r.role_name,
        reg.region_name,
        b.brigade_name,
        bt.battalion_name
      FROM personnel p
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN military_assignments ma ON p.army_number = ma.army_number
      LEFT JOIN roles r ON ma.role_id = r.id
      LEFT JOIN regions reg ON ma.region_id = reg.id
      LEFT JOIN brigades b ON ma.brigade_id = b.id
      LEFT JOIN battalions bt ON ma.battalion_id = bt.id
      WHERE b.brigade_name LIKE CONCAT('%', ?, '%')`;
      break;
    case "4":
      promptText = "Enter Battalion Name: ";
      query = `SELECT 
        p.*,
        g.grade_name,
        ma.weapon_serial_number,
        ma.radio_serial_number,
        r.role_name,
        reg.region_name,
        b.brigade_name,
        bt.battalion_name
      FROM personnel p
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN military_assignments ma ON p.army_number = ma.army_number
      LEFT JOIN roles r ON ma.role_id = r.id
      LEFT JOIN regions reg ON ma.region_id = reg.id
      LEFT JOIN brigades b ON ma.brigade_id = b.id
      LEFT JOIN battalions bt ON ma.battalion_id = bt.id
      WHERE bt.battalion_name LIKE CONCAT('%', ?, '%')`;
      break;
    default:
      console.log(chalk.red("Invalid choice."));
      safeEnd(connection);
      return;
  }

  const searchValue = readlineSync.question(chalk.blue.bold(promptText));
  connection.query(query, [searchValue.trim()], (err, results) => {
    if (err) {
      console.log(chalk.red("Database error: " + err.message));
      safeEnd(connection);
      return;
    }
    if (results.length > 0) {
      results.forEach((match, idx) => {
        console.log(chalk.green.bold(`\nResult #${idx + 1}:`));
        displayPersonnel(match);
      });

      const exportAnswer = readlineSync.question(chalk.blue("Export all results to CSV? (y/n): "));
      if (exportAnswer.trim().toLowerCase() === 'y' || exportAnswer.trim().toLowerCase() === 'yes') {
        exportToCSV(results);
      }
      if (choice.trim() === "1" && results[0].photo) {
        const photoAnswer = readlineSync.question(chalk.blue("Open photo? (y/n): "));
        if (photoAnswer.trim().toLowerCase() === 'y' || photoAnswer.trim().toLowerCase() === 'yes') {
          const photoPath = PHOTO_DIR + results[0].photo;
          exec(`start "" "${photoPath}"`);
        }
      }
      safeEnd(connection);
    } else {
      console.log(chalk.red("No personnel found for your search."));
      safeEnd(connection);
    }
  });
});