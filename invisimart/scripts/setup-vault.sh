#!/bin/bash
# Quick Vault setup script for Invisimart development

set -e

echo "🔐 Setting up HashiCorp Vault for Invisimart..."

# Check if Vault is installed
if ! command -v vault &> /dev/null; then
    echo "❌ Error: Vault CLI is not installed."
    echo "Please install Vault from: https://www.vaultproject.io/downloads"
    exit 1
fi

# Check if VAULT_ADDR is set
if [ -z "$VAULT_ADDR" ]; then
    echo "❌ Error: VAULT_ADDR environment variable is not set."
    echo "Please set VAULT_ADDR, for example:"
    echo "  export VAULT_ADDR='http://127.0.0.1:8200'"
    exit 1
fi

# Check if VAULT_TOKEN is set
if [ -z "$VAULT_TOKEN" ]; then
    echo "❌ Error: VAULT_TOKEN environment variable is not set."
    echo "Please set VAULT_TOKEN with your Vault token."
    exit 1
fi

echo "✓ Vault CLI found"
echo "✓ VAULT_ADDR: $VAULT_ADDR"
echo "✓ VAULT_TOKEN is set"

# Check Vault server connectivity
echo ""
echo "Checking Vault server connectivity..."
if ! vault status &> /dev/null; then
    echo "❌ Error: Cannot connect to Vault server at $VAULT_ADDR"
    echo "Make sure Vault is running. For development, you can start it with:"
    echo "  vault server -dev"
    exit 1
fi
echo "✓ Connected to Vault server"

# Enable Transit secrets engine
echo ""
echo "Enabling Transit secrets engine..."
if vault secrets list | grep -q "^transit/"; then
    echo "⚠ Transit engine already enabled"
else
    vault secrets enable transit
    echo "✓ Transit engine enabled"
fi

# Create encryption key
echo ""
echo "Creating encryption key 'invisimart-key'..."
if vault list transit/keys | grep -q "invisimart-key"; then
    echo "⚠ Key 'invisimart-key' already exists"
else
    vault write -f transit/keys/invisimart-key
    echo "✓ Encryption key created"
fi

# Verify setup
echo ""
echo "Verifying setup..."

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "⚠ Warning: jq is not installed. Skipping encryption test."
    echo "  Install jq to enable verification: https://stedolan.github.io/jq/"
else
    # Check if base64 is available
    if ! command -v base64 &> /dev/null; then
        echo "⚠ Warning: base64 is not installed. Skipping encryption test."
    else
        TEST_DATA=$(echo -n "test-123" | base64 2>/dev/null) || {
            echo "⚠ Warning: Failed to encode test data. Skipping verification."
            TEST_DATA=""
        }
        
        if [ -n "$TEST_DATA" ]; then
            ENCRYPTED=$(vault write -format=json transit/encrypt/invisimart-key plaintext=$TEST_DATA 2>/dev/null | jq -r '.data.ciphertext' 2>/dev/null) || {
                echo "❌ Encryption test failed"
                exit 1
            }
            echo "✓ Encryption test passed"

            DECRYPTED=$(vault write -format=json transit/decrypt/invisimart-key ciphertext=$ENCRYPTED 2>/dev/null | jq -r '.data.plaintext' 2>/dev/null | base64 -d 2>/dev/null) || {
                echo "❌ Decryption test failed"
                exit 1
            }
            
            if [ "$DECRYPTED" == "test-123" ]; then
                echo "✓ Decryption test passed"
            else
                echo "❌ Decryption test failed"
                exit 1
            fi
        fi
    fi
fi

echo ""
echo "🎉 Vault setup complete!"
echo ""
echo "⚠ SECURITY WARNING: Keep your Vault token secure!"
echo "   Never commit tokens to version control or share them publicly."
echo ""
echo "To start Invisimart with Vault integration, run:"
echo "  export VAULT_ADDR='$VAULT_ADDR'"
echo "  export VAULT_TOKEN='<your-vault-token>'"
echo "  make up"
echo ""
echo "Or add these to your docker-compose.yml or .env file."
