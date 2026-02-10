package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"invisimart-api/db"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Image string  `json:"image"`
	Price float64 `json:"price"`
	Description *string `json:"description,omitempty"`
}

func ListProductsHandler(w http.ResponseWriter, r *http.Request) {
	database, err := db.GetDB()
	if err != nil {
		http.Error(w, "Failed to get DB connection: "+err.Error(), http.StatusInternalServerError)
		return
	}

	rows, err := database.Query("SELECT id, name, image, price FROM products")
	if err != nil {
		http.Error(w, "Failed to query products: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	products := []Product{}
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Image, &p.Price); err != nil {
			http.Error(w, "Failed to scan product: "+err.Error(), http.StatusInternalServerError)
			return
		}
		products = append(products, p)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(products); err != nil {
		http.Error(w, "Failed to encode products: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetProductHandler(w http.ResponseWriter, r *http.Request) {
	// Extract product ID from URL path using Gorilla Mux
	vars := mux.Vars(r)
	productID := vars["id"]

	if productID == "" {
		http.Error(w, "Product ID is required", http.StatusBadRequest)
		return
	}

	database, err := db.GetDB()
	if err != nil {
		http.Error(w, "Failed to get DB connection: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var p Product
	err = database.QueryRow("SELECT id, name, image, price FROM products WHERE id = $1", productID).Scan(&p.ID, &p.Name, &p.Image, &p.Price)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to query product: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(p); err != nil {
		http.Error(w, "Failed to encode product: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
