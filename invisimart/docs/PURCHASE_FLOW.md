# Purchase Flow User Journey

This document describes the complete user journey through the Invisimart purchase flow with Vault integration.

## Flow Overview

```
Home Page → Product Selection → Add to Cart → Cart Review → Checkout → Confirmation
```

## Detailed Flow

### 1. Home Page
- User browses products with real-time inventory tracking
- Products show online and in-store stock levels
- "ADD TO CART" button on each product card

**Action:** Click "ADD TO CART" button

**Result:** 
- Button briefly shows "✓ ADDED TO CART!" with green background
- Cart icon in navigation updates with item count badge
- Item is added to cart state

---

### 2. Cart Page (`/cart`)
Access via: Click cart icon in navigation

**Features:**
- List of all items in cart with images
- Quantity controls (+/- buttons)
- Remove item button (×)
- Real-time price calculation
- Order summary sidebar showing:
  - Subtotal with item count
  - Free shipping
  - Total amount

**Actions:**
- Adjust quantities
- Remove items
- Click "Proceed to Checkout" button

---

### 3. Checkout Page (`/checkout`)

**Security Notice:**
Displays prominent message: "🔐 Protected by HashiCorp Vault: Your sensitive data is encrypted using industry-standard encryption before storage."

**Form Fields:**

1. **Full Name** (plaintext)
   - Example: "John Doe"

2. **Email Address** (plaintext)
   - Example: "john@example.com"

3. **Phone Number** 🔐 (encrypted)
   - Format: Auto-formats to (123) 456-7890
   - Label includes: "(Encrypted with Vault Transit)"
   - Stored encrypted in database

4. **Credit Card Number** 🔐 (encrypted)
   - Format: Auto-formats to 1234 5678 9012 3456
   - Label includes: "(Encrypted with Vault Transit)"
   - Stored encrypted in database
   - Max 16 digits

5. **Billing Address** (plaintext)
   - Multi-line text area
   - Example: "123 Main St, Apt 4, City, State 12345"

**Order Summary Sidebar:**
- Shows all items being purchased
- Displays quantities and prices
- Shows subtotal, shipping (FREE), and total

**Action:** Click "COMPLETE PURCHASE" button

**Processing:**
1. Validates all form fields
2. Prepares purchase data with cart items
3. Encrypts phone number using Vault Transit
4. Encrypts credit card using Vault Transit
5. Sends encrypted data to backend API
6. Backend stores encrypted data in PostgreSQL
7. Redirects to confirmation page

---

### 4. Confirmation Page (`/confirmation`)

**Success Header:**
- ✅ Large checkmark icon
- "Purchase Complete!" heading
- "Thank you for your order, [Customer Name]!"
- Order number in orange badge (e.g., "INV-a1b2c3d4")

**Order Details Section:**
- Email address
- Billing address
- Order date and time
- Status badge (COMPLETED)

**Items Ordered Section:**
- List of all purchased items
- Shows quantity and unit price
- Calculates subtotals
- Grand total displayed prominently

**Security Notice:**
Blue information box explaining:
"All sensitive payment information was encrypted using HashiCorp Vault Transit engine before storage. Your credit card and phone number are protected with industry-standard encryption."

**Action:** "Continue Shopping" button returns to home page

---

## Backend Processing

### Purchase Creation Flow

1. **Request Received:**
   ```json
   {
     "customerName": "John Doe",
     "customerEmail": "john@example.com",
     "customerPhone": "1234567890",
     "creditCard": "1234567890123456",
     "billingAddress": "123 Main St",
     "items": [...]
   }
   ```

2. **Vault Encryption:**
   - Phone → Vault Transit → `vault:v1:encrypted_phone_data`
   - Credit Card → Vault Transit → `vault:v1:encrypted_card_data`

3. **Database Storage:**
   ```sql
   INSERT INTO purchases (
     order_id, customer_name, customer_email,
     customer_phone_encrypted,  -- Vault ciphertext
     credit_card_encrypted,     -- Vault ciphertext
     billing_address, total_amount, status
   ) VALUES (...)
   ```

4. **Transaction Logging:**
   ```
   Purchase created successfully - OrderID: INV-a1b2c3d4, 
   Customer: John Doe, Total: $1234.00, Items: 3
   ```
   (No sensitive data in logs)

5. **Response:**
   ```json
   {
     "orderId": "INV-a1b2c3d4",
     "status": "completed",
     "message": "Purchase completed successfully",
     "total": 1234.00,
     "timestamp": "2025-10-29T14:30:00Z"
   }
   ```

---

## Security Features

### Data Protection
- ✅ Phone numbers encrypted with Vault Transit
- ✅ Credit card numbers encrypted with Vault Transit
- ✅ No plaintext sensitive data in database
- ✅ No sensitive data in application logs
- ✅ Encryption happens before database write
- ✅ Only encrypted ciphertext is persisted

### Vault Configuration Required
- Transit engine enabled
- Encryption key created: `invisimart-key`
- API configured with VAULT_ADDR and VAULT_TOKEN

### Graceful Degradation
- If Vault is not configured, API logs warning
- Purchase endpoint will fail with clear error message
- Other features continue to work normally

---

## API Endpoints

### POST /purchase
Creates a new purchase order

**Request Body:**
```json
{
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "creditCard": "string",
  "billingAddress": "string",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": number,
      "unitPrice": number
    }
  ]
}
```

**Response:**
```json
{
  "orderId": "string",
  "status": "completed",
  "message": "string",
  "total": number,
  "timestamp": "string"
}
```

### GET /purchase?orderId={id}
Retrieves purchase details by order ID

**Response:**
```json
{
  "orderId": "string",
  "customerName": "string",
  "customerEmail": "string",
  "billingAddress": "string",
  "totalAmount": number,
  "status": "string",
  "createdAt": "string",
  "items": [...]
}
```

Note: Sensitive encrypted data (phone, credit card) is NOT returned in GET requests for security.

---

## Testing the Flow

### Prerequisites
1. Vault server running with Transit engine enabled
2. Encryption key created: `invisimart-key`
3. Environment variables set: `VAULT_ADDR` and `VAULT_TOKEN`
4. Invisimart application running

### Test Steps

1. **Add Items to Cart:**
   - Navigate to http://localhost:8000
   - Click "ADD TO CART" on several products
   - Verify cart icon shows item count

2. **Review Cart:**
   - Click cart icon
   - Verify items are listed correctly
   - Test quantity controls
   - Test remove item

3. **Checkout:**
   - Click "Proceed to Checkout"
   - Fill in all form fields
   - Verify phone and credit card formatting
   - Click "COMPLETE PURCHASE"

4. **Verify:**
   - Confirm redirect to confirmation page
   - Verify order details are correct
   - Check database for encrypted data
   - Check API logs for transaction record

### Database Verification

```sql
-- View purchases (encrypted data)
SELECT order_id, customer_name, customer_email, 
       customer_phone_encrypted, 
       credit_card_encrypted, 
       total_amount, status 
FROM purchases;
```

The `customer_phone_encrypted` and `credit_card_encrypted` fields should show Vault ciphertext starting with `vault:v1:`.

---

## Future Enhancements

### Potential Additions
1. **Transform Engine Integration:**
   - Add credit card tokenization
   - Implement format-preserving encryption
   - Add masking for display (e.g., **** **** **** 3456)

2. **Payment Gateway:**
   - Integrate real payment processor
   - Add payment verification
   - Support multiple payment methods

3. **Order Management:**
   - Order status tracking
   - Email notifications
   - Order history page

4. **Enhanced Security:**
   - AppRole authentication for production
   - Key rotation automation
   - Audit logging integration

5. **User Features:**
   - User accounts and profiles
   - Saved payment methods (tokenized)
   - Address book
   - Order tracking
