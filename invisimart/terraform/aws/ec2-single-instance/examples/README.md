# Invisimart Single EC2 Instance Example

This example demonstrates how to deploy Invisimart on a single EC2 instance.

## Usage

1. Copy this example to a new directory:
   ```bash
   cp -r examples/basic ./my-deployment
   cd my-deployment
   ```

2. Update the variables in `terraform.tfvars`:
   ```hcl
   resource_prefix       = "my-demo"
   aws_route53_zone_name = "your-domain.com"
   aws_region           = "us-west-2"
   key_name            = "your-keypair"  # Optional, for SSH access
   ```

3. Initialize and apply:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

4. Access the application at:
   - Frontend: `output.app_url` (e.g., `http://my-demo.your-domain.com`)
   - API: `output.api_url` (e.g., `http://my-demo.your-domain.com:8080`)

## Clean Up

```bash
terraform destroy
```
