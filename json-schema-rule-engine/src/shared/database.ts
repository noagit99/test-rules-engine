import pgPromise from 'pg-promise';

const pgp = pgPromise();
const db = pgp({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'user',
  password: 'password',
});

export const initializeDatabase = async () => {
  try {
    // First verify connection
    await db.one('SELECT 1');
    console.log('✅ Database connection successful');

    // Create schemas table if it doesn't exist
    await db.none(`
      CREATE TABLE IF NOT EXISTS schemas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Schemas table initialized');

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Initialize database when this module is imported
initializeDatabase().catch(console.error);

export { db };