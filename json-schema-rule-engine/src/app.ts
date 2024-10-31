// src/app.ts
import { validateInvoice } from './validate';
import { sampleInvoice } from './sampleInvoice';

const errors = validateInvoice(sampleInvoice);

if (errors.length > 0) {
  console.log("Validation Errors:", errors);
} else {
  console.log("Monto invoice is valid!");
}
