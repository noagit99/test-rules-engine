// src/db.ts
import { Client } from 'pg';

const client = new Client({
  user: 'user', // Replace with your PostgreSQL username
  host: 'localhost', // Adjust if using Docker with a different network
  database: 'postgres', // The name of your database
  password: 'password', // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

export const connectDB = async () => {
  await client.connect();
};

export const closeDB = async () => {
  await client.end();
};

export const saveRule = async (rule: { field: string; condition: string; value: any }) => {
  const query = 'INSERT INTO rules(field, condition, value) VALUES($1, $2, $3)';
  const values = [rule.field, rule.condition, rule.value];
  
  await client.query(query, values);
};
