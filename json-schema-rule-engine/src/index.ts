// src/index.ts
import { promptUser } from '../src/cli'

const start = async () => {
  await promptUser();
};

start().catch((error) => {
  console.error('An error occurred:', error);
});



