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
  default     = "inventory"
}

locals {
  container_image = "${var.ecr_registry}/invisimart-${var.service_name}:${var.version}"
}

source "amazon-ebs" "inventory_service" {
  ami_name      = "invisimart-${var.service_name}-${var.version}-${var.timestamp}"
  instance_type = "t3.medium"
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
  sources = ["source.amazon-ebs.inventory_service"]

  # Update system
  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf install -y curl wget unzip"
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

  # Pull the container image
  provisioner "shell" {
    environment_vars = [
      "ECR_REGISTRY=${var.ecr_registry}",
      "AWS_REGION=${var.aws_region}",
      "CONTAINER_IMAGE=${local.container_image}"
    ]
    inline = [
      "# Configure ECR login",
      "aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY",
      "",
      "# Pull the container image",
      "docker pull $CONTAINER_IMAGE"
    ]
  }

  # Configure inventory service
  provisioner "shell" {
    environment_vars = [
      "CONTAINER_IMAGE=${local.container_image}"
    ]
    script = "${path.root}/common/scripts/setup-inventory-service.sh"
  }
}
