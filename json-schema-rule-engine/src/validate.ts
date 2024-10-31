// src/validate.ts
import Ajv from 'ajv';
import { invoiceSchema } from './schema';

// Create a new Ajv instance
const ajv = new Ajv();

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
    return validate.errors?.map(error => `${error.instancePath} ${error.message}`) || [];
  }
  return [];
};
