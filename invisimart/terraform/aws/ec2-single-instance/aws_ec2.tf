# Get the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# IAM Role for EC2 instance
resource "aws_iam_role" "ec2_role" {
  name = "${local.resource_prefix}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${local.resource_prefix}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# Policy for ECR access
resource "aws_iam_role_policy" "ecr_policy" {
  name = "${local.resource_prefix}-ecr-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}

# User data script to set up Docker and run containers
locals {
  # Determine API URL based on configuration
  api_url = var.use_route53 ? "http://${local.resource_prefix}.${var.aws_route53_zone_name}:8080" : (
    var.use_alb ? "http://${aws_alb.main[0].dns_name}:8080" :
    "NOT_SET_USE_PUBLIC_IP_IN_USER_DATA" # Placeholder, will be set in user_data.sh
  )

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    aws_region         = var.aws_region
    container_registry = var.container_registry
    frontend_image     = local.frontend_image
    api_image          = local.api_image
    inventory_image    = local.inventory_image
    database_image     = local.database_image
    db_user            = var.db_user
    db_password        = var.db_password
    db_name            = var.db_name
    resource_prefix    = local.resource_prefix
    api_url            = local.api_url
  }))
}

# EC2 Instance
resource "aws_instance" "invisimart" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.ec2.id]
  # Use private subnet when ALB is enabled, public subnet when direct access is needed
  subnet_id            = var.use_alb ? local.private_subnet_ids[0] : local.public_subnet_ids[0]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  user_data_base64     = local.user_data
  # Only assign public IP when not using ALB (direct access scenario)
  associate_public_ip_address = !var.use_alb

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "${local.resource_prefix}-instance"
  }

  # Ensure validation checks pass before creating instance
  depends_on = [
    local.validate_existing_vpc,
    local.validate_public_subnets,
    local.validate_private_subnets,
    local.validate_route53_zone
  ]
}
