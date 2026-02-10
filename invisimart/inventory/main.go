package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"net/url"
	"os"
	"time"

	_ "github.com/lib/pq"
)

type InventoryItem struct {
	ProductID string
	Stock     int
	Location  string
}

func main() {
	log.Println("Starting Invisimart Inventory Simulator...")

	// Database connection setup using environment variables
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	if host == "" || port == "" || user == "" || password == "" || dbname == "" {
		log.Fatal("Missing required database environment variables")
	}

	// Parse ticker intervals from environment variables
	purchaseInterval, err := parseInterval("PURCHASE_INTERVAL", "3s")
	if err != nil {
		log.Fatalf("Invalid PURCHASE_INTERVAL: %v", err)
	}

	restockInterval, err := parseInterval("RESTOCK_INTERVAL", "15s")
	if err != nil {
		log.Fatalf("Invalid RESTOCK_INTERVAL: %v", err)
	}

	log.Printf("Purchase events every: %v", purchaseInterval)
	log.Printf("Restock events every: %v", restockInterval)

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		url.QueryEscape(host),
		url.QueryEscape(port),
		url.QueryEscape(user),
		url.QueryEscape(password),
		url.QueryEscape(dbname))
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping DB: %v", err)
	}
	log.Println("Successfully connected to database")

	// Initialize inventory tables if they don't exist
	if err := initializeDatabase(db); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Seed initial inventory data
	if err := seedInventory(db); err != nil {
		log.Fatalf("Failed to seed inventory: %v", err)
	}

	// Start simulation with separate tickers
	log.Println("Starting inventory simulation...")
	purchaseTicker := time.NewTicker(purchaseInterval)
	restockTicker := time.NewTicker(restockInterval)
	defer purchaseTicker.Stop()
	defer restockTicker.Stop()

	for {
		select {
		case <-purchaseTicker.C:
			simulatePurchase(db)
		case <-restockTicker.C:
			simulateRestock(db)
		}
	}
}

func initializeDatabase(db *sql.DB) error {
	// Create inventory table
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS inventory (
			id SERIAL PRIMARY KEY,
			product_id VARCHAR(50) NOT NULL,
			stock INTEGER NOT NULL DEFAULT 0,
			location VARCHAR(100) NOT NULL DEFAULT 'main-store',
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(product_id, location)
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create inventory table: %w", err)
	}

	// Create inventory events table for logging
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS inventory_events (
			id SERIAL PRIMARY KEY,
			product_id VARCHAR(50) NOT NULL,
			event_type VARCHAR(50) NOT NULL,
			quantity_change INTEGER NOT NULL,
			previous_stock INTEGER NOT NULL,
			new_stock INTEGER NOT NULL,
			location VARCHAR(100) NOT NULL DEFAULT 'main-store',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create inventory_events table: %w", err)
	}

	log.Println("Database tables initialized successfully")
	return nil
}

func parseInterval(envVar, defaultValue string) (time.Duration, error) {
	intervalStr := os.Getenv(envVar)
	if intervalStr == "" {
		intervalStr = defaultValue
	}
	return time.ParseDuration(intervalStr)
}

func getProductIDsFromDB(db *sql.DB) ([]string, error) {
	// Use the provided database connection to get actual product IDs
	log.Println("Getting product IDs from database...")

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Query for product IDs from the same database (using product_id column)
	rows, err := db.Query("SELECT product_id FROM products ORDER BY product_id")
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %w", err)
	}
	defer rows.Close()

	var productIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("failed to scan product ID: %w", err)
		}
		productIDs = append(productIDs, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating product rows: %w", err)
	}

	log.Printf("Retrieved %d product IDs from database", len(productIDs))
	return productIDs, nil
}

func seedInventory(db *sql.DB) error {
	// Get actual product IDs from the database
	productIDs, err := getProductIDsFromDB(db)
	if err != nil {
		log.Printf("Failed to get product IDs from database: %v, using defaults", err)
		productIDs = []string{"1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"}
	}

	locations := []string{"main-store", "downtown-store", "mall-store"}

	// Clear existing inventory to reset stock levels
	log.Println("Clearing existing inventory data to reset stock levels...")
	_, err = db.Exec("DELETE FROM inventory")
	if err != nil {
		log.Printf("Warning: Could not clear existing inventory: %v", err)
	}

	for _, productID := range productIDs {
		for _, location := range locations {
			// Set varied initial stock levels - some high, some low to trigger alerts
			var initialStock int
			switch rand.Intn(4) {
			case 0:
				initialStock = rand.Intn(5) + 1 // Very low stock: 1-5 (will trigger low stock alerts)
			case 1:
				initialStock = rand.Intn(10) + 6 // Low-medium stock: 6-15
			case 2:
				initialStock = rand.Intn(20) + 16 // Medium stock: 16-35
			case 3:
				initialStock = rand.Intn(30) + 36 // Higher stock: 36-65
			}

			_, err := db.Exec(`
				INSERT INTO inventory (product_id, stock, location)
				VALUES ($1, $2, $3)
			`, productID, initialStock, location)
			if err != nil {
				return fmt.Errorf("failed to seed inventory for product %s at %s: %w", productID, location, err)
			}
		}
	}

	log.Println("Inventory seeded successfully with varied stock levels")
	return nil
}

func simulatePurchase(db *sql.DB) {
	// Get a random product with available stock
	var item InventoryItem
	err := db.QueryRow(`
		SELECT product_id, stock, location
		FROM inventory
		WHERE stock > 0
		ORDER BY RANDOM()
		LIMIT 1
	`).Scan(&item.ProductID, &item.Stock, &item.Location)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("No items in stock for purchase")
			return
		}
		log.Printf("Error querying inventory: %v", err)
		return
	}

	// Simulate purchasing 1-3 items (but not more than available)
	maxPurchase := min(3, item.Stock)
	quantity := rand.Intn(maxPurchase) + 1
	newStock := item.Stock - quantity

	// Update inventory
	_, err = db.Exec(`
		UPDATE inventory
		SET stock = $1, updated_at = CURRENT_TIMESTAMP
		WHERE product_id = $2 AND location = $3
	`, newStock, item.ProductID, item.Location)

	if err != nil {
		log.Printf("Error updating inventory: %v", err)
		return
	}

	// Log the event
	_, err = db.Exec(`
		INSERT INTO inventory_events (product_id, event_type, quantity_change, previous_stock, new_stock, location)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, item.ProductID, "purchase", -quantity, item.Stock, newStock, item.Location)

	if err != nil {
		log.Printf("Error logging purchase event: %v", err)
	}

	status := ""
	if newStock == 0 {
		status = " - OUT OF STOCK!"
	} else if newStock <= 5 {
		status = " - LOW STOCK"
	}

	log.Printf("🛒 PURCHASE: Product %s at %s - Sold %d units (%d → %d)%s",
		item.ProductID, item.Location, quantity, item.Stock, newStock, status)
}

func simulateRestock(db *sql.DB) {
	// Only restock items that are actually low stock (≤ 10) or out of stock
	var item InventoryItem
	err := db.QueryRow(`
		SELECT product_id, stock, location
		FROM inventory
		WHERE stock <= 10
		ORDER BY stock ASC, RANDOM()
		LIMIT 1
	`).Scan(&item.ProductID, &item.Stock, &item.Location)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("📦 RESTOCK: No low stock items need restocking")
			return
		}
		log.Printf("Error querying inventory for restock: %v", err)
		return
	}

	// Restock to a healthy level (20-50 units depending on how low we were)
	var quantity int
	if item.Stock == 0 {
		// Out of stock - bigger restock
		quantity = rand.Intn(31) + 20 // 20-50 units
	} else if item.Stock <= 5 {
		// Very low stock - medium restock
		quantity = rand.Intn(21) + 15 // 15-35 units
	} else {
		// Low stock - smaller restock
		quantity = rand.Intn(16) + 10 // 10-25 units
	}

	newStock := item.Stock + quantity

	// Update inventory
	_, err = db.Exec(`
		UPDATE inventory
		SET stock = $1, updated_at = CURRENT_TIMESTAMP
		WHERE product_id = $2 AND location = $3
	`, newStock, item.ProductID, item.Location)

	if err != nil {
		log.Printf("Error updating inventory: %v", err)
		return
	}

	// Log the event
	_, err = db.Exec(`
		INSERT INTO inventory_events (product_id, event_type, quantity_change, previous_stock, new_stock, location)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, item.ProductID, "restock", quantity, item.Stock, newStock, item.Location)

	if err != nil {
		log.Printf("Error logging restock event: %v", err)
	}

	reason := ""
	if item.Stock == 0 {
		reason = " (OUT OF STOCK EMERGENCY)"
	} else if item.Stock <= 5 {
		reason = " (LOW STOCK ALERT)"
	} else {
		reason = " (LOW STOCK)"
	}

	log.Printf("📦 RESTOCK: Product %s at %s - Added %d units (%d → %d)%s",
		item.ProductID, item.Location, quantity, item.Stock, newStock, reason)
}

// min returns the smaller of two integers a and b.
// If a is less than b, it returns a; otherwise, it returns b.
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
