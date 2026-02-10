output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.this.name
}

output "service_arn" {
  description = "ARN of the ECS service"
  value       = aws_ecs_service.this.id
}

output "service_id" {
  description = "ID of the ECS service"
  value       = aws_ecs_service.this.id
}

output "task_definition_arn" {
  description = "ARN of the task definition"
  value       = aws_ecs_task_definition.this.arn
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.this.id
}

output "service_discovery_arn" {
  description = "ARN of the service discovery service (if enabled)"
  value       = var.enable_service_discovery ? aws_service_discovery_service.this[0].arn : null
}

output "service_discovery_name" {
  description = "Name used for service discovery"
  value       = var.enable_service_discovery ? "${var.service_name}.invisimart.local" : null
}

output "dns_record_fqdn" {
  description = "FQDN of the DNS record (if enabled)"
  value       = var.enable_dns_record ? aws_route53_record.this[0].fqdn : null
}

output "service_endpoint" {
  description = "Service endpoint for internal communication"
  value = var.enable_service_discovery ? (
    var.enable_dns_record ?
    aws_route53_record.this[0].fqdn :
    "${var.service_name}.invisimart.local"
  ) : null
}

output "container_port" {
  description = "Port the container listens on"
  value       = var.container_port
}
