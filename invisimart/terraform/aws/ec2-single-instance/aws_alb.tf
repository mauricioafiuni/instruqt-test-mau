# Application Load Balancer
resource "aws_alb" "main" {
  count           = var.use_alb ? 1 : 0
  name            = "${local.resource_prefix}-alb"
  subnets         = local.public_subnet_ids
  security_groups = [aws_security_group.lb[0].id]

  tags = {
    Name = "${local.resource_prefix}-alb"
  }
}

# Target Group for Frontend Service
resource "aws_alb_target_group" "frontend" {
  count       = var.use_alb ? 1 : 0
  name        = local.target_group_name_frontend
  port        = 80
  protocol    = "HTTP"
  vpc_id      = local.vpc_id
  target_type = "instance"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "5"
    path                = "/"
    unhealthy_threshold = "2"
  }

  tags = {
    Name = "${local.target_group_name_frontend}"
  }
}

# Target Group for API Service
resource "aws_alb_target_group" "api" {
  count       = var.use_alb ? 1 : 0
  name        = local.target_group_name_api
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = local.vpc_id
  target_type = "instance"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "5"
    path                = "/health"
    unhealthy_threshold = "2"
  }

  tags = {
    Name = "${local.target_group_name_api}"
  }
}

# Target Group Attachments
resource "aws_alb_target_group_attachment" "frontend" {
  count            = var.use_alb ? 1 : 0
  target_group_arn = aws_alb_target_group.frontend[0].arn
  target_id        = aws_instance.invisimart.id
  port             = 80
}

resource "aws_alb_target_group_attachment" "api" {
  count            = var.use_alb ? 1 : 0
  target_group_arn = aws_alb_target_group.api[0].arn
  target_id        = aws_instance.invisimart.id
  port             = 8080
}

# Frontend Listener (Port 80)
resource "aws_alb_listener" "frontend" {
  count             = var.use_alb ? 1 : 0
  load_balancer_arn = aws_alb.main[0].id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.frontend[0].id
  }
}

# API Listener (Port 8080)
resource "aws_alb_listener" "api" {
  count             = var.use_alb ? 1 : 0
  load_balancer_arn = aws_alb.main[0].id
  port              = "8080"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.api[0].id
  }
}
