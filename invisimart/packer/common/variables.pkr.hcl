# Common variables for all Packer builds
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

variable "base_ami_name" {
  type        = string
  description = "Base AMI name pattern"
  default     = "RHEL-9.*"
}

variable "base_ami_owner" {
  type        = string
  description = "Base AMI owner"
  default     = "309956199498" # Red Hat
}

variable "instance_type" {
  type        = string
  description = "Instance type for building"
  default     = "t3.medium"
}

# Common source configuration
source "amazon-ebs" "rhel9" {
  ami_name      = "invisimart-${var.service_name}-${var.version}-${var.timestamp}"
  instance_type = var.instance_type
  region        = var.aws_region

  source_ami_filter {
    filters = {
      name                = var.base_ami_name
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = [var.base_ami_owner]
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

# Common build steps
build {
  sources = ["source.amazon-ebs.rhel9"]

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

  # Configure systemd services
  provisioner "shell" {
    script = "${path.root}/common/scripts/setup-systemd.sh"
  }
}
