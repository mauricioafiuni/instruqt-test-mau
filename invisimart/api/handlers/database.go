package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"invisimart-api/db"
)

type DatabaseHealthResponse struct {
	Status       string        `json:"status"`
	Message      string        `json:"message"`
	Timestamp    time.Time     `json:"timestamp"`
	ResponseTime string        `json:"response_time"`
	Connection   struct {
		Host     string `json:"host"`
		Port     string `json:"port"`
		Database string `json:"database"`
		User     string `json:"user"`
	} `json:"connection"`
}

func TestDBHandler(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	// Get environment variables for connection info display
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	dbname := os.Getenv("DB_NAME")

	response := DatabaseHealthResponse{
		Timestamp: time.Now(),
	}

	response.Connection.Host = host
	response.Connection.Port = port
	response.Connection.Database = dbname
	response.Connection.User = user

	// Use consolidated database connection
	database, err := db.GetDB()
	if err != nil {
		response.Status = "unhealthy"
		response.Message = "Failed to get database connection: " + err.Error()
		response.ResponseTime = time.Since(startTime).String()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.Ping(); err != nil {
		response.Status = "unhealthy"
		response.Message = "Failed to ping database: " + err.Error()
		response.ResponseTime = time.Since(startTime).String()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(response)
		return
	}

	response.Status = "healthy"
	response.Message = "Successfully connected to database"
	response.ResponseTime = time.Since(startTime).String()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
