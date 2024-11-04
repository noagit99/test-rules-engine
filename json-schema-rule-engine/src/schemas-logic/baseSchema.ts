import { OPTIONAL_FIELDS } from '../shared/fields';

// Filter out optional fields from required array
const requiredFields = [
  "externalTransactionId",
  "invoiceNumber",
  "issueDate",
  "dueDate",
  "terms",
  "description",
  "invoiceType",
  "paymentPeriodStart",
  "paymentPeriodEnd",
  "paymentPeriod",
  "externalStatus",
  "billingCurrency",
  "totals",
  "receivable",
  "payable",
  "line_items",
  "files"
].filter(field => !OPTIONAL_FIELDS.includes(field));

export const invoiceSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: 'object',
  properties: {
    externalTransactionId: { type: "string", format: "uuid" },
    invoiceNumber: { type: "string" },
    issueDate: { type: "string", format: "date" },
    dueDate: { type: "string", format: "date" },
    terms: { type: "string" },
    description: { type: "string" },
    invoiceType: { type: "string" },
    paymentPeriodStart: { type: "string", format: "date" },
    paymentPeriodEnd: { type: "string", format: "date" },
    paymentPeriod: { type: "string" },
    externalStatus: { type: "string" },
    billingCurrency: { type: "string" },
    purchaseOrderNumber: { type: "string" },
    totals: {
      type: "object",
      properties: {
        amountPaid: { type: "number" },
        amountRemaining: { type: "number" },
        taxTotal: { type: "number" },
        subTotal: { type: "number" },
        discountTotal: { type: "number" },
        totalAmount: { type: "number" }
      },
      required: [
        "amountPaid",
        "amountRemaining",
        "taxTotal",
        "subTotal",
        "discountTotal",
        "totalAmount"
      ]
    },
    receivable: {
      type: "object",
      properties: {
        supplier: {
          type: "object",
          properties: {
            externalId: { type: "string" },
            name: { type: "string" },
            legalName: { type: "string" },
            taxId: { type: "string" },
            registrationNumber: { type: "string" },
            address: {
              type: "object",
              properties: {
                line1: { type: "string" },
                line2: { type: "string" },
                line3: { type: "string" },
                district: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                postCode: { type: "string" },
                country: { type: "string" },
                countryName: { type: "string" }
              },
              required: [
                "line1", "city", "state", "postCode", "country", "countryName"
              ]
            }
          },
          required: [
            "externalId", "name", "legalName", "taxId", "registrationNumber", "address"
          ]
        },
        billFrom: {
          type: "object",
          properties: {
            externalId: { type: "string" },
            name: { type: "string" },
            address: { "$ref": "#/properties/receivable/properties/supplier/properties/address" }
          },
          required: [
            "externalId", "name", "address"
          ]
        },
        shipFrom: {
          type: "object",
          properties: {
            externalId: { type: "string" },
            name: { type: "string" },
            address: { "$ref": "#/properties/receivable/properties/supplier/properties/address" }
          },
          required: [
            "externalId", "name", "address"
          ]
        },
        remitTo: {
          type: "object",
          properties: {
            externalId: { type: "string" },
            name: { type: "string" },
            address: { "$ref": "#/properties/receivable/properties/supplier/properties/address" }
          },
          required: [
            "externalId", "name", "address"
          ]
        },
        beneficiary: {
          type: "object",
          properties: {
            externalId: { type: "string" },
            beneficiaryName: { type: "string" },
            bankName: { type: "string" },
            bankAcountNumber: { type: "string" },
            bankIdentifierCode: { type: "string" },
            iban: { type: "string" },
            routingNumber: { type: "string" }
          },
          required: [
            "externalId", "beneficiaryName", "bankName", "bankAcountNumber", "bankIdentifierCode", "iban", "routingNumber"
          ]
        }
      },
      required: ["supplier", "billFrom", "shipFrom", "remitTo", "beneficiary"]
    },
    payable: {
      type: "object",
      properties: {
        buyer: {
          type: "object",
          properties: {
            externalId: { type: "string" },
            name: { type: "string" },
            legalName: { type: "string" },
            taxId: { type: "string" },
            registrationNumber: { type: "string" },
            address: { "$ref": "#/properties/receivable/properties/supplier/properties/address" }
          },
          required: [
            "externalId", "name", "legalName", "taxId", "registrationNumber", "address"
          ]
        },
        billTo: {
          type: "object",
          properties: {
            externalId: { type: "string" },
            name: { type: "string" },
            department: { type: "string" },
            billingAccount: { type: "string" },
            costCenter: { type: "string" },
            addressee: { type: "string" },
            address: { "$ref": "#/properties/receivable/properties/supplier/properties/address" }
          },
          required: [
            "externalId", "name", "address"
          ]
        },
        shipTo: {
          type: "object",
          properties: {
            externalId: { type: "string" },
            name: { type: "string" },
            address: { "$ref": "#/properties/receivable/properties/supplier/properties/address" }
          },
          required: [
            "externalId", "name", "address"
          ]
        }
      },
      required: ["buyer", "billTo", "shipTo"]
    },
    line_items: {
      type: "object",
      properties: {
        totallines: { type: "integer" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lineNum: { type: "integer" },
              item: { type: "string" },
              description: { type: "string" },
              quantity: { type: "number" },
              pricePerUnit: { type: "number" },
              originalCurrency: { type: "string" },
              conversionRate: { type: "number" },
              totalAmount: { type: "number" }
            },
            required: [
              "lineNum", "item", "description", "quantity", "pricePerUnit", "originalCurrency", "conversionRate", "totalAmount"
            ]
          }
        }
      },
      required: ["totallines", "items"]
    },
    files: {
      type: "object",
      properties: {
        invoice: {
          type: "object",
          properties: {
            name: { type: "string" },
            fileType: { type: "string" },
            filePath: { type: "string" }
          },
          required: ["name", "fileType", "filePath"]
        },
        additionalFiles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              fileType: { type: "string" },
              path: { type: "string" }
            },
            required: ["name", "fileType", "path"]
          }
        }
      },
      required: ["invoice", "additionalFiles"]
    }
  },
  required: requiredFields
};