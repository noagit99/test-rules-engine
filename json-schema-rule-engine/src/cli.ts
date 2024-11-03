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

// Function to validate and add a rule
const addRuleWithValidation = async (rule: Rule, invoice: any, rules: Rule[]): Promise<void> => {
  // Test the rule against the invoice before saving
  const testErrors = applyRules(invoice, [...rules, rule]);
  if (testErrors.length > 0) {
    console.log('❌ Validation failed for the following reasons:');
    testErrors.forEach(error => console.log(`  - ${error}`));
    throw new Error('Rule validation failed. Please check the validation errors above.');
  }
  
  console.log('✅ Rule validation passed');
  await saveRule(rule);
  console.log('✅ Rule saved to database');
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

        const [field, operatorInput, ...valueParts] = ruleInput.split(' ');
        const value = valueParts.join(' ').replace(/['";]/g, '');
        
        const validOperators: Rule['condition'][] = ["==", "!=", ">", "<", ">=", "<="];
        if (!validOperators.includes(operatorInput as Rule['condition'])) {
          console.log('Invalid operator. Please use: ==, !=, >, <, >=, or <=');
          askForRule();
          return;
        }

        // Check if field exists in invoice
        const invoice = readSampleInvoice();
        const fieldValue = getFieldValue(invoice, field);
        
        if (fieldValue === undefined) {
          console.log(`Field "${field}" does not exist in the invoice`);
          askForRule();
          return;
        }

        const operator = operatorInput as Rule['condition'];
        const id = uuidv4();
        const rule: Rule = { 
          id, 
          field, 
          condition: operator, 
          value,
          isValid: true
        };

        try {
          await addRuleWithValidation(rule, invoice, rules);
          console.log('✅ Rule added successfully:', JSON.stringify(rule, null, 2));
          rules.push(rule);
          console.log('📋 Current rules:', JSON.stringify(rules, null, 2));
        } catch (error) {
          console.error('❌ Failed to save rule:', error instanceof Error ? error.message : String(error));
        }

        askForRule();
      });
    };

    askForRule();
  });
};

// Helper function to get nested field value
const getFieldValue = (obj: any, path: string): any => {
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

// Start the prompt
promptUser();