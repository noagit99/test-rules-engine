// src/cli.ts
import * as readline from 'readline';
import { applyRules } from './rules';
import { sampleInvoice } from './sampleInvoice';
import { connectDB, closeDB, saveRule } from './db'; // Import your DB functions

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to read the sample invoice from the imported file
const readSampleInvoice = (): object => {
  return sampleInvoice; // Directly return the imported sample invoice
};

export const promptUser = async (): Promise<void> => {
  await connectDB(); // Connect to the database
  const invoice = readSampleInvoice();
  console.log('Sample Invoice:', JSON.stringify(invoice, null, 2));

  const rules: any[] = [];
  await addRules(rules);

  // Automatically validate the invoice with the added rules
  const errors = applyRules(invoice, rules);
  if (errors.length > 0) {
    console.log('Validation Errors:', errors);
  } else {
    console.log('Invoice is valid!');
  }

  await closeDB(); // Close the database connection
  rl.close(); // Add this line to close the readline interface
};

// Function to prompt user to add rules
const addRules = async (rules: any[]): Promise<void> => {
  return new Promise((resolve) => {
    const askForRule = () => {
      rl.question('Add a rule (field condition value) or type "done" to finish: ', async (ruleInput) => {
        if (ruleInput.toLowerCase() === 'done') {
          resolve(); // Resolve the promise when done
          return;
        }

        const [field, condition, value] = ruleInput.split(' ');
        const rule = { field, condition, value };
        rules.push(rule);
        await saveRule(rule); // Save rule to the database
        console.log(`Rule added: ${JSON.stringify(rule)}`);
        console.log('Current rules:', rules); // Show current rules

        askForRule(); // Recursively ask for more rules
      });
    };

    askForRule(); // Start the asking process
  });
};

// Start the prompt
promptUser();
