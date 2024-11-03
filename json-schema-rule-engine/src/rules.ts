// src/rules.ts
import { validateInvoice } from './validate';
import { saveRule } from './db';

export interface Rule {
  id: string; // Unique identifier for the rule
  field: string; // Field in the invoice to apply the rule
  condition: "==" | "!=" | ">" | "<" | ">=" | "<="; // condition
  value: string; // Value to compare against
  message?: string; // Optional message for better error reporting
  isValid?: boolean;  // Add this line
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
  // First check if fieldValue exists
  if (fieldValue === undefined) {
    console.log(`Field value does not exist`);
    return false;
  }

  // Convert string value to number if we're dealing with numeric comparisons
  const numericValue = Number(value);
  const numericFieldValue = Number(fieldValue);

  // For numeric comparisons, ensure both values are valid numbers
  if (['>', '<', '>=', '<='].includes(operator)) {
    if (isNaN(numericValue) || isNaN(numericFieldValue)) {
      console.log('Invalid numeric comparison:', { fieldValue, operator, value });
      return false;
    }
    
    switch (operator) {
      case '>':
        return numericFieldValue > numericValue;
      case '<':
        return numericFieldValue < numericValue;
      case '>=':
        return numericFieldValue >= numericValue;
      case '<=':
        return numericFieldValue <= numericValue;
    }
  }

  // For equality comparisons
  switch (operator) {
    case '==':
      return fieldValue == value;
    case '!=':
      return fieldValue != value;
    default:
      console.log('Unsupported operator:', operator);
      return false;
  }
};

// New function to handle rule addition with validation
export const addRuleWithValidation = async (
  ruleToAdd: Rule, 
  invoice: any, 
  existingRules: Rule[]
): Promise<{ success: boolean; errors?: string[]; savedRule?: Rule }> => {
  try {
    // Check if field exists in invoice
    const fieldValue = getFieldValue(invoice, ruleToAdd.field);
    if (fieldValue === undefined) {
      return {
        success: false,
        errors: [`Field "${ruleToAdd.field}" does not exist in the invoice`]
      };
    }

    // Validate using all rules including the new one
    const validationErrors = validateInvoice(invoice);
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      };
    }

    // Only save if all validations pass
    const savedRule = await saveRule(ruleToAdd);
    return {
      success: true,
      savedRule
    };
    
  } catch (error) {
    return {
      success: false,
      errors: [`Error adding rule: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
};

