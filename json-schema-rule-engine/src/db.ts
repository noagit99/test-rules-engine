// src/db.ts
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid'; 
import { Rule } from './rules';

const client = new Client({
  user: 'user',
  host: 'localhost', 
  database: 'postgres', 
  password: 'password',
  port: 5432, 
});

export const connectDB = async () => {
  await client.connect();
};

export const closeDB = async () => {
  await client.end();
};

// Update the saveRule function to include an ID
export const saveRule = async (rule: Rule): Promise<Rule> => {
  const id = rule.id || uuidv4();
  
  console.log('About to save with ID:', id); 

  const query = `
    INSERT INTO rules(id, field, condition, value, message) 
    VALUES (CAST($1 AS UUID), $2, $3, $4, $5) 
    RETURNING id::text, field, condition, value, message`;
    
  const values = [
    id,
    rule.field,
    rule.condition,
    rule.value,
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
