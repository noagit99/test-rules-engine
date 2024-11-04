export const sampleInvoice = {
    "externalTransactionId": "4342336d-ded2-4e20-ace8-3d63276be455",
    "invoiceNumber": "INV-24000446",
    "issueDate": "2024-01-22",
    "dueDate": "2024-01-29",
    "terms": "Net 7",
    "description": "Zero Touch Payments",
    "invoiceType": "INVOICE",
    "paymentPeriodStart": "2024-01-14",
    "paymentPeriodEnd": "2024-01-14",
    "paymentPeriod": "Jan 2024",
    "externalStatus": "Open",
    "billingCurrency": "USD",
    "purchaseOrderNumber": "PO-4342336d",
    "totals": {
        "amountPaid": 205011.64,
        "amountRemaining": 0.0,
        "taxTotal": 1320.0,
        "subTotal": 203691.64,
        "discountTotal": 0.0,
        "totalAmount": 205011.64
    },
    "receivable": {
        "supplier": {
            "externalId": "1342336d-ded2-4e20-ace8-3d63276be455",
            "name": "My Supplier Name",
            "legalName": "Supplier Legal Name",
            "taxId": "3d63276be455",
            "registrationNumber": "1342336d",
            "address": {
                "line1": "213 Main St",
                "line2": "Apt 17",
                "line3": "",
                "district": "",
                "city": "Kansas City",
                "state": "MO",
                "postCode": "64116",
                "country": "IL",
                "countryName": "Israel"
            }
        },
        "billFrom": {
            "externalId": "4342336d-ded2-4e20-ace8-3d63276be455",
            "name": "Billing Entity Name",
            "address": {
                "line1": "213 Main St",
                "line2": "Apt 17",
                "line3": "",
                "district": "",
                "city": "Kansas City",
                "state": "MO",
                "postCode": "64116",
                "country": "IL",
                "countryName": "Israel"
            }
        },
        "shipFrom": {
            "externalId": "2342336d-ded2-4e20-ace8-3d63276be455",
            "name": "Ship From Name",
            "address": {
                "line1": "213 Main St",
                "line2": "Apt 17",
                "line3": "",
                "district": "",
                "city": "Kansas City",
                "state": "MO",
                "postCode": "64116",
                "country": "IL",
                "countryName": "Israel"
            }
        },
        "remitTo": {
            "externalId": "3342336d-ded2-4e20-ace8-3d63276be455",
            "name": "Remit To Name",
            "address": {
                "line1": "213 Main St",
                "line2": "Apt 17",
                "line3": "",
                "district": "",
                "city": "Kansas City",
                "state": "MO",
                "postCode": "64116",
                "country": "IL",
                "countryName": "Israel"
            }
        },
        "beneficiary": {
            "externalId": "5342336d-ded2-4e20-ace8-3d63276be455",
            "beneficiaryName": "Monto LTD",
            "bankName": "JP Morgan",
            "bankAcountNumber": "132456987",
            "bankIdentifierCode": "AAAA-BB-CC-123",
            "iban": "AT483200000012345864",
            "routingNumber": "211370545"
        }
    },
    "payable": {
        "buyer": {
            "externalId": "6342336d-ded2-4e20-ace8-3d63276be455",
            "name": "My Buyer Name",
            "legalName": "Buyer Legal Name",
            "taxId": "354654654546",
            "registrationNumber": "123645877",
            "address": {
                "line1": "213 Main St",
                "line2": "Apt 17",
                "line3": "",
                "district": "",
                "city": "Kansas City",
                "state": "MO",
                "postCode": "64116",
                "country": "IL",
                "countryName": "Israel"
            }
        },
        "billTo": {
            "externalId": "7342336d-ded2-4e20-ace8-3d63276be455",
            "name": "Bill To Name",
            "department": "Billing Department",
            "billingAccount": "Billing Account",
            "costCenter": "Cost Center",
            "addressee": "Bill To Name, SaaS Department",
            "address": {
                "line1": "213 Main St",
                "line2": "Apt 17",
                "line3": "",
                "district": "",
                "city": "Kansas City",
                "state": "MO",
                "postCode": "64116",
                "country": "IL",
                "countryName": "Israel"
            }
        },
        "shipTo": {
            "externalId": "8342336d-ded2-4e20-ace8-3d63276be455",
            "name": "Ship To Name",
            "address": {
                "line1": "213 Main St",
                "line2": "Apt 17",
                "line3": "",
                "district": "",
                "city": "Kansas City",
                "state": "MO",
                "postCode": "64116",
                "country": "IL",
                "countryName": "Israel"
            }
        }
    },
    "line_items": {
        "totallines": 2,
        "items": [
            {
                "lineNum": 1,
                "item": "item or code",
                "description": "Item name or description",
                "quantity": 1.0,
                "pricePerUnit": 2795.9,
                "originalCurrency": "AUD",
                "conversionRate": 1.0,
                "totalAmount": 2795.9
            },
            {
                "lineNum": 2,
                "item": "item-1",
                "description": "Item-1 is flowers",
                "quantity": 1.0,
                "pricePerUnit": 2795.9,
                "originalCurrency": "AUD",
                "conversionRate": 1.0,
                "totalAmount": 2795.9
            }
        ]
    },
    "files": {
        "invoice": {
            "name": "INV-24000446.pdf",
            "fileType": "application/pdf",
            "filePath": "path to the INV-24000446.pdf"
        },
        "additionalFiles": [
            {
                "name": "PO-24000446.pdf",
                "fileType": "application/pdf",
                "path": "path to the PO-24000446.pdf"
            },
            {
                "name": "Status-24000446.pdf",
                "fileType": "application/pdf",
                "path": "path to the Status-24000446.pdf"
            }
        ]
    }
};









