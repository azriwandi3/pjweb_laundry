const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./laundry_db.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        db.get('SELECT * FROM users WHERE email="admin@laundry.com"', (err, row) => {
            if (err) {
                console.error(err);
            } else if (row) {
                console.log('Found admin user:', row);
                const isMatch = bcrypt.compareSync('admin123', row.password);
                console.log('Password match with "admin123"?', isMatch);
            } else {
                console.log('No user found with email admin@laundry.com');
            }
        });
    }
});
