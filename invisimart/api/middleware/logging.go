package middleware

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// ResponseWriter wrapper to capture response body and status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
	body       *bytes.Buffer
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	if rw.body != nil {
		rw.body.Write(b)
	}
	return rw.ResponseWriter.Write(b)
}

// LoggingMiddleware provides request logging with optional debug mode
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Check if debug mode is enabled
		debug := strings.ToLower(os.Getenv("DEBUG")) == "true"

		// Create response writer wrapper
		var rw *responseWriter
		if debug {
			rw = &responseWriter{
				ResponseWriter: w,
				statusCode:     http.StatusOK, // Default status code
				body:           &bytes.Buffer{},
			}
		} else {
			rw = &responseWriter{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
				body:           nil, // Don't capture body in non-debug mode
			}
		}

		// Call the next handler
		next.ServeHTTP(rw, r)

		// Calculate request duration
		duration := time.Since(start)

		// Log basic request information
		log.Printf("method=%s path=%s status=%d duration=%v",
			r.Method,
			r.URL.Path,
			rw.statusCode,
			duration,
		)

		// Log response body in debug mode
		if debug && rw.body != nil && rw.body.Len() > 0 {
			responseBody := rw.body.String()

			// Try to format as JSON if it's valid JSON
			var prettyJSON bytes.Buffer
			if err := json.Indent(&prettyJSON, rw.body.Bytes(), "", "  "); err == nil {
				log.Printf("DEBUG response_body=%s", prettyJSON.String())
			} else {
				// Log as raw text if not valid JSON
				log.Printf("DEBUG response_body=%s", responseBody)
			}
		}
	})
}

