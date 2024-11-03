# JSON Schema Rule Engine

A flexible rule engine for validating JSON documents with custom rules and database persistence.

## 🚀 Technology Stack

- **TypeScript** - Main programming language
- **Node.js** - Runtime environment
- **PostgreSQL** - Database for rule persistence
  - Leverages JSONB data type for flexible rule storage
  - Provides robust querying capabilities for rules
- **UUID** - For unique rule identification

### JSON Schema Validation Example

```typescript
// JSON Schema for Invoice
const invoiceSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["id", "date", "total_amount", "customer"],
  properties: {
    id: {
      type: "string",
      format: "uuid",
      description: "Unique identifier for the invoice"
    },
    date: {
      type: "string",
      format: "date",
      description: "Invoice creation date"
    },
    total_amount: {
      type: "number",
      minimum: 0,
      description: "Total amount of the invoice"
    },
    customer: {
      type: "object",
      required: ["name", "email"],
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" }
      }
    }
  }
};

// Sample invoice document
const sampleInvoice = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  date: "2024-03-20",
  total_amount: 1500.50,
  customer: {
    name: "Acme Corp",
    email: "billing@acme.com"
  }
};

// Validation examples
✅ Valid invoice:
validateDocument(sampleInvoice)
// Result: [] (empty array means no errors)

❌ Schema validation errors:
validateDocument({
  id: "invalid-uuid",
  date: "2024-03-20",
  customer: {
    name: "",  // minLength violation
    // email missing
  }
  // total_amount missing
})
// Result: [
//   "/id must match format \"uuid\"",
//   "must have required property 'total_amount'",
//   "/customer/name must NOT have fewer than 1 characters",
//   "/customer must have required property 'email'"
// ]