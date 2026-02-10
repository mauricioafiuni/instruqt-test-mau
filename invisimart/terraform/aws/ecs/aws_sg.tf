# Security group rule to allow inventory service to access API
resource "aws_security_group_rule" "inventory_to_api" {
  type                     = "ingress"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  source_security_group_id = module.inventory_service.security_group_id
  security_group_id        = module.api_service.security_group_id
}

# Security group rules for database access (conditional)
resource "aws_security_group_rule" "api_to_db" {
  count                    = var.include_database ? 1 : 0
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = module.api_service.security_group_id
  security_group_id        = module.db_service[0].security_group_id
}



resource "aws_security_group_rule" "alb_to_maintenance" {
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.lb.id
  security_group_id        = module.maintenance_mode.security_group_id
}
