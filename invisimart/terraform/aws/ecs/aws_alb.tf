## make sure the target group names are fewer than 32 characters
locals {
  target_group_name_frontend = substr("${local.resource_prefix}-frontend-tg", 0, 32)
  target_group_name_api      = substr("${local.resource_prefix}-api-tg", 0, 32)
  target_group_name_maintenance = substr("${local.resource_prefix}-maintenance-tg", 0, 32)
}

resource "aws_alb" "main" {
  name            = "${local.resource_prefix}-alb"
  subnets         = module.vpc.public_subnets
  security_groups = [aws_security_group.lb.id]
}

# Target Group for Frontend Service
resource "aws_alb_target_group" "frontend" {
  name        = local.target_group_name_frontend
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = "/"
    unhealthy_threshold = "2"
  }
}

# Target Group for API Service
resource "aws_alb_target_group" "api" {
  name        = local.target_group_name_api
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = "/health"
    unhealthy_threshold = "2"
  }
}

# Target Group for Maintenance Mode
resource "aws_alb_target_group" "maintenance" {
  name        = local.target_group_name_maintenance
  port        = 80
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = "/"
    unhealthy_threshold = "2"
  }
}

# Maintenance Listener (Port 8081)
resource "aws_alb_listener" "maintenance" {
  load_balancer_arn = aws_alb.main.id
  port              = "8081"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.maintenance.id
  }
}

# Frontend Listener (Port 80)
resource "aws_alb_listener" "frontend" {
  load_balancer_arn = aws_alb.main.id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.frontend.id
  }
}

# API Listener (Port 8080)
resource "aws_alb_listener" "api" {
  load_balancer_arn = aws_alb.main.id
  port              = "8080"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.api.id
  }
}
