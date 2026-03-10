const sqlite3 = require('sqlite3');

// The correct hash for 'admin123'
const correctHash = '$2a$10$7ww8FzRGzj4k6cHcdzLjqez1PNlQGBTirg5wuqw/JFe54AnULY10u';

const db = new sqlite3.Database('./laundry_db.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        db.run('UPDATE users SET password = ? WHERE email = ?', [correctHash, 'admin@laundry.com'], function (err) {
            if (err) {
                console.error('Error updating password', err.message);
            } else {
                console.log('Password updated successfully. Rows affected:', this.changes);
            }
        });
    }
});
