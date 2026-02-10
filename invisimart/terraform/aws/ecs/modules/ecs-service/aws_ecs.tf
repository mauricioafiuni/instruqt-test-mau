# ECS Task Definition
resource "aws_ecs_task_definition" "this" {
  family                   = "${var.resource_prefix}-${var.service_name}"
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory

  container_definitions = jsonencode([
    {
      name      = var.service_name
      image     = var.container_image
      cpu       = var.cpu
      memory    = var.memory
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = var.container_environment
      secrets     = var.container_secrets

      command = var.container_command

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = var.cloudwatch_log_group_name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = var.service_name
        }
      }
    }
  ])

  tags = merge(
    {
      Name = "${var.resource_prefix}-${var.service_name}-task"
    },
    var.additional_tags
  )
}

# ECS Service
resource "aws_ecs_service" "this" {
  name            = "${var.resource_prefix}-${var.service_name}-service"
  cluster         = var.ecs_cluster_id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.this.id]
    subnets          = var.private_subnets
    assign_public_ip = true
  }

  # Load balancer configuration (optional)
  dynamic "load_balancer" {
    for_each = var.enable_load_balancer ? [1] : []
    content {
      target_group_arn = var.target_group_arn
      container_name   = var.service_name
      container_port   = var.container_port
    }
  }

  # Service discovery configuration (optional)
  dynamic "service_registries" {
    for_each = var.enable_service_discovery ? [1] : []
    content {
      registry_arn = aws_service_discovery_service.this[0].arn
    }
  }

  tags = merge(
    {
      Name = "${var.resource_prefix}-${var.service_name}-service"
    },
    var.additional_tags
  )
}
