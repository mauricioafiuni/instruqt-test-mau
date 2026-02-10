# Service Discovery for Invisimart Application
# Creates private DNS namespace for inter-service communication

locals {
  service_discovery_name = "invisimart.local"
}

resource "aws_service_discovery_private_dns_namespace" "invisimart" {
  name        = local.service_discovery_name
  description = "Private DNS namespace for Invisimart services"
  vpc         = module.vpc.vpc_id

  tags = {
    Name = "${local.resource_prefix}-service-discovery"
  }
}
