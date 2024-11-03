// src/rules.ts
import { validateInvoice } from './validate';

export interface Rule {
  id: string; // Unique identifier for the rule
  field: string; // Field in the invoice to apply the rule
  condition: "==" | "!=" | ">" | "<" | ">=" | "<="; // condition
  value: string; // Value to compare against
  message?: string; // Optional message for better error reporting
}

export const applyRules = (invoice: object, rules: Rule[]): string[] => {
  const errors: string[] = [];

  rules.forEach(rule => {
    const fieldValue = getFieldValue(invoice, rule.field);
    if (!evaluateCondition(fieldValue, rule.condition, rule.value)) {
      errors.push(rule.message || `Rule violation: ${rule.field} ${rule.condition} ${rule.value}`);
    }
  });

  const validationErrors = validateInvoice(invoice);
  return errors.concat(validationErrors);
};

const getFieldValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const evaluateCondition = (fieldValue: any, operator: string, value: any): boolean => {
  switch (operator) {
    case '==':
      return fieldValue == value; // Loose equality
    case '!=':
      return fieldValue != value; // Loose inequality
    case '>':
      return fieldValue > value;
    case '<':
      return fieldValue < value;
    case '>=':
      return fieldValue >= value;
    case '<=':
      return fieldValue <= value;
    default:
      return false; // Unsupported operator
  }
};

