package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"invisimart-api/db"

	_ "github.com/lib/pq"
)

type InventoryItem struct {
	ID                 string    `json:"id"`
	Name               string    `json:"name"`
	Image              string    `json:"image"`
	Price              float64   `json:"price"`
	OnlineStock        int       `json:"onlineStock"`
	InStoreStock       int       `json:"inStoreStock"`
	LowStockThreshold  int       `json:"lowStockThreshold"`
	LastUpdated        time.Time `json:"lastUpdated"`
	OnlineInStock      bool      `json:"onlineInStock"`
	InStoreInStock     bool      `json:"inStoreInStock"`
}

// GetInventoryHandler returns inventory data from the database
func GetInventoryHandler(w http.ResponseWriter, r *http.Request) {
	// Get database connection using the consolidated db package
	database, err := db.GetDB()
	if err != nil {
		http.Error(w, "Failed to connect to database: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get aggregated inventory data by product with product details in single query
	inventoryQuery := `
		SELECT
			p.product_id,
			p.name,
			p.image,
			p.price,
			COALESCE(SUM(CASE WHEN i.location LIKE '%online%' OR i.location = 'main-store' THEN i.stock ELSE 0 END), 0) as online_stock,
			COALESCE(SUM(CASE WHEN i.location != 'main-store' AND i.location NOT LIKE '%online%' THEN i.stock ELSE 0 END), 0) as in_store_stock,
			COALESCE(MAX(i.updated_at), NOW()) as last_updated
		FROM products p
		LEFT JOIN inventory i ON p.product_id = i.product_id
		GROUP BY p.product_id, p.name, p.image, p.price
		ORDER BY p.product_id
	`

	rows, err := database.Query(inventoryQuery)
	if err != nil {
		http.Error(w, "Failed to query inventory: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	inventoryItems := []InventoryItem{}

	for rows.Next() {
		var productID, name, image string
		var price float64
		var onlineStock, inStoreStock int
		var lastUpdated time.Time

		if err := rows.Scan(&productID, &name, &image, &price, &onlineStock, &inStoreStock, &lastUpdated); err != nil {
			http.Error(w, "Failed to scan inventory row: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Create inventory item
		item := InventoryItem{
			ID:                productID,
			Name:              name,
			Image:             image,
			Price:             price,
			OnlineStock:       onlineStock,
			InStoreStock:      inStoreStock,
			LowStockThreshold: 10, // Default threshold
			LastUpdated:       lastUpdated,
			OnlineInStock:     onlineStock > 0,
			InStoreInStock:    inStoreStock > 0,
		}

		inventoryItems = append(inventoryItems, item)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(inventoryItems); err != nil {
		http.Error(w, "Failed to encode inventory: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

// GetInventoryEventsHandler returns inventory events from the database
func GetInventoryEventsHandler(w http.ResponseWriter, r *http.Request) {
	// Get database connection using the consolidated db package
	database, err := db.GetDB()
	if err != nil {
		http.Error(w, "Failed to connect to database: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get recent inventory events
	eventsQuery := `
		SELECT
			product_id, event_type, quantity_change, previous_stock, new_stock, location, created_at
		FROM inventory_events
		ORDER BY created_at DESC
		LIMIT 100
	`

	rows, err := database.Query(eventsQuery)
	if err != nil {
		http.Error(w, "Failed to query inventory events: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type InventoryEvent struct {
		ProductID       string    `json:"product_id"`
		EventType       string    `json:"event_type"`
		QuantityChange  int       `json:"quantity_change"`
		PreviousStock   int       `json:"previous_stock"`
		NewStock        int       `json:"new_stock"`
		Location        string    `json:"location"`
		CreatedAt       time.Time `json:"created_at"`
	}

	events := []InventoryEvent{}

	for rows.Next() {
		var event InventoryEvent
		if err := rows.Scan(&event.ProductID, &event.EventType, &event.QuantityChange,
			&event.PreviousStock, &event.NewStock, &event.Location, &event.CreatedAt); err != nil {
			http.Error(w, "Failed to scan inventory event: "+err.Error(), http.StatusInternalServerError)
			return
		}
		events = append(events, event)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(events); err != nil {
		http.Error(w, "Failed to encode inventory events: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
