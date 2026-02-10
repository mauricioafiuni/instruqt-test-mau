output "app_url" {
  description = "URL for the Invisimart application"
  value = var.use_route53 && var.use_alb ? "http://${aws_route53_record.app_url[0].fqdn}" : (
    var.use_route53 && !var.use_alb ? "http://${aws_route53_record.app_url_direct[0].fqdn}:3000" : (
      var.use_alb ? "http://${aws_alb.main[0].dns_name}" : "http://${aws_instance.invisimart.public_ip}:3000"
    )
  )
}

output "api_url" {
  description = "URL for the Invisimart API"
  value = var.use_route53 && var.use_alb ? "http://${aws_route53_record.app_url[0].fqdn}:8080" : (
    var.use_route53 && !var.use_alb ? "http://${aws_route53_record.app_url_direct[0].fqdn}:8080" : (
      var.use_alb ? "http://${aws_alb.main[0].dns_name}:8080" : "http://${aws_instance.invisimart.public_ip}:8080"
    )
  )
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.invisimart.id
}

output "instance_private_ip" {
  description = "Private IP address of the EC2 instance"
  value       = aws_instance.invisimart.private_ip
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance (if assigned)"
  value       = aws_instance.invisimart.public_ip
}

output "load_balancer_dns" {
  description = "DNS name of the Application Load Balancer"
  value       = var.use_alb ? aws_alb.main[0].dns_name : null
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = local.vpc_id
}

output "private_subnets" {
  description = "IDs of the private subnets"
  value       = local.private_subnet_ids
}

output "public_subnets" {
  description = "IDs of the public subnets"
  value       = local.public_subnet_ids
}

output "security_group_ec2_id" {
  description = "ID of the EC2 security group"
  value       = aws_security_group.ec2.id
}

output "security_group_lb_id" {
  description = "ID of the load balancer security group"
  value       = var.use_alb ? aws_security_group.lb[0].id : null
}

output "route53_zone_name" {
  description = "Name of the Route53 zone"
  value       = var.aws_route53_zone_name
}

output "resource_prefix" {
  description = "Resource prefix used for naming"
  value       = local.resource_prefix
}

output "use_alb" {
  description = "Whether ALB is being used"
  value       = var.use_alb
}

output "use_route53" {
  description = "Whether Route53 is being used"
  value       = var.use_route53
}

output "create_vpc" {
  description = "Whether VPC was created by this module"
  value       = var.create_vpc
}