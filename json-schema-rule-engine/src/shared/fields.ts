export const OPTIONAL_FIELDS: string[] = [
    'purchaseOrderNumber'
]; 


import { JSONSchemaType } from 'ajv';

// First, define the base types
export interface JsonData {
    [key: string]: any;
}

export interface JsonSchemaProperty {
    type: string;
    properties?: { [key: string]: JsonSchemaProperty };
    required?: string[];
    items?: JsonSchemaProperty;
    [key: string]: any;
}

export interface JsonSchema {
    $schema?: string;
    type: string;
    properties: { [key: string]: JsonSchemaProperty };
    required?: string[];
    [key: string]: any;
}

export type SchemaValidationError = {
  instancePath: string;
  message?: string;
  data?: unknown;
  schema?: unknown;
}; 