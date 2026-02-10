# Example using existing VPC infrastructure
module "invisimart_ec2_existing_vpc" {
  source = "../.."

  resource_prefix = "existing-vpc-demo"

  # Use existing VPC
  create_vpc            = false
  vpc_id                = var.vpc_id
  private_subnet_ids    = var.private_subnet_ids
  public_subnet_ids     = var.public_subnet_ids
  aws_route53_zone_name = var.aws_route53_zone_name
  key_name              = var.key_name # Optional SSH access
}

output "app_url" {
  value = module.invisimart_ec2_existing_vpc.app_url
}

output "api_url" {
  value = module.invisimart_ec2_existing_vpc.api_url
}
