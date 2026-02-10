package vault

import (
	"fmt"
)

// TokenizeData tokenizes data using Vault Transform engine
func TokenizeData(transformationName, roleName, value string) (string, error) {
	client, err := GetClient()
	if err != nil {
		return "", err
	}

	// Prepare data for tokenization
	data := map[string]interface{}{
		"transformation": transformationName,
		"value":          value,
	}

	// Tokenize using Transform engine
	path := fmt.Sprintf("transform/encode/%s", roleName)
	secret, err := client.Logical().Write(path, data)
	if err != nil {
		return "", fmt.Errorf("unable to tokenize data: %w", err)
	}

	// Extract encoded value (token)
	encodedValue, ok := secret.Data["encoded_value"].(string)
	if !ok {
		return "", fmt.Errorf("encoded_value not found in response")
	}

	return encodedValue, nil
}

// DetokenizeData detokenizes data using Vault Transform engine
func DetokenizeData(transformationName, roleName, token string) (string, error) {
	client, err := GetClient()
	if err != nil {
		return "", err
	}

	// Prepare data for detokenization
	data := map[string]interface{}{
		"transformation": transformationName,
		"value":          token,
	}

	// Detokenize using Transform engine
	path := fmt.Sprintf("transform/decode/%s", roleName)
	secret, err := client.Logical().Write(path, data)
	if err != nil {
		return "", fmt.Errorf("unable to detokenize data: %w", err)
	}

	// Extract decoded value
	decodedValue, ok := secret.Data["decoded_value"].(string)
	if !ok {
		return "", fmt.Errorf("decoded_value not found in response")
	}

	return decodedValue, nil
}

// MaskData masks sensitive data using Vault Transform engine (FPE)
func MaskData(transformationName, roleName, value string) (string, error) {
	client, err := GetClient()
	if err != nil {
		return "", err
	}

	// Prepare data for masking
	data := map[string]interface{}{
		"transformation": transformationName,
		"value":          value,
	}

	// Mask using Transform engine
	path := fmt.Sprintf("transform/encode/%s", roleName)
	secret, err := client.Logical().Write(path, data)
	if err != nil {
		return "", fmt.Errorf("unable to mask data: %w", err)
	}

	// Extract encoded value (masked)
	maskedValue, ok := secret.Data["encoded_value"].(string)
	if !ok {
		return "", fmt.Errorf("encoded_value not found in response")
	}

	return maskedValue, nil
}
