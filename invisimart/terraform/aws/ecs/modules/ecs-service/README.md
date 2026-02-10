# ECS Service Module

This module creates a complete ECS service with all necessary components including:

- ECS Task Definition
- ECS Service
- Security Group with configurable rules
- Optional Service Discovery registration
- Optional Route53 DNS record
- Optional Application Load Balancer integration

## Usage

### Basic Service (no external dependencies)

```terraform
module "inventory_service" {
  source = "./modules/ecs-service"

  service_name     = "inventory"
  resource_prefix  = local.resource_prefix
  container_image  = var.inventory_image
  container_port   = 8080
  cpu              = var.inventory_cpu
  memory           = var.inventory_memory

  # Infrastructure
  ecs_cluster_id             = aws_ecs_cluster.this.id
  vpc_id                     = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  execution_role_arn        = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn             = aws_iam_role.ecs_task_role.arn
  cloudwatch_log_group_name = aws_cloudwatch_log_group.invisimart_logs.name
  aws_region                = var.aws_region

  container_environment = [
    {
      name  = "SOME_VAR"
      value = "some_value"
    }
  ]
}
```

### Service with Load Balancer

```terraform
module "frontend_service" {
  source = "./modules/ecs-service"

  # ... basic config ...

  enable_load_balancer = true
  target_group_arn     = aws_alb_target_group.frontend.arn

  security_group_ingress_rules = [
    {
      from_port       = 3000
      to_port         = 3000
      protocol        = "tcp"
      security_groups = [aws_security_group.lb.id]
    }
  ]
}
```

### Service with Service Discovery and DNS

```terraform
module "database_service" {
  source = "./modules/ecs-service"

  # ... basic config ...

  enable_service_discovery      = true
  service_discovery_namespace_id = aws_service_discovery_private_dns_namespace.invisimart.id
  enable_dns_record            = true
  route53_zone_id              = data.aws_route53_zone.hosted_zone.zone_id
  route53_zone_name            = var.aws_route53_zone_name

  security_group_ingress_rules = [
    {
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [module.api_service.security_group_id]
    }
  ]
}
```

## Variables

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| service_name | Name of the ECS service | `string` | n/a | yes |
| resource_prefix | Prefix for all resources | `string` | n/a | yes |
| container_image | Docker image for the container | `string` | n/a | yes |
| container_port | Port the container listens on | `number` | n/a | yes |
| cpu | Fargate CPU units | `number` | n/a | yes |
| memory | Fargate memory in MiB | `number` | n/a | yes |
| enable_service_discovery | Enable service discovery | `bool` | `false` | no |
| enable_dns_record | Enable Route53 DNS record | `bool` | `false` | no |
| enable_load_balancer | Enable load balancer integration | `bool` | `false` | no |

## Outputs

| Name | Description |
|------|-------------|
| service_name | Name of the ECS service |
| service_arn | ARN of the ECS service |
| security_group_id | ID of the security group |
| service_endpoint | Service endpoint for internal communication |
| dns_record_fqdn | FQDN of the DNS record (if enabled) |
