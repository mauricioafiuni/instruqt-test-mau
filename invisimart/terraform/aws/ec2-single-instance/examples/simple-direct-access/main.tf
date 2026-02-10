# Example using EC2 only, no ALB, no Route53 (direct access)
module "invisimart_direct_access" {
  source = "../.."

  resource_prefix = "ec2-direct-access"

  # Use created VPC but no ALB or Route53
  create_vpc  = true
  use_alb     = false
  use_route53 = false

  # Optional SSH access
  key_name = var.key_name # Replace with your key pair name
}

output "app_url" {
  value = module.invisimart_direct_access.app_url
}

output "api_url" {
  value = module.invisimart_direct_access.api_url
}
