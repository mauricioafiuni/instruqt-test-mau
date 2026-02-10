packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "version" {
  type        = string
  description = "Version tag for the AMI"
}

variable "timestamp" {
  type        = string
  description = "Build timestamp"
}

variable "ecr_registry" {
  type        = string
  description = "ECR registry URL"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-west-2"
}

variable "service_name" {
  type        = string
  description = "Service name"
  default     = "all-in-one"
}

locals {
  api_image       = "${var.ecr_registry}/invisimart-api:${var.version}"
  inventory_image = "${var.ecr_registry}/invisimart-inventory:${var.version}"
  frontend_image  = "${var.ecr_registry}/invisimart-frontend:${var.version}"
}

source "amazon-ebs" "all_in_one" {
  ami_name      = "invisimart-${var.service_name}-${var.version}-${var.timestamp}"
  instance_type = "t3.large"  # Larger instance for all services
  region        = var.aws_region

  source_ami_filter {
    filters = {
      name                = "RHEL-9.*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["309956199498"] # Red Hat
  }

  ssh_username = "ec2-user"

  tags = {
    Name        = "invisimart-${var.service_name}-${var.version}"
    Version     = var.version
    Timestamp   = var.timestamp
    Service     = var.service_name
    Project     = "invisimart"
    Environment = "demo"
  }
}

build {
  sources = ["source.amazon-ebs.all_in_one"]

  # Update system
  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf install -y curl wget unzip postgresql postgresql-server"
    ]
  }

  # Install Docker
  provisioner "shell" {
    script = "${path.root}/common/scripts/install-docker.sh"
  }

  # Configure base systemd services (ECR login)
  provisioner "shell" {
    script = "${path.root}/common/scripts/setup-base.sh"
  }

  # Pull all container images
  provisioner "shell" {
    environment_vars = [
      "ECR_REGISTRY=${var.ecr_registry}",
      "AWS_REGION=${var.aws_region}",
      "API_IMAGE=${local.api_image}",
      "INVENTORY_IMAGE=${local.inventory_image}",
      "FRONTEND_IMAGE=${local.frontend_image}"
    ]
    inline = [
      "# Configure ECR login",
      "aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY",
      "",
      "# Pull all container images",
      "docker pull $API_IMAGE",
      "docker pull $INVENTORY_IMAGE",
      "docker pull $FRONTEND_IMAGE"
    ]
  }

  # Copy and modify docker-compose configuration
  provisioner "file" {
    source      = "${path.root}/../docker-compose.yml"
    destination = "/tmp/docker-compose.yml"
  }

  # Configure the complete stack service
  provisioner "shell" {
    environment_vars = [
      "ECR_REGISTRY=${var.ecr_registry}",
      "VERSION=${var.version}"
    ]
    script = "${path.root}/common/scripts/setup-stack-service.sh"
  }

  # Create README for the AMI
  provisioner "shell" {
    environment_vars = [
      "VERSION=${var.version}"
    ]
    inline = [
      "sudo tee /opt/invisimart/README.md << EOF",
      "# Invisimart All-in-One AMI",
      "",
      "This AMI contains the complete Invisimart stack with all services.",
      "",
      "## Version",
      "- AMI Version: $VERSION",
      "- Built: $(date)",
      "",
      "## Services Included",
      "- Frontend (Next.js) - Port 8000",
      "- API (Go) - Port 8080",
      "- Inventory Simulator (Go)",
      "- PostgreSQL Database - Port 5432",
      "- Inventory Database - Port 5433",
      "",
      "## Quick Start",
      "\\`\\`\\`bash",
      "# Start the complete stack",
      "sudo /opt/invisimart/start-stack.sh",
      "",
      "# Check status",
      "/opt/invisimart/status.sh",
      "",
      "# Stop the stack",
      "sudo /opt/invisimart/stop-stack.sh",
      "\\`\\`\\`",
      "",
      "## Access URLs",
      "- Frontend: http://\\$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000",
      "- API: http://\\$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080",
      "",
      "## Manual Management",
      "\\`\\`\\`bash",
      "# Using systemd",
      "sudo systemctl start invisimart-stack",
      "sudo systemctl stop invisimart-stack",
      "sudo systemctl status invisimart-stack",
      "",
      "# Using docker-compose directly",
      "cd /opt/invisimart",
      "docker-compose up -d",
      "docker-compose down",
      "docker-compose ps",
      "\\`\\`\\`",
      "EOF"
    ]
  }
}
