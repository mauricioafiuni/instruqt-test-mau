package db

import (
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"sync"
	"time"

	_ "github.com/lib/pq"
)

var (
	db   *sql.DB
	once sync.Once
)

// GetDB returns a singleton connection to the database
func GetDB() (*sql.DB, error) {
	var err error
	once.Do(func() {
		db, err = connectToDatabase()
		if err == nil {
			configureConnectionPool(db)
		}
	})
	return db, err
}

// connectToDatabase creates a new database connection with proper URL encoding
func connectToDatabase() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		url.QueryEscape(host),
		url.QueryEscape(port),
		url.QueryEscape(user),
		url.QueryEscape(password),
		url.QueryEscape(dbname))

	return sql.Open("postgres", connStr)
}

// configureConnectionPool sets reasonable connection pool settings for an API
func configureConnectionPool(db *sql.DB) {
	// Maximum number of open connections to the database
	db.SetMaxOpenConns(25)

	// Maximum number of idle connections in the pool
	db.SetMaxIdleConns(5)

	// Maximum amount of time a connection may be reused
	db.SetConnMaxLifetime(5 * time.Minute)

	// Maximum amount of time a connection may be idle
	db.SetConnMaxIdleTime(1 * time.Minute)
}

// Close closes the database connection
func Close() error {
	if db != nil {
		return db.Close()
	}
	return nil
}

// HealthCheck performs a health check on the database
func HealthCheck() (healthy bool, err error) {
	if db != nil {
		err = db.Ping()
		healthy = err == nil
	}

	return healthy, err
}
