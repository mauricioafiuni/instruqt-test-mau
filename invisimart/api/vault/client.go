package vault

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"os"

	vault "github.com/hashicorp/vault/api"
)

var client *vault.Client

// InitVault initializes the Vault client with configuration from environment variables
func InitVault() error {
	config := vault.DefaultConfig()

	vaultAddr := os.Getenv("VAULT_ADDR")
	if vaultAddr != "" {
		config.Address = vaultAddr
	}

	var err error
	client, err = vault.NewClient(config)
	if err != nil {
		return fmt.Errorf("unable to initialize Vault client: %w", err)
	}

	// Set token from environment variable if available
	vaultToken := os.Getenv("VAULT_TOKEN")
	if vaultToken != "" {
		client.SetToken(vaultToken)
	}

	return nil
}

// GetClient returns the initialized Vault client
func GetClient() (*vault.Client, error) {
	if client == nil {
		return nil, fmt.Errorf("vault client not initialized")
	}
	return client, nil
}

// IsAvailable checks if Vault client is available and configured
func IsAvailable() bool {
	return client != nil && os.Getenv("VAULT_ADDR") != ""
}

// MockEncrypt provides a mock encryption for when Vault is not available
// This uses a simple hash for demonstration purposes only
func MockEncrypt(plaintext string) string {
	hash := sha256.Sum256([]byte(plaintext))
	return fmt.Sprintf("mock:v1:%s", base64.StdEncoding.EncodeToString(hash[:]))
}
