# JSON Schema Rule Engine

A flexible rule engine for validating JSON documents with custom rules and database persistence.

## 🚀 Technology Stack

- **TypeScript** - Main programming language
- **Node.js** - Runtime environment
-  **JSON Schema** - Schema definition and validation
-  **AJV (Another JSON Validator)** - JSON Schema validation
  - Custom formats for UUID and dates
  - Strict type checking
  - Error reporting
 **PostgreSQL** - Database for rule persistence
  - Leverages JSONB data type for flexible rule storage
  - Provides robust querying capabilities for rules
- **UUID** - For unique rule identification


### Validation Process Flow
1. **Schema Validation (AJV)**
   - Validates document structure
   - Checks data types
   - Enforces format rules
2. **Rule Validation**
   - Validates field existence
   - Checks operator validity
   - Tests rule logic

### Document Validation Example
```typescript
const validateDocument = (document: object): string[] => {
  const valid = validate(document);
  if (!valid) {
    return validate.errors?.map(error => 
      `${error.instancePath} ${error.message}`
    ) || [];
  }
  return [];
};
```

## 📋  Rules System

### Basic Rule Structure
```typescript
interface Rule {
  id: string;
  field: string;
  condition: "==" | "!=" | ">" | "<" | ">=" | "<=";
  value: string;
  isValid: boolean;
}
```

### Types of Rules Supported

1. **Comparison Rules**
   - Equal to (`==`)
   - Not equal to (`!=`)
   - Greater than (`>`)
   - Less than (`<`)
   - Greater than or equal to (`>=`)
   - Less than or equal to (`<=`)

2. **Field Path Support**
   - Supports nested field access (e.g., `customer.address.city`)
   - Validates field existence before rule creation
## 🔧 Implementation Details

### Rule Validation Process
1. User inputs a rule in format: `field operator value`
2. System validates:
   - Document passes JSON Schema validation
   - Field exists in the validated document
   - Operator validity
   - Rule logic against sample data
3. If all validations pass, rule is stored in PostgreSQL

### Database Implementation
- Rules are stored with unique UUIDs
- Each rule maintains its validation state
- Async operations for rule persistence using node-postgres
- Efficient querying using PostgreSQL indexes

## 💻 Usage Example

```bash
Add a rule (field operator value) or type "done" to finish: total_amount > 100
✅ Rule validation passed
✅ Rule saved to database
✅ Rule added successfully: {
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "field": "total_amount",
  "condition": ">",
  "value": "100",
  "isValid": true
}
```

## 🔍 Current Workflow

1. System loads a sample invoice for testing
2. User adds rules interactively through CLI
3. Each rule is validated against the sample invoice
4. Valid rules are saved to PostgreSQL
5. Final validation runs against all rules

