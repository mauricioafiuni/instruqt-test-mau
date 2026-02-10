package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"invisimart-api/db"
	"invisimart-api/handlers"
	"invisimart-api/middleware"
	"invisimart-api/vault"

	"github.com/gorilla/mux"
)

func main() {
	fmt.Println("Invisimart API Server starting...")

	// Initialize Vault client (only if VAULT_ADDR is set)
	vaultAddr := os.Getenv("VAULT_ADDR")
	if vaultAddr != "" {
		if err := vault.InitVault(); err != nil {
			log.Printf("Warning: Failed to initialize Vault client: %v", err)
			log.Printf("Vault integration will be unavailable. Set VAULT_ADDR and VAULT_TOKEN to enable.")
		} else {
			log.Println("Vault client initialized successfully")
		}
	} else {
		log.Println("VAULT_ADDR not set. Vault integration disabled.")
	}

	// Create a new Gorilla Mux router
	r := mux.NewRouter()

	// Apply middleware in order: logging first, then CORS
	r.Use(middleware.LoggingMiddleware)
	r.Use(middleware.CORSMiddleware)

	// Define routes with proper HTTP methods
	r.HandleFunc("/health", handlers.HealthHandler).Methods("GET")
	r.HandleFunc("/", handlers.RootHandler).Methods("GET")
	r.HandleFunc("/health/db", handlers.TestDBHandler).Methods("GET")
	r.HandleFunc("/products", handlers.ListProductsHandler).Methods("GET")
	r.HandleFunc("/products/{id}", handlers.GetProductHandler).Methods("GET")
	r.HandleFunc("/inventory", handlers.GetInventoryHandler).Methods("GET")
	r.HandleFunc("/inventory/events", handlers.GetInventoryEventsHandler).Methods("GET")
	
	// Purchase endpoints
	r.HandleFunc("/purchase", handlers.CreatePurchaseHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/purchase", handlers.GetPurchaseHandler).Methods("GET")

	// Create HTTP server
	server := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	// Start server in a goroutine
	go func() {
		fmt.Printf("Server starting on port %s\n", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with a timeout
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Server is shutting down...")

	// Give outstanding requests a deadline for completion
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	server.SetKeepAlivesEnabled(false)
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	// Close database connections
	if err := db.Close(); err != nil {
		log.Printf("Error closing database connections: %v", err)
	}

	log.Println("Server exiting")
}
