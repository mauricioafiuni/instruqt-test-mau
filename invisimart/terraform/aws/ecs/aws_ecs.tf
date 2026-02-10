resource "aws_ecs_cluster" "this" {
  name = local.resource_prefix

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${local.resource_prefix}-ecs-cluster"
  }
}

# Frontend Service
module "frontend_service" {
  source = "./modules/ecs-service"

  service_name    = "frontend"
  resource_prefix = local.resource_prefix
  container_image = "${local.ecr_registry}/invisimart/frontend:${var.image_tag}"
  container_port  = 3000
  cpu             = var.frontend_cpu
  memory          = var.frontend_memory
  desired_count   = var.frontend_replicas

  # Infrastructure dependencies
  ecs_cluster_id            = aws_ecs_cluster.this.id
  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  execution_role_arn        = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn             = aws_iam_role.ecs_task_role.arn
  cloudwatch_log_group_name = aws_cloudwatch_log_group.invisimart_logs.name
  aws_region                = var.aws_region

  # Load balancer integration
  enable_load_balancer = true
  target_group_arn     = aws_alb_target_group.frontend.id

  # Security group configuration
  security_group_ingress_rules = [
    {
      from_port       = 3000
      to_port         = 3000
      protocol        = "tcp"
      security_groups = [aws_security_group.lb.id]
    }
  ]

  # Environment variables
  container_environment = [
    {
      name  = "API_URL"
      value = "http://${aws_route53_record.app_url.fqdn}:8080"
    },
    {
      name  = "NODE_ENV"
      value = "production"
    }
  ]

  depends_on = [aws_alb_listener.frontend, aws_iam_role_policy_attachment.ecs-task-execution-role-policy-attachment]

  # DNS
  enable_dns_record   = true
  aws_route53_zone_id = data.aws_route53_zone.hosted_zone.id
}

# API Service
module "api_service" {
  source = "./modules/ecs-service"

  service_name    = "api"
  resource_prefix = local.resource_prefix
  container_image = "${local.ecr_registry}/invisimart/api:${var.image_tag}"
  container_port  = 8080
  cpu             = var.api_cpu
  memory          = var.api_memory
  desired_count   = var.api_replicas

  # Infrastructure dependencies
  ecs_cluster_id            = aws_ecs_cluster.this.id
  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  execution_role_arn        = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn             = aws_iam_role.ecs_task_role.arn
  cloudwatch_log_group_name = aws_cloudwatch_log_group.invisimart_logs.name
  aws_region                = var.aws_region

  # Load balancer and service discovery
  enable_load_balancer           = true
  target_group_arn               = aws_alb_target_group.api.id
  enable_service_discovery       = true
  service_discovery_namespace_id = aws_service_discovery_private_dns_namespace.invisimart.id

  # Security group configuration
  security_group_ingress_rules = [
    {
      from_port       = 8080
      to_port         = 8080
      protocol        = "tcp"
      security_groups = [aws_security_group.lb.id]
    }
  ]

  # Environment variables
  container_environment = local.api_environment
  container_secrets     = local.api_secrets

  depends_on = [aws_alb_listener.api, aws_iam_role_policy_attachment.ecs-task-execution-role-policy-attachment]

  # DNS
  enable_dns_record   = true
  aws_route53_zone_id = data.aws_route53_zone.hosted_zone.id
}

# Inventory Service
module "inventory_service" {
  source = "./modules/ecs-service"

  service_name    = "inventory"
  resource_prefix = local.resource_prefix
  container_image = "${local.ecr_registry}/invisimart/inventory:${var.image_tag}"
  container_port  = 8080
  cpu             = var.inventory_cpu
  memory          = var.inventory_memory
  desired_count   = 1

  # Infrastructure dependencies
  ecs_cluster_id            = aws_ecs_cluster.this.id
  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  execution_role_arn        = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn             = aws_iam_role.ecs_task_role.arn
  cloudwatch_log_group_name = aws_cloudwatch_log_group.invisimart_logs.name
  aws_region                = var.aws_region

  # Service discovery only
  enable_service_discovery       = true
  service_discovery_namespace_id = aws_service_discovery_private_dns_namespace.invisimart.id

  # Environment variables
  container_environment = local.inventory_environment
  container_secrets     = local.inventory_secrets

  depends_on = [aws_iam_role_policy_attachment.ecs-task-execution-role-policy-attachment]

  # DNS
  enable_dns_record   = true
  aws_route53_zone_id = data.aws_route53_zone.hosted_zone.id
}

# Database ECS Service
module "db_service" {
  count  = var.include_database ? 1 : 0
  source = "./modules/ecs-service"

  service_name    = "db"
  resource_prefix = local.resource_prefix
  container_image = "${local.ecr_registry}/invisimart/database:${var.image_tag}"
  container_port  = 5432
  cpu             = var.db_cpu
  memory          = var.db_memory
  desired_count   = 1

  # Infrastructure dependencies
  ecs_cluster_id            = aws_ecs_cluster.this.id
  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  execution_role_arn        = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn             = aws_iam_role.ecs_task_role.arn
  cloudwatch_log_group_name = aws_cloudwatch_log_group.invisimart_logs.name
  aws_region                = var.aws_region

  # Service discovery and DNS
  enable_service_discovery       = true
  service_discovery_namespace_id = aws_service_discovery_private_dns_namespace.invisimart.id
  enable_dns_record              = true
  aws_route53_zone_id            = data.aws_route53_zone.hosted_zone.id

  # Security group configuration (access rules handled separately)
  security_group_ingress_rules = []

  # PostgreSQL environment and initialization
  container_environment = [
    {
      name  = "POSTGRES_USER"
      value = var.db_user
    },
    {
      name  = "POSTGRES_PASSWORD"
      value = var.db_password
    },
    {
      name  = "POSTGRES_DB"
      value = var.db_name
    },
    {
      name  = "POSTGRES_INITDB_ARGS"
      value = "--encoding=UTF8 --locale=en_US.utf8"
    }
  ]

  depends_on = [aws_iam_role_policy_attachment.ecs-task-execution-role-policy-attachment]
}

# Maintenance Mode Page
module "maintenance_mode" {
  source = "./modules/ecs-service"

  service_name    = "maintenance"
  resource_prefix = local.resource_prefix
  container_image = "${local.ecr_registry}/invisimart/maintenance:${var.image_tag}"
  container_port  = 80
  cpu             = var.maintenance_cpu
  memory          = var.maintenance_memory
  desired_count   = 1

  # Infrastructure dependencies
  ecs_cluster_id            = aws_ecs_cluster.this.id
  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  execution_role_arn        = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn             = aws_iam_role.ecs_task_role.arn
  cloudwatch_log_group_name = aws_cloudwatch_log_group.invisimart_logs.name
  aws_region                = var.aws_region

  # Load balancer and service discovery
  enable_load_balancer           = true
  target_group_arn               = aws_alb_target_group.maintenance.id
  enable_service_discovery       = true
  service_discovery_namespace_id = aws_service_discovery_private_dns_namespace.invisimart.id

  # Environment variables
  container_environment = local.inventory_environment

  depends_on = [aws_iam_role_policy_attachment.ecs-task-execution-role-policy-attachment]

  # DNS
  enable_dns_record   = true
  aws_route53_zone_id = data.aws_route53_zone.hosted_zone.id
}
