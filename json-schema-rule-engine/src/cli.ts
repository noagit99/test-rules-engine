// src/cli.ts
import * as readline from 'readline';
import { applyRules, Rule } from './rules-logic/rules';
import { sampleInvoice } from './sampleInvoice';
import { connectDB, closeDB, saveRule, db, initializeDB } from './shared/dbRepository'; 
import { v4 as uuidv4 } from 'uuid'; 
import { SchemaRepository } from './schemas-logic/schemaRepository';
import { readFileSync } from 'fs';
import { Command } from 'commander';
import { validateRule, validateInvoice } from './validate';
import { JsonSchema, JsonSchemaProperty, JsonData } from './shared/types';

const program = new Command();
const schemaRepo = new SchemaRepository();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

type NestedObject = {
    [key: string]: string | number | boolean | NestedObject | { [key: string]: any } | JsonSchema;
} | JsonSchema;

const getNestedValue = <T extends NestedObject>(obj: T, path: string): JsonData | string | undefined => {
    return path.split('.').reduce<JsonData | string | undefined>((current, key) => {
        if (current && typeof current === 'object') {
            return (current as Record<string, JsonData | string>)[key];
        }
        return undefined;
    }, obj as unknown as JsonData);
};

// Add this new function to get all nested fields
function getAllNestedFields(obj: any, prefix = ''): string[] {
    let fields: string[] = [];
    
    if (!obj || typeof obj !== 'object') return fields;
    
    // Handle different schema structures
    let properties = obj;
    if (obj.type === 'object') {
        properties = obj.properties;
    } else if (obj.content?.properties) {
        properties = obj.content.properties;
    }

    Object.entries(properties).forEach(([key, value]: [string, any]) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        
        // Add the current field
        fields.push(newPrefix);
        
        // Recursively handle nested objects
        if (value && typeof value === 'object') {
            if (value.type === 'object' && value.properties) {
                fields.push(...getAllNestedFields(value.properties, newPrefix));
            } else if (value.properties) {
                fields.push(...getAllNestedFields(value.properties, newPrefix));
            }
        }
    });
    
    return [...new Set(fields)];
}

// Add this function before handleRules
async function addRuleWithValidation(rule: Rule, invoice: JsonSchema, existingRules: Rule[]): Promise<void> {
    const ruleErrors = validateRule(rule);
    if (ruleErrors.length > 0) {
        rule.isValid = false;
        throw new Error(`Rule validation failed: ${ruleErrors.join(', ')}`);
    }
    
    const errors = applyRules(invoice, [...existingRules, rule]);
    if (errors.length > 0) {
        rule.isValid = false;
        throw new Error(`Rule application failed: ${errors.join(', ')}`);
    }
    
    rule.isValid = true;
}

// Add this function to handle field validation
async function validateField(field: string, invoice: JsonSchema | JsonData): Promise<boolean> {
    // If it's a schema object, traverse through properties
    if ('properties' in invoice) {
        const parts = field.split('.');
        let current: any = invoice.properties;
        
        for (const part of parts) {
            if (!current || !current[part]) {
                return false;
            }
            current = current[part].properties;
        }
        return true;
    }
    
    // If it's a data object, traverse directly
    const fieldValue = getNestedValue(invoice, field);
    return fieldValue !== undefined;
}

// Update handleRuleInput
async function handleRuleInput(input: string, invoice: JsonSchema | JsonData): Promise<Rule | null> {
    if (input.toLowerCase() === 'done') return null;
    
    const parts = input.split(' ');
    
    if (parts.length !== 3) {
        console.log('❌ Invalid rule format. Use: field condition value');
        console.log('Example: totals.amountPaid > 500');
        return null;
    }

    const [field, condition, value] = parts;
    
    // Validate field exists in invoice
    if (!await validateField(field, invoice)) {
        console.log('❌ Field not found:', field);
        return null;
    }

    const validConditions = ['>', '<', '>=', '<=', '==', '!='];
    if (!validConditions.includes(condition)) {
        console.log('❌ Invalid condition. Use:', validConditions.join(', '));
        return null;
    }
    
    return {
        id: uuidv4(),
        field,
        condition,
        value,
        isValid: true
    };
}

// Function to handle rule input and validation
async function handleRules(invoice: JsonSchema): Promise<Rule[]> {
    const rules: Rule[] = [];
    const availableFields = getAllNestedFields(invoice.properties);
    
    while (true) {
        const input = await prompt('Add a rule (field condition value) or type "done" to finish: ');
        
        if (input.toLowerCase() === 'done') {
            break;
        }
        
        const rule = await handleRuleInput(input, invoice);
        if (!rule) {
            console.log('\nPlease try again with a valid rule format.\n');
            continue;
        }

        try {
            // Check if field exists in available fields
            if (!availableFields.includes(rule.field)) {
                console.error('❌ Field not found:', rule.field);
                console.log('\nAvailable fields:');
                console.log(availableFields.sort().join('\n'));
                console.log('\nPlease try again with a valid field name.\n');
                continue;
            }

            console.log('Validating rule:', JSON.stringify(rule, null, 2));
            
            // Convert sampleInvoice to schema before validation
            const invoiceSchema = generateSchema(sampleInvoice);
            await addRuleWithValidation(rule, invoiceSchema, rules);
            const savedRule = await saveRule(rule);
            rules.push(savedRule);
            console.log('✅ Rule saved successfully\n');
        } catch (error: any) {
            console.error('❌ Rule validation failed:');
            console.error('Error details:', error.message);
            
            if (error.message.includes('does not exist')) {
        
            }
            console.log('\nPlease try again with a valid rule.\n');
            continue;
        }
    }
    
    console.log('\nFinal collected rules:', rules);
    return rules;
}

// Add this helper function
const prompt = (question: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
};

function generateSchemaFromRules(rules: Rule[]): any {
    // Start with a base schema
    const ruleSchema: any = {
        type: "object",
        properties: {},
        required: []
    };

    rules.forEach(rule => {
        const fieldPath = rule.field.split('.');
        let currentLevel = ruleSchema.properties;

        // Build nested structure
        for (let i = 0; i < fieldPath.length - 1; i++) {
            const part = fieldPath[i];
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    type: "object",
                    properties: {}
                };
            }
            currentLevel = currentLevel[part].properties;
        }

        // Get the last field name
        const lastField = fieldPath[fieldPath.length - 1];

        // Determine the type based on the rule's value
        const valueType = isNaN(Number(rule.value)) ? "string" : "number";
        
        // Create or update the property with validation rules
        currentLevel[lastField] = {
            type: valueType,
            ...generateValidationForRule(rule)
        };
    });

    return ruleSchema;
}

function generateValidationForRule(rule: Rule): any {
    const value = isNaN(Number(rule.value)) ? rule.value : Number(rule.value);
    
    switch (rule.condition) {
        case '>':
            return { minimum: value, exclusiveMinimum: true };
        case '>=':
            return { minimum: value };
        case '<':
            return { maximum: value, exclusiveMaximum: true };
        case '<=':
            return { maximum: value };
        case '==':
            return { enum: [value] };
        case '!=':
            return { not: { enum: [value] } };
        default:
            return {};
    }
}

// Fix return type of generateStructuralSchema
function generateStructuralSchema(data: any): JsonSchemaProperty {
    if (Array.isArray(data)) {
        return {
            type: "array",
            items: data.length > 0 ? generateStructuralSchema(data[0]) : { type: "object" }
        };
    }
    
    if (data === null) return { type: "null" };
    
    if (typeof data === "object") {
        const properties = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, generateStructuralSchema(value)])
        );
        return { 
            type: "object",
            properties,
            required: Object.keys(data).filter(key => !OPTIONAL_FIELDS.includes(key))
        };
    }
    
    return { type: typeof data as "string" | "number" | "boolean" };
}

// Fix generateSchema return type and implementation
export function generateSchema(data: JsonData, rules?: Rule[]): JsonSchema {
    // First validate all rules if they exist
    if (rules && rules.length > 0) {
        const baseSchema = generateStructuralSchema(data) as JsonSchema;
        const ruleValidationErrors = applyRules(baseSchema, rules);
        if (ruleValidationErrors.length > 0) {
            console.error('❌ Cannot generate schema: Rule validation failed:', ruleValidationErrors);
            // Return a basic valid schema instead of null
            return {
                type: "object",
                properties: {},
                required: []
            };
        }
    }

    const structuralSchema = generateStructuralSchema(data);
    
    if (!rules || rules.length === 0) {
        return {
            type: "object",
            properties: structuralSchema.properties || {},
            required: structuralSchema.required || []
        };
    }

    const rulesSchema = generateSchemaFromRules(rules);
    return mergeSchemas(structuralSchema as JsonSchema, rulesSchema);
}

// Fix mergeSchemas to ensure it always returns a valid JsonSchema
function mergeSchemas(schema1: JsonSchema, schema2: JsonSchema): JsonSchema {
    const merged: JsonSchema = {
        type: "object",
        properties: {},
        required: []
    };

    // Merge properties from both schemas
    merged.properties = {
        ...(schema1.properties || {}),
        ...(schema2.properties || {})
    };

    // Merge required fields
    merged.required = Array.from(new Set([
        ...(schema1.required || []),
        ...(schema2.required || [])
    ]));

    // Copy additional validation keywords from schema2
    ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'enum', 'not']
        .forEach(keyword => {
            if (schema2[keyword as keyof JsonSchema] !== undefined) {
                (merged as any)[keyword] = (schema2 as any)[keyword];
            }
        });

    return merged;
}

// Update the promptUser function to handle null schema
export const promptUser = async (): Promise<void> => {
    try {
        console.log('Starting application...');
        console.log('\n1️⃣ Initializing database and schema...');
        
        await connectDB();
        await initializeDB();
        console.log('✅ Database initialized');
        
        await schemaRepo.initialize();
        console.log('✅ Schema repository initialized');
        
        // Collect and validate rules first
        console.log('\n6⃣ Starting rule collection...');
        const rules = await handleRules(generateSchema(sampleInvoice));

        // Validate all rules against the invoice
        console.log('\n7️⃣ Validating all rules...');
        const ruleValidationErrors = applyRules(sampleInvoice as any, rules);
        
        if (ruleValidationErrors.length > 0) {
            console.error('❌ Rule validation failed:', ruleValidationErrors);
            return;
        }
        
        // Generate schema only if rules are valid
        console.log('\n2️⃣ Generating dynamic schema from invoice and rules...');
        const schema = generateSchema(sampleInvoice, rules);
        
        if (!schema) {
            console.error('❌ Schema generation failed due to invalid rules');
            return;
        }

        const fullSchema: JsonSchema = {
            $schema: "http://json-schema.org/draft-07/schema#",
            ...schema,  // Spread schema first
            type: "object",
        };

        // Validate invoice against generated schema before saving
        console.log('\n4️⃣ Validating invoice against schema...');
        const schemaValidationErrors = validateInvoice(sampleInvoice);
        if (schemaValidationErrors.length > 0) {
            console.error('❌ Schema validation errors:');
            interface ValidationError {
                instancePath: string;
                message: string;
            }
            
            schemaValidationErrors.forEach((error: ValidationError | string, index: number) => {
                const message = typeof error === 'string' 
                    ? error 
                    : error.message;

                const path = typeof error === 'string'
                    ? ''
                    : error.instancePath;

                const section = path ? path.split('/').filter(Boolean)[0] : 'root';
                const cleanMessage = message.replace(/^\//, ''); // Remove leading slash if present

                console.error(
                    `${index + 1}. [${section}] ${cleanMessage}`
                );
            });
            return;
        }
        
        // Only save schema if all validations pass
        console.log('\n3️⃣ Saving and verifying schema...');
        try {
            const savedSchema = await schemaRepo.saveSchema('invoice-schema', fullSchema);
            console.log('✅ Schema saved successfully:', savedSchema);
            
            const retrievedSchema = await schemaRepo.getSchema('invoice-schema');
            if (retrievedSchema) {
                console.log('✅ Schema verified in database:', retrievedSchema.name);
                console.log('✅ All validations passed successfully');
            }
        } catch (schemaError) {
            console.error('❌ Failed to save/retrieve schema:', schemaError);
            throw schemaError;
        }

    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    } finally {
        await closeDB();
        rl.close();
        process.exit(0);
    }
};

// Keep the CLI commands
program
    .command('schema:save <name> <filePath>')
    .description('Save a JSON schema from a file')
    .action(async (name: string, filePath: string) => {
        try {
            const schemaContent = JSON.parse(readFileSync(filePath, 'utf-8'));
            const savedSchema = await schemaRepo.saveSchema(name, schemaContent);
            console.log('Schema saved successfully:', savedSchema);
        } catch (error) {
            console.error('Error saving schema:', error);
        }
    });

program
    .command('schema:get <name>')
    .description('Retrieve a JSON schema by name')
    .action(async (name: string) => {
        try {
            const schema = await schemaRepo.getSchema(name);
            console.log(schema ? 'Schema found:' : 'Schema not found:', schema);
        } catch (error) {
            console.error('Error retrieving schema:', error);
        }
    });

program
    .command('schema:generate <name>')
    .description('Generate and save JSON schema from sample invoice to database')
    .action(async (name: string) => {
        try {
            await connectDB();
            await initializeDB();
            
            if (!db) throw new Error('Database not initialized');
            await db.query('SELECT NOW()');
            console.log('✅ Database connection successful');
            
            const schema = generateSchema(sampleInvoice);
            const fullSchema: JsonSchema = {
                $schema: "http://json-schema.org/draft-07/schema#",
                ...schema,
                properties: schema?.properties || {},  // Ensure properties is always defined
                type: "object",
            };
            
            const savedSchema = await schemaRepo.upsertSchema(name, fullSchema);
            if (!savedSchema) {
                throw new Error('Schema was not saved - no response from database');
            }
            console.log('✅ Schema generated and saved:', savedSchema);
            
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            await closeDB();
        }
    });

// Define optional fields at the top level
const OPTIONAL_FIELDS = ['purchaseOrderNumber'];

// Add this function to properly validate fields against the schema and sample data
function validateFieldExists(field: string, invoice: any): boolean {
    const parts = field.split('.');
    let current = invoice;
    
    for (const part of parts) {
        if (current === undefined || current === null || !current.hasOwnProperty(part)) {
            return false;
        }
        current = current[part];
    }
    
    return true;
}

// Update the rule collection part of your CLI to use this validation
async function collectRules(): Promise<Rule[]> {
    const rules: Rule[] = [];
    
    while (true) {
        const input = await prompt('Add a rule (field condition value) or type "done" to finish: ');
        
        if (input.toLowerCase() === 'done') {
            break;
        }
        
        const [field, condition, value] = input.split(' ');
        
        // Validate the field exists in the sample invoice
        if (!validateFieldExists(field, sampleInvoice)) {
            console.log(`❌ Field not found: ${field}`);
            console.log('\nAvailable fields in totals:', Object.keys(sampleInvoice.totals).join(', '));
            console.log('Please try again with a valid rule format.\n');
            continue;
        }
        
        // Create and validate the rule
        const rule: Rule = {
            id: uuidv4(),
            field,
            condition,
            value,
            isValid: true
        };
        
        const validationErrors = validateRule(rule);
        if (validationErrors.length > 0) {
            console.log('❌ Invalid rule:', validationErrors.join(', '));
            continue;
        }
        
        rules.push(rule);
        console.log('✅ Rule added successfully');
    }
    
    return rules;
}

// Parse CLI commands if running directly
if (require.main === module) {
    program.parse(process.argv);


    
}
