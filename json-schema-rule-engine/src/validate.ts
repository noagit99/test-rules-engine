// src/validate.ts
import Ajv from 'ajv';
import { invoiceSchema } from './schemas-logic/baseSchema';
import { OPTIONAL_FIELDS } from './shared/fields';

// Create a new Ajv instance
const ajv = new Ajv({ allErrors: true });

// Add custom format for UUID
ajv.addFormat('uuid', {
  type: 'string',
  validate: (x) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(x);
  },
});

// Add custom format for date
ajv.addFormat('date', {
  type: 'string',
  validate: (x) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
    return dateRegex.test(x) && !isNaN(Date.parse(x));
  },
});

// Compile the schema
const validate = ajv.compile(invoiceSchema);

export const validateInvoice = (invoice: object): string[] => {
  const valid = validate(invoice);
  if (!valid) {
    return validate.errors?.filter(error => {
      // Get the field name from the error path
      const fieldName = error.instancePath.split('/')[1];
      
      // Skip validation for optional fields
      if (OPTIONAL_FIELDS.includes(fieldName)) {
        console.log(`Skipping validation for optional field: ${fieldName}`);
        return false;
      }
      
      return true;
    }).map(error => `${error.instancePath} ${error.message}`) || [];
  }
  return [];
};

// Update the rule schema to match our Rule type
export const ruleSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    field: { type: 'string' },
    condition: { type: 'string', enum: ['>', '<', '>=', '<=', '==', '!='] },
    value: { type: 'string' },
    isValid: { type: 'boolean' }
  },
  required: ['field', 'condition', 'value'],
  additionalProperties: false
};

// Add the rule validator alongside invoice validator
const validateRuleSchema = ajv.compile(ruleSchema);

export const validateRule = (rule: object): string[] => {
  const valid = validateRuleSchema(rule);
  if (!valid) {
    // Enhanced error logging
    return validateRuleSchema.errors?.map(error => {
      const path = error.instancePath || 'rule';
      const value = error.data;
      return `Validation Error: ${path} ${error.message}. Got: ${JSON.stringify(value)}. Schema: ${JSON.stringify(error.schema)}`;
    }) || [];
  }
  return [];
};
