// src/db.ts
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid'; 
import { Rule } from './rules';

let client: Client | null = null;

export const connectDB = async () => {
  if (client) {
    return client;
  }
  
  client = new Client({
    user: 'user',
    host: 'localhost', 
    database: 'postgres', 
    password: 'password',
    port: 5432, 
  });

  await client.connect();
  return client;
};

export const closeDB = async () => {
  if (client) {
    await client.end();
    client = null;
  }
};

// Update the saveRule function to include an ID
export const saveRule = async (rule: Rule): Promise<Rule> => {
  if (!client) {
    throw new Error('Database not connected');
  }
  
  // Check if field exists and has a valid value
  if (!rule.field || rule.value === undefined || rule.value === '') {
    throw new Error('Invalid rule: field and value must be provided');
  }

  const id = rule.id || uuidv4();
  const cleanValue = rule.value.replace(/;$/, '');
  
  // Only proceed with save if validation passed
  if (!rule.isValid) {
    throw new Error('Rule validation failed - not saving to database');
  }

  const query = `
    INSERT INTO rules(id, field, condition, value, message) 
    VALUES (CAST($1 AS UUID), $2, $3, $4, $5) 
    RETURNING id::text, field, condition, value, message`;
    
  const values = [
    id,
    rule.field,
    rule.condition,
    cleanValue,
    rule.message || null
  ];

  try {
    const result = await client.query(query, values);
    console.log('Saved to DB:', result.rows[0]); 
    return result.rows[0];
  } catch (error) {
    console.error('Error saving rule:', error);
    throw error;
  }
};

export const initializeDB = async () => {
    if (!client) {
        throw new Error('Database not connected');
    }
    
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS rules (
            id UUID PRIMARY KEY,
            field VARCHAR(255) NOT NULL,
            condition VARCHAR(50) NOT NULL,
            value TEXT NOT NULL,
            message TEXT
        );
    `;
    
    try {
        await client.query(createTableQuery);
        console.log('Rules table initialized successfully');
    } catch (error) {
        console.error('Error initializing rules table:', error);
        throw error;
    }
};
