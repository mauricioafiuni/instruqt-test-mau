# Vault Setup Guide for Invisimart Purchase Flow

This guide explains how to set up HashiCorp Vault to enable the secure purchase flow in Invisimart.

## Overview

Invisimart uses HashiCorp Vault to protect sensitive customer data:
- **Transit Engine**: Encrypts credit card numbers and phone numbers
- **Transform Engine**: Tokenizes/masks sensitive data (optional)

## Prerequisites

- HashiCorp Vault installed (or access to a Vault server)
- Vault CLI configured
- Access to configure Vault policies and secrets engines

## Quick Start

### 1. Start Vault in Development Mode (For Testing)

```bash
vault server -dev
```

This will output a root token. Save this token for configuration.

### 2. Set Environment Variables

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='<your-root-token>'
```

### 3. Enable and Configure Transit Engine

```bash
# Enable Transit secrets engine
vault secrets enable transit

# Create encryption key for Invisimart
vault write -f transit/keys/invisimart-key
```

### 4. Configure Vault for Invisimart API

Update your environment or `.env` file:

```bash
VAULT_ADDR=http://127.0.0.1:8200
VAULT_TOKEN=<your-root-token>
```

### 5. Start Invisimart

```bash
make up
```

## Production Setup

### 1. Enable Transit Engine

```bash
vault secrets enable transit
```

### 2. Create Encryption Key

```bash
# Create a key with automatic rotation
vault write transit/keys/invisimart-key \
    type=aes256-gcm96 \
    auto_rotate_period=30d
```

### 3. Create Vault Policy for Invisimart

Create a policy file `invisimart-policy.hcl`:

```hcl
# Allow encrypting data with the invisimart-key
path "transit/encrypt/invisimart-key" {
  capabilities = ["update"]
}

# Allow decrypting data with the invisimart-key
path "transit/decrypt/invisimart-key" {
  capabilities = ["update"]
}

# Allow reading key information (optional)
path "transit/keys/invisimart-key" {
  capabilities = ["read"]
}
```

Apply the policy:

```bash
vault policy write invisimart invisimart-policy.hcl
```

### 4. Create AppRole for Invisimart API

```bash
# Enable AppRole auth method
vault auth enable approle

# Create role with the invisimart policy
vault write auth/approle/role/invisimart \
    token_policies="invisimart" \
    token_ttl=1h \
    token_max_ttl=24h

# Get Role ID
vault read auth/approle/role/invisimart/role-id

# Generate Secret ID
vault write -f auth/approle/role/invisimart/secret-id
```

### 5. Configure Invisimart API with AppRole

Update your API environment configuration:

```bash
VAULT_ADDR=https://your-vault-server:8200
VAULT_ROLE_ID=<role-id>
VAULT_SECRET_ID=<secret-id>
```

## Optional: Transform Engine Setup

The Transform engine can be used for additional data masking or tokenization.

### Enable and Configure Transform

```bash
# Enable Transform secrets engine
vault secrets enable transform

# Create a transformation for credit card masking
vault write transform/role/invisimart transformations=ccn-masking

# Create a transformation template
vault write transform/transformation/ccn-masking \
    type=fpe \
    template="builtin/creditcardnumber" \
    tweak_source=internal \
    allowed_roles=invisimart
```

## Verify Setup

Test encryption and decryption:

```bash
# Encrypt a test value
vault write transit/encrypt/invisimart-key plaintext=$(echo -n "test-data" | base64)

# Decrypt the value
vault write transit/decrypt/invisimart-key ciphertext="vault:v1:..."
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VAULT_ADDR` | Vault server address | `http://127.0.0.1:8200` |
| `VAULT_TOKEN` | Vault authentication token (dev/root) | `hvs.CAES...` |
| `VAULT_ROLE_ID` | AppRole Role ID (production) | `a1b2c3d4...` |
| `VAULT_SECRET_ID` | AppRole Secret ID (production) | `x1y2z3...` |

## Troubleshooting

### "Vault client not initialized" Error

Make sure `VAULT_ADDR` is set in your environment or docker-compose.yml.

### "Permission Denied" Error

Verify your token/AppRole has the correct policy attached:

```bash
vault token lookup
```

### Connection Refused

Check that Vault server is running and accessible:

```bash
curl $VAULT_ADDR/v1/sys/health
```

## Security Best Practices

1. **Never use `-dev` mode in production** - It stores everything in memory and uses insecure defaults
2. **Use TLS** - Always configure Vault with proper TLS certificates in production
3. **Rotate keys regularly** - Enable automatic key rotation with `auto_rotate_period`
4. **Use AppRole instead of tokens** - Tokens in production should be short-lived
5. **Audit logging** - Enable Vault audit logging to track all access to sensitive data
6. **Least privilege** - Only grant the minimum permissions needed for the API

## Learn More

- [Vault Transit Engine Documentation](https://www.vaultproject.io/docs/secrets/transit)
- [Vault Transform Engine Documentation](https://www.vaultproject.io/docs/secrets/transform)
- [Vault AppRole Authentication](https://www.vaultproject.io/docs/auth/approle)
- [Vault Production Hardening](https://www.vaultproject.io/docs/internals/security)
