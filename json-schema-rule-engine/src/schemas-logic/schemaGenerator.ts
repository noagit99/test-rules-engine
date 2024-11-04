import { invoiceSchema } from './baseSchema';
import { Rule } from '../rules-logic/rules';
import { JsonSchema, JsonSchemaProperty } from '../shared/fields';

// Types
export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  format?: string;
  minimum?: number;
  properties?: Record<string, SchemaField>;
  items?: SchemaField;
  enum?: string[];
}

export interface SchemaConfig {
  fields: Record<string, SchemaField>;
  version: string;
}

export class SchemaGenerator {
  // Define optional fields
  private optionalFields = ['purchaseOrderNumber'];

  generateSchema(config: SchemaConfig, rules?: Rule[]): JsonSchema {
    const baseSchema = this.generateBaseSchema(config);
    
    if (!rules || rules.length === 0) {
      return baseSchema;
    }

    // Enhance schema with rules
    return this.enhanceSchemaWithRules(baseSchema, rules);
  }

  private generateBaseSchema(config: SchemaConfig): JsonSchema {
    const required: string[] = [];
    const properties: Record<string, any> = {};

    Object.entries(config.fields).forEach(([fieldName, field]) => {
      // Only add to required if it's not in optionalFields
      if (field.required && !this.optionalFields.includes(fieldName)) {
        required.push(fieldName);
      }
      properties[fieldName] = this.processField(field);
    });

    return {
      ...invoiceSchema,
      required,
      properties,
      $version: config.version
    } as any as JsonSchema;
  }

  private enhanceSchemaWithRules(schema: JsonSchema, rules: Rule[]): JsonSchema {
    rules.forEach(rule => {
      const fieldPath = rule.field.split('.');
      let currentLevel = schema.properties;

      // Navigate to the correct nested level
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!currentLevel[fieldPath[i]].properties) {
          currentLevel[fieldPath[i]].properties = {};
        }
        currentLevel = currentLevel[fieldPath[i]].properties!;
      }

      const fieldName = fieldPath[fieldPath.length - 1];
      const fieldSchema = currentLevel[fieldName];

      // Add rule-based validation
      switch (rule.condition) {
        case '>':
          fieldSchema.minimum = Number(rule.value);
          fieldSchema.exclusiveMinimum = true;
          break;
        case '>=':
          fieldSchema.minimum = Number(rule.value);
          break;
        case '<':
          fieldSchema.maximum = Number(rule.value);
          fieldSchema.exclusiveMaximum = true;
          break;
        case '<=':
          fieldSchema.maximum = Number(rule.value);
          break;
        case '==':
          fieldSchema.enum = [rule.value];
          break;
        case '!=':
          fieldSchema.not = { enum: [rule.value] };
          break;
      }
    });

    return schema;
  }

  private processField(field: SchemaField): JsonSchemaProperty {
    const schema: any = { type: field.type };

    if (field.format) schema.format = field.format;
    if (field.minimum) schema.minimum = field.minimum;
    if (field.enum) schema.enum = field.enum;
    if (field.properties) {
      schema.properties = {};
      const required: string[] = [];
      
      Object.entries(field.properties).forEach(([key, value]) => {
        schema.properties[key] = this.processField(value);
        // Only add to required if it's not in optionalFields
        if (value.required && !this.optionalFields.includes(key)) {
          required.push(key);
        }
      });
      
      if (required.length > 0) {
        schema.required = required;
      }
    }
    if (field.items) {
      schema.items = this.processField(field.items);
    }

    return schema;
  }

  // Add this helper method to SchemaGenerator class
  private getAllValidFields(schema: JsonSchema, prefix = ''): string[] {
    const fields: string[] = [];
    
    if (!schema.properties) return fields;
    
    Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        fields.push(fullPath);
        
        // If it's an object with properties, recurse
        if (value.properties) {
            fields.push(...this.getAllValidFields({ 
                type: 'object',
                properties: value.properties 
            } as JsonSchema, fullPath));
        }
        
        // If it's an array with items that have properties, recurse
        if (value.items?.properties) {
            fields.push(...this.getAllValidFields({ 
                type: 'object',
                properties: value.items.properties 
            } as JsonSchema, fullPath));
        }
    });
    
    return fields;
  }

  // Then modify your rule validation to use this method
  private validateField(field: string, schema: JsonSchema): boolean {
    const validFields = this.getAllValidFields(schema);
    return validFields.includes(field);
  }
} 