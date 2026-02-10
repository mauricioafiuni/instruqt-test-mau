# ALB security Group: Edit to restrict access to the application
resource "aws_security_group" "lb" {
  name        = "${local.resource_prefix}-lb-sg"
  description = "Allows traffic to the ALB"
  vpc_id      = module.vpc.vpc_id

  # Allow HTTP traffic to frontend
  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTP traffic to API
  ingress {
    protocol    = "tcp"
    from_port   = 8080
    to_port     = 8080
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTP traffic to maintenance page 
  ingress {
    protocol    = "tcp"
    from_port   = 8081  
    to_port     = 8081
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.resource_prefix}-lb-sg"
  }
}
