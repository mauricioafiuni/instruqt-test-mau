package vault

import (
	"encoding/base64"
	"fmt"
)

// EncryptData encrypts data using Vault Transit engine
func EncryptData(keyName string, plaintext string) (string, error) {
	client, err := GetClient()
	if err != nil {
		return "", err
	}

	// Encode plaintext to base64
	encodedPlaintext := base64.StdEncoding.EncodeToString([]byte(plaintext))

	// Prepare data for encryption
	data := map[string]interface{}{
		"plaintext": encodedPlaintext,
	}

	// Encrypt using Transit engine
	path := fmt.Sprintf("transit/encrypt/%s", keyName)
	secret, err := client.Logical().Write(path, data)
	if err != nil {
		return "", fmt.Errorf("unable to encrypt data: %w", err)
	}

	// Extract ciphertext
	ciphertext, ok := secret.Data["ciphertext"].(string)
	if !ok {
		return "", fmt.Errorf("ciphertext not found in response")
	}

	return ciphertext, nil
}

// DecryptData decrypts data using Vault Transit engine
func DecryptData(keyName string, ciphertext string) (string, error) {
	client, err := GetClient()
	if err != nil {
		return "", err
	}

	// Prepare data for decryption
	data := map[string]interface{}{
		"ciphertext": ciphertext,
	}

	// Decrypt using Transit engine
	path := fmt.Sprintf("transit/decrypt/%s", keyName)
	secret, err := client.Logical().Write(path, data)
	if err != nil {
		return "", fmt.Errorf("unable to decrypt data: %w", err)
	}

	// Extract plaintext
	encodedPlaintext, ok := secret.Data["plaintext"].(string)
	if !ok {
		return "", fmt.Errorf("plaintext not found in response")
	}

	// Decode from base64
	plaintext, err := base64.StdEncoding.DecodeString(encodedPlaintext)
	if err != nil {
		return "", fmt.Errorf("unable to decode plaintext: %w", err)
	}

	return string(plaintext), nil
}
