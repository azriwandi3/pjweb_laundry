const { Pool } = require('pg');

const passwords = ['postgres', 'root', 'admin', 'password', '123456', ''];
const testConnection = async () => {
    for (const pwd of passwords) {
        const pool = new Pool({
            host: 'localhost',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: pwd,
        });

        try {
            await pool.query('SELECT 1');
            console.log(`SUCCESS with password: "${pwd}"`);
            process.exit(0);
        } catch (err) {
            console.log(`Failed with password: "${pwd}" - ${err.message}`);
        } finally {
            await pool.end();
        }
    }
    console.log('All passwords failed.');
};

testConnection();
