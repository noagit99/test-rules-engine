import pgPromise from 'pg-promise';

const pgp = pgPromise();
const db = pgp({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'user',
  password: 'password',
});


const createRulesTable = async () => {
  try {
    await db.none(`
      CREATE TABLE IF NOT EXISTS rules (
        id SERIAL PRIMARY KEY,
        field VARCHAR(255),
        condition VARCHAR(10),
        value TEXT
      )
    `);
    console.log("Rules table created successfully.");
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

createRulesTable();

export { db };