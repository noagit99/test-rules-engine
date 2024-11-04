// Create a new file for shared types
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