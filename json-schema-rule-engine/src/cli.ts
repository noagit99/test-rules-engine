// src/cli.ts
import * as readline from 'readline';
import { applyRules, Rule } from './rules';
import { sampleInvoice } from './sampleInvoice';
import { connectDB, closeDB, saveRule } from './db'; 
import { v4 as uuidv4 } from 'uuid'; 

interface DBRule {
  id: string;
  field: string;
  condition: Rule['condition'];
  value: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to read the sample invoice from the imported file
const readSampleInvoice = (): object => {
  return sampleInvoice;
};

export const promptUser = async (): Promise<void> => {
  await connectDB();
  const invoice = readSampleInvoice();
  console.log('Sample Invoice:', JSON.stringify(invoice, null, 2));

  const rules: Rule[] = [];
  await addRules(rules);

  // Automatically validate the invoice with the added rules
  const errors = applyRules(invoice, rules);
  if (errors.length > 0) {
    console.log('Validation Errors:', errors);
  } else {
    console.log('Invoice is valid!');
  }

  await closeDB();
  rl.close();
};

// Function to prompt user to add rules
const addRules = async (rules: Rule[]): Promise<void> => {
  return new Promise((resolve) => {
    const askForRule = () => {
      rl.question('Add a rule (field operator value) or type "done" to finish: ', async (ruleInput) => {
        if (ruleInput.toLowerCase() === 'done') {
          resolve();
          return;
        }

        const [field, operatorInput, value] = ruleInput.split(' ');
        const validOperators: Rule['condition'][] = ["==", "!=", ">", "<", ">=", "<="];
        if (!validOperators.includes(operatorInput as Rule['condition'])) {
          console.log('Invalid operator. Please use: ==, !=, >, <, >=, or <=');
          askForRule();
          return;
        }

        const operator = operatorInput as Rule['condition'];
        const id = uuidv4();
        const rule: Rule = { id, field, condition: operator, value };
        rules.push(rule);

        try {
          // Save the rule with the UUID
          const dbRule: DBRule = { id, field, condition: operator, value };
          await saveRule(dbRule);
          console.log(`Rule added: ${JSON.stringify(rule)}`);
          console.log('Current rules:', rules);
        } catch (error) {
          console.error('Failed to save rule:', error instanceof Error ? error.message : String(error));
        }

        askForRule();
      });
    };

    askForRule();
  });
};

// Start the prompt
promptUser();
