#!/bin/bash

# Test script for the health endpoints
API_URL="http://localhost:8080"

echo "Testing Invisimart API Health Endpoints"
echo "======================================="

echo -e "\n1. Testing API Health endpoint..."
curl -s "$API_URL/health" | jq . || echo "Failed to get API health"

echo -e "\n2. Testing Database Health endpoint..."
curl -s "$API_URL/health/db" | jq . || echo "Failed to get database health"

echo -e "\n3. Testing Products endpoint..."
curl -s "$API_URL/products" | jq 'length' || echo "Failed to get products"

echo -e "\n4. Testing Inventory endpoint..."
curl -s "$API_URL/inventory" | jq 'length' || echo "Failed to get inventory"

echo -e "\n5. Testing Inventory Events endpoint..."
curl -s "$API_URL/inventory/events" | jq 'length' || echo "Failed to get inventory events"

echo -e "\nHealth check tests completed!"
