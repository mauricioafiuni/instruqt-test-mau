locals {
  resource_prefix = var.resource_prefix != "" ? var.resource_prefix : "invisimart-${random_string.identifier.result}"

  # ARN construction for SSM parameters (decoupled from Terraform resources)

  ssm_parameter_prefix = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/invisimart/${local.resource_prefix}"

  wwtfo_demo_platform_aws_accounts = {
    dev  = "730335318773"
    prod = "982534354776"
  }

  ecr_registry = "${local.wwtfo_demo_platform_aws_accounts[var.environment]}.dkr.ecr.us-west-2.amazonaws.com" # TODO: region replication at the ECR level

  # API environment - static config only
  api_environment = [
    { name = "PORT", value = "8080" }
  ]

  # API secrets - database config via SSM
  api_secrets = [
    { name = "DB_HOST", valueFrom = "${local.ssm_parameter_prefix}/db/host" },
    { name = "DB_PORT", valueFrom = "${local.ssm_parameter_prefix}/db/port" },
    { name = "DB_NAME", valueFrom = "${local.ssm_parameter_prefix}/db/name" },
    { name = "DB_USER", valueFrom = "${local.ssm_parameter_prefix}/db/user" },
    { name = "DB_PASSWORD", valueFrom = "${local.ssm_parameter_prefix}/db/password" }
  ]

  # Inventory Simulator environment - static config
  inventory_environment = [
    { name = "PURCHASE_INTERVAL", value = "2s" },
    { name = "RESTOCK_INTERVAL", value = "10s" }
  ]

  # Inventory Simulator secrets - database config via SSM
  inventory_secrets = [
    { name = "DB_HOST", valueFrom = "${local.ssm_parameter_prefix}/db/host" },
    { name = "DB_PORT", valueFrom = "${local.ssm_parameter_prefix}/db/port" },
    { name = "DB_NAME", valueFrom = "${local.ssm_parameter_prefix}/db/name" },
    { name = "DB_USER", valueFrom = "${local.ssm_parameter_prefix}/db/user" },
    { name = "DB_PASSWORD", valueFrom = "${local.ssm_parameter_prefix}/db/password" }
  ]

}

resource "random_string" "identifier" {
  length  = 4
  special = false
  numeric = false
  upper   = false
}
