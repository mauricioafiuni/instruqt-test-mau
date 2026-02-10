output "app_url" {
  description = "URL for the Invisimart application"
  value       = "http://${aws_route53_record.app_url.fqdn}"
}

output "api_url" {
  description = "URL for the Invisimart API"
  value       = "http://${aws_route53_record.app_url.fqdn}:8080"
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.this.name
}

output "ecs_cluster_id" {
  value = aws_ecs_cluster.this.id
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnets" {
  value = module.vpc.private_subnets
}

output "execution_role_arn" {
  value = aws_iam_role.ecs_task_execution_role.arn
}

output "task_role_arn" {
  value = aws_iam_role.ecs_task_role.arn
}

output "cloudwatch_log_group_name" {
  value = aws_cloudwatch_log_group.invisimart_logs.name
}

output "aws_region" {
  value = var.aws_region
}

output "service_discovery_namespace_id" {
  value = aws_service_discovery_private_dns_namespace.invisimart.id
}

output "route53_zone_name" {
  value = var.aws_route53_zone_name
}

output "service_discovery_namespace" {
  description = "Service discovery namespace for internal communication"
  value       = aws_service_discovery_private_dns_namespace.invisimart.name
}

output "include_database" {
  description = "Whether database service was deployed"
  value       = var.include_database
}

output "database_service" {
  description = "Database service name (if deployed)"
  value       = var.include_database ? module.db_service[0].service_name : null
}

output "maintenance_target_group_arn" {
  description = "ARN of the maintenance service target group"
  value       = aws_alb_target_group.maintenance.arn
}

output "app_alb" {
  description = "ARN of the application load balancer"
  value       = aws_alb.main.arn
}
