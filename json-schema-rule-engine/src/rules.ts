// src/rules.ts
import { validateInvoice } from './validate';

interface Rule {
  field: string;
  condition: string;
  value: any;
}

export const applyRules = (invoice: object, rules: Rule[]): string[] => {
  const errors: string[] = [];

  rules.forEach(rule => {
    const fieldValue = getFieldValue(invoice, rule.field);
    if (!evaluateCondition(fieldValue, rule.condition, rule.value)) {
      errors.push(`Rule violation: ${rule.field} ${rule.condition} ${rule.value}`);
    }
  });

  const validationErrors = validateInvoice(invoice);
  return errors.concat(validationErrors);
};

const getFieldValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const evaluateCondition = (fieldValue: any, condition: string, value: any): boolean => {
  switch (condition) {
    case '==':
      return fieldValue == value;
    case '!=':
      return fieldValue != value;
    case '>':
      return fieldValue > value;
    case '<':
      return fieldValue < value;
    case '>=':
      return fieldValue >= value;
    case '<=':
      return fieldValue <= value;
    default:
      return false;
  }
};
