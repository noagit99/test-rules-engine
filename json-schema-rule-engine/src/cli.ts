import * as readline from 'readline';
import { applyRules } from './rules';
import { sampleInvoice } from './sampleInvoice';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to read the sample invoice from the imported file
const readSampleInvoice = (): object => {
  return sampleInvoice; // Directly return the imported sample invoice
};

export const promptUser = async (): Promise<void> => {
  const invoice = readSampleInvoice();
  console.log('Sample Invoice:', JSON.stringify(invoice, null, 2));

  const rules: any[] = [];
  await addRules(rules);

  rl.question('Would you like to validate this invoice? (yes/no) ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      const errors = applyRules(invoice, rules);
      if (errors.length > 0) {
        console.log('Validation Errors:', errors);
      } else {
        console.log('Invoice is valid!');
      }
    }
    rl.close();
  });
};

// Function to prompt user to add rules
const addRules = async (rules: any[]): Promise<void> => {
  return new Promise((resolve) => {
    const askForRule = () => {
      rl.question('Add a rule (field condition value) or type "done" to finish: ', (ruleInput) => {
        if (ruleInput.toLowerCase() === 'done') {
          resolve(); // Resolve the promise when done
          return;
        }

        const [field, condition, value] = ruleInput.split(' ');
        rules.push({ field, condition, value });
        console.log('Current rules:', rules); // Prompt the added rules

        askForRule(); // Recursively ask for more rules
      });
    };
    
    askForRule(); // Start the asking process
  });
};

// Start the prompt
promptUser();
