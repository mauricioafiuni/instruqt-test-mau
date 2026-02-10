# SSM Parameters for database (only when include_database = true)
resource "aws_ssm_parameter" "db_config" {
  for_each = var.include_database ? {
    host     = module.db_service[0].dns_record_fqdn
    port     = "5432"
    name     = var.db_name
    user     = var.db_user
    password = var.db_password
  } : {}

  name  = "/invisimart/${local.resource_prefix}/db/${each.key}"
  type  = "String"
  value = each.value

  tags = {
    App = local.resource_prefix
  }
}
