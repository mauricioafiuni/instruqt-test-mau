package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"invisimart-api/db"
	"invisimart-api/vault"

	"github.com/google/uuid"
)

// PurchaseRequest represents the incoming purchase request from the frontend
type PurchaseRequest struct {
	CustomerName    string        `json:"customerName"`
	CustomerEmail   string        `json:"customerEmail"`
	CustomerPhone   string        `json:"customerPhone"`
	CreditCard      string        `json:"creditCard"`
	BillingAddress  string        `json:"billingAddress"`
	Items           []PurchaseItem `json:"items"`
}

// PurchaseItem represents a single item in the purchase
type PurchaseItem struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unitPrice"`
}

// PurchaseResponse represents the response sent back to the frontend
type PurchaseResponse struct {
	OrderID   string  `json:"orderId"`
	Status    string  `json:"status"`
	Message   string  `json:"message"`
	Total     float64 `json:"total"`
	Timestamp string  `json:"timestamp"`
}

// CreatePurchaseHandler handles purchase requests with Vault integration
func CreatePurchaseHandler(w http.ResponseWriter, r *http.Request) {
	var req PurchaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate request
	if req.CustomerName == "" || req.CustomerEmail == "" || req.CustomerPhone == "" || req.CreditCard == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	if len(req.Items) == 0 {
		http.Error(w, "No items in purchase", http.StatusBadRequest)
		return
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.UnitPrice * float64(item.Quantity)
	}

	// Generate unique order ID
	orderID := fmt.Sprintf("INV-%s", uuid.New().String()[:8])

	// Encrypt sensitive data using Vault Transit engine (or mock if unavailable)
	var encryptedPhone, encryptedCard string
	
	if vault.IsAvailable() {
		// Use real Vault encryption
		var err error
		encryptedPhone, err = vault.EncryptData("invisimart-key", req.CustomerPhone)
		if err != nil {
			log.Printf("Failed to encrypt phone number with Vault: %v", err)
			// Fallback to mock encryption
			encryptedPhone = vault.MockEncrypt(req.CustomerPhone)
			log.Printf("Using mock encryption for phone number")
		}

		encryptedCard, err = vault.EncryptData("invisimart-key", req.CreditCard)
		if err != nil {
			log.Printf("Failed to encrypt credit card with Vault: %v", err)
			// Fallback to mock encryption
			encryptedCard = vault.MockEncrypt(req.CreditCard)
			log.Printf("Using mock encryption for credit card")
		}
	} else {
		// Vault not available, use mock encryption for demo purposes
		log.Printf("Vault not available, using mock encryption for demo")
		encryptedPhone = vault.MockEncrypt(req.CustomerPhone)
		encryptedCard = vault.MockEncrypt(req.CreditCard)
	}

	// Get database connection
	database, err := db.GetDB()
	if err != nil {
		log.Printf("Failed to get DB connection: %v", err)
		http.Error(w, fmt.Sprintf("Database connection error: %v", err), http.StatusInternalServerError)
		return
	}

	// Start transaction
	tx, err := database.Begin()
	if err != nil {
		log.Printf("Failed to begin transaction: %v", err)
		http.Error(w, fmt.Sprintf("Transaction error: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Insert purchase record with encrypted sensitive data
	var purchaseID int
	err = tx.QueryRow(`
		INSERT INTO purchases (order_id, customer_name, customer_email, customer_phone_encrypted, 
			credit_card_encrypted, billing_address, total_amount, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`, orderID, req.CustomerName, req.CustomerEmail, encryptedPhone, encryptedCard, 
		req.BillingAddress, totalAmount, "completed").Scan(&purchaseID)
	if err != nil {
		log.Printf("Failed to insert purchase: %v", err)
		http.Error(w, fmt.Sprintf("Database insert error: %v", err), http.StatusInternalServerError)
		return
	}

	// Insert purchase items
	for _, item := range req.Items {
		subtotal := item.UnitPrice * float64(item.Quantity)
		_, err = tx.Exec(`
			INSERT INTO purchase_items (purchase_id, product_id, product_name, quantity, unit_price, subtotal)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, purchaseID, item.ProductID, item.ProductName, item.Quantity, item.UnitPrice, subtotal)
		if err != nil {
			log.Printf("Failed to insert purchase item: %v", err)
			http.Error(w, fmt.Sprintf("Failed to insert purchase item: %v", err), http.StatusInternalServerError)
			return
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		log.Printf("Failed to commit transaction: %v", err)
		http.Error(w, fmt.Sprintf("Transaction commit error: %v", err), http.StatusInternalServerError)
		return
	}

	// Log successful purchase (without sensitive data)
	log.Printf("Purchase created successfully - OrderID: %s, Customer: %s, Total: $%.2f, Items: %d",
		orderID, req.CustomerName, totalAmount, len(req.Items))

	// Return response
	response := PurchaseResponse{
		OrderID:   orderID,
		Status:    "completed",
		Message:   "Purchase completed successfully",
		Total:     totalAmount,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

// GetPurchaseHandler retrieves a purchase by order ID
func GetPurchaseHandler(w http.ResponseWriter, r *http.Request) {
	orderID := r.URL.Query().Get("orderId")
	if orderID == "" {
		http.Error(w, "Order ID is required", http.StatusBadRequest)
		return
	}

	database, err := db.GetDB()
	if err != nil {
		log.Printf("Failed to get DB connection: %v", err)
		http.Error(w, "Failed to retrieve purchase", http.StatusInternalServerError)
		return
	}

	// Get purchase details
	var purchase struct {
		ID                     int
		OrderID                string
		CustomerName           string
		CustomerEmail          string
		CustomerPhoneEncrypted string
		CreditCardEncrypted    string
		BillingAddress         sql.NullString
		TotalAmount            float64
		Status                 string
		CreatedAt              time.Time
	}

	err = database.QueryRow(`
		SELECT id, order_id, customer_name, customer_email, customer_phone_encrypted,
			credit_card_encrypted, billing_address, total_amount, status, created_at
		FROM purchases WHERE order_id = $1
	`, orderID).Scan(&purchase.ID, &purchase.OrderID, &purchase.CustomerName, &purchase.CustomerEmail,
		&purchase.CustomerPhoneEncrypted, &purchase.CreditCardEncrypted, &purchase.BillingAddress,
		&purchase.TotalAmount, &purchase.Status, &purchase.CreatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Purchase not found", http.StatusNotFound)
		return
	}
	if err != nil {
		log.Printf("Failed to query purchase: %v", err)
		http.Error(w, "Failed to retrieve purchase", http.StatusInternalServerError)
		return
	}

	// Get purchase items
	rows, err := database.Query(`
		SELECT product_id, product_name, quantity, unit_price, subtotal
		FROM purchase_items WHERE purchase_id = $1
	`, purchase.ID)
	if err != nil {
		log.Printf("Failed to query purchase items: %v", err)
		http.Error(w, "Failed to retrieve purchase items", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []PurchaseItem
	for rows.Next() {
		var item PurchaseItem
		var subtotal float64
		if err := rows.Scan(&item.ProductID, &item.ProductName, &item.Quantity, &item.UnitPrice, &subtotal); err != nil {
			log.Printf("Failed to scan purchase item: %v", err)
			continue
		}
		items = append(items, item)
	}

	// Prepare response (without decrypting sensitive data for security)
	response := map[string]interface{}{
		"orderId":        purchase.OrderID,
		"customerName":   purchase.CustomerName,
		"customerEmail":  purchase.CustomerEmail,
		"billingAddress": purchase.BillingAddress.String,
		"totalAmount":    purchase.TotalAmount,
		"status":         purchase.Status,
		"createdAt":      purchase.CreatedAt.Format(time.RFC3339),
		"items":          items,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}
