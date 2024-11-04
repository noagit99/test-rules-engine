// src/rules.ts
import { validateInvoice, validateRule as validateRuleExternal } from '../validate';
import { saveRule } from '../shared/dbRepository';
import { JsonSchema, JsonData } from '../shared/types';

export interface Rule {
    id: string;
    field: string;
    condition: string;
    value: string;
    isValid: boolean;
}

function validateRule(rule: Rule): string[] {
    const errors: string[] = [];
    const validConditions = ['>', '>=', '<', '<=', '==', '!='];
    
    if (!validConditions.includes(rule.condition)) {
        errors.push(`Invalid condition: ${rule.condition}`);
    }
    
    if (!rule.field) {
        errors.push('Field is required');
    }
    
    if (rule.value === undefined || rule.value === null) {
        errors.push('Value is required');
    }
    
    return errors;
}

export function applyRules(invoice: JsonSchema | JsonData, rules: Rule[]): string[] {
    const errors: string[] = [];
    
    rules.forEach(rule => {
        const fieldValue = getNestedValue(invoice, rule.field);
        
        console.log('Checking field:', rule.field);
        console.log('Field value:', fieldValue);
        console.log('Invoice structure:', JSON.stringify(invoice, null, 2));
        
        if (fieldValue === undefined) {
            errors.push(`Required field ${rule.field} does not exist`);
            return;
        }

        const numericValue = Number(rule.value);
        const numericFieldValue = Number(fieldValue);

        // Validate numeric comparison
        if (!isNaN(numericValue) && !isNaN(numericFieldValue)) {
            switch (rule.condition) {
                case '>':
                    if (!(numericFieldValue > numericValue)) {
                        errors.push(`${rule.field} must be greater than ${rule.value}`);
                    }
                    break;
                case '>=':
                    if (!(numericFieldValue >= numericValue)) {
                        errors.push(`${rule.field} must be greater than or equal to ${rule.value}`);
                    }
                    break;
                case '<':
                    if (!(numericFieldValue < numericValue)) {
                        errors.push(`${rule.field} must be less than ${rule.value}`);
                    }
                    break;
                case '<=':
                    if (!(numericFieldValue <= numericValue)) {
                        errors.push(`${rule.field} must be less than or equal to ${rule.value}`);
                    }
                    break;
                case '==':
                    if (!(numericFieldValue === numericValue)) {
                        errors.push(`${rule.field} must be equal to ${rule.value}`);
                    }
                    break;
                case '!=':
                    if (!(numericFieldValue !== numericValue)) {
                        errors.push(`${rule.field} must not be equal to ${rule.value}`);
                    }
                    break;
            }
        }
    });
    
    return errors;
}

function getNestedValue(obj: any, path: string): any {
    if (!path) return undefined;
    
    const parts = path.split('.');
    let current = obj;

    // For schema validation, we need to traverse the properties structure
    if (obj.type === 'object' && obj.properties) {
        for (const part of parts) {
            if (!current.properties?.[part]) {
                return undefined;
            }
            current = current.properties[part];
            continue;
        }
        return current;
    }

    // For actual data objects, traverse directly
    for (const part of parts) {
        if (current === undefined || current === null) {
            return undefined;
        }
        current = current[part];
    }
    
    return current;
}

// New function to handle rule addition with validation
export const addRuleWithValidation = async (
  ruleToAdd: Rule, 
  invoice: JsonSchema | JsonData, 
  existingRules: Rule[]
): Promise<void> => {
    const ruleErrors = validateRule(ruleToAdd);
    if (ruleErrors.length > 0) {
        console.log('Rule validation details:');
        console.log('- Rule:', JSON.stringify(ruleToAdd, null, 2));
        console.log('- Validation errors:', ruleErrors);
        throw new Error(`Rule validation failed: ${ruleErrors.join(', ')}`);
    }
    
    // Check if field exists in invoice
    const fieldValue = getNestedValue(invoice, ruleToAdd.field);
    if (fieldValue === undefined) {
        throw new Error(`Field "${ruleToAdd.field}" does not exist in the invoice`);
    }

    const errors = applyRules(invoice, [...existingRules, ruleToAdd]);
    if (errors.length > 0) {
        throw new Error(`Rule application failed: ${errors.join(', ')}`);
    }
};

