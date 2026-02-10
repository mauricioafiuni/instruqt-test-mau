# Security Group for Load Balancer
resource "aws_security_group" "lb" {
  count       = var.use_alb ? 1 : 0
  name        = "${local.resource_prefix}-lb-sg"
  description = "Allow HTTP traffic to load balancer"
  vpc_id      = local.vpc_id

  ingress {
    description = "HTTP for frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP for API"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.resource_prefix}-lb-sg"
  }
}

# Security Group for EC2 Instance
resource "aws_security_group" "ec2" {
  name        = "${local.resource_prefix}-ec2-sg"
  description = "Security group for Invisimart EC2 instance"
  vpc_id      = local.vpc_id

  dynamic "ingress" {
    for_each = var.use_alb ? [1] : []
    content {
      description     = "HTTP from ALB for frontend"
      from_port       = 80
      to_port         = 80
      protocol        = "tcp"
      security_groups = [aws_security_group.lb[0].id]
    }
  }

  dynamic "ingress" {
    for_each = var.use_alb ? [1] : []
    content {
      description     = "HTTP from ALB for API"
      from_port       = 8080
      to_port         = 8080
      protocol        = "tcp"
      security_groups = [aws_security_group.lb[0].id]
    }
  }

  dynamic "ingress" {
    for_each = var.use_alb ? [] : [1]
    content {
      description = "HTTP for frontend (direct access)"
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  dynamic "ingress" {
    for_each = var.use_alb ? [] : [1]
    content {
      description = "HTTP for API (direct access)"
      from_port   = 8080
      to_port     = 8080
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.resource_prefix}-ec2-sg"
  }
}
