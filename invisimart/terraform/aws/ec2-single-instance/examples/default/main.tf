# Example using Single EC2 instance
# fronted by an ALB
# and assigned a DNS record in Route53

module "invisimart_ec2" {
  source = "../.."

  # create_vpc  = true (default)
  # use_alb     = true (default)
  # use_route53 = true (default)
  aws_route53_zone_name = var.aws_route53_zone_name # Replace with your domain

  # Optional SSH access
  key_name = var.key_name # Replace with your key pair name
}

output "app_url" {
  description = "Access the app at this URL (using public IP)"
  value       = module.invisimart_ec2.app_url
}

output "api_url" {
  description = "Access the API at this URL (using public IP)"
  value       = module.invisimart_ec2.api_url
}
