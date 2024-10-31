// src/index.ts
import { promptUser } from './cli'; // Ensure correct path to cli.ts

const start = async () => {
  try {
    await promptUser();
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

start();



