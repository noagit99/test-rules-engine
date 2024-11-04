// src/db.ts
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid'; 
import { Rule } from '../rules-logic/rules';

let client: Client | null = null;

export type DB = {
    query: (text: string, params?: any[]) => Promise<any>;
    one: (text: string, params?: any[]) => Promise<any>;
    oneOrNone: (text: string, params?: any[]) => Promise<any>;
}

export let db: DB;

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
  
  // Initialize db with wrapped client methods
  db = {
    query: (text, params) => client!.query(text, params),
    one: async (text, params) => {
      const result = await client!.query(text, params);
      return result.rows[0];
    },
    oneOrNone: async (text, params) => {
      const result = await client!.query(text, params);
      return result.rows[0];
    },
  };

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
  
  const query = `
    INSERT INTO rules(id, field, condition, value) 
    VALUES (CAST($1 AS UUID), $2, $3, $4) 
    RETURNING id::text, field, condition, value`;
    
  const values = [
    id,
    rule.field,
    rule.condition,
    cleanValue
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
    
    const createTablesQuery = `
        CREATE TABLE IF NOT EXISTS rules (
            id UUID PRIMARY KEY,
            field VARCHAR(255) NOT NULL,
            condition VARCHAR(50) NOT NULL,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS schemas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) UNIQUE NOT NULL,
            content JSONB NOT NULL
        );
    `;
    
    try {
        await client.query(createTablesQuery);
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database tables:', error);
        throw error;
    }
};
