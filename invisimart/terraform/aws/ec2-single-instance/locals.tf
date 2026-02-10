data "aws_caller_identity" "current" {}

locals {
  resource_prefix = var.resource_prefix != "" ? var.resource_prefix : "invisimart-${random_string.identifier.result}"

  # Container images from ECR (updated registry)
  frontend_image  = "${var.container_registry}/invisimart/frontend:${var.image_tag}"
  api_image       = "${var.container_registry}/invisimart/api:${var.image_tag}"
  inventory_image = "${var.container_registry}/invisimart/inventory:${var.image_tag}"
  database_image  = "${var.container_registry}/invisimart/database:${var.image_tag}"

  # VPC and subnet configuration
  vpc_id             = var.create_vpc ? module.vpc[0].vpc_id : var.vpc_id
  private_subnet_ids = var.create_vpc ? module.vpc[0].private_subnets : var.private_subnet_ids
  public_subnet_ids  = var.create_vpc ? module.vpc[0].public_subnets : var.public_subnet_ids

  # Validation for existing VPC scenario
  # These will cause plan-time errors with clear messages if requirements aren't met
  validate_existing_vpc = !var.create_vpc ? (
    var.vpc_id != null ? true : tobool("vpc_id is required when create_vpc = false")
  ) : true

  validate_public_subnets = !var.create_vpc ? (
    length(var.public_subnet_ids) > 0 ? true : tobool("public_subnet_ids is required when create_vpc = false")
  ) : true

  validate_private_subnets = !var.create_vpc && var.use_alb ? (
    length(var.private_subnet_ids) > 0 ? true : tobool("private_subnet_ids is required when create_vpc = false and use_alb = true")
  ) : true

  validate_route53_zone = var.use_route53 ? (
    var.aws_route53_zone_name != null ? true : tobool("aws_route53_zone_name is required when use_route53 = true")
  ) : true

  # Target group names (max 32 chars)
  target_group_name_frontend = substr("${local.resource_prefix}-frontend-tg", 0, 32)
  target_group_name_api      = substr("${local.resource_prefix}-api-tg", 0, 32)
}

resource "random_string" "identifier" {
  length  = 4
  special = false
  numeric = false
  upper   = false
}
