# Application Configuration Variables
variable "resource_prefix" {
  description = "Prefix for all resources created by this demo. Must be unique within your AWS account and region."
  type        = string
  default     = ""
  validation {
    condition     = length(var.resource_prefix) <= 30 && can(regex("^[a-z0-9-]*$", var.resource_prefix))
    error_message = "Must be 30 characters or less and can only contain lowercase letters, numbers, and hyphens"
  }
}

# Container Images
variable "image_tag" {
  description = "Docker image tag for all services"
  type        = string
  default     = "latest"
}

variable "container_registry" {
  description = "ECR container registry URL"
  type        = string
  default     = "982534354776.dkr.ecr.us-west-2.amazonaws.com"
}

# EC2 Instance Configuration
variable "instance_type" {
  description = "EC2 instance type for running Invisimart"
  type        = string
  default     = "t3.large"
}

variable "key_name" {
  description = "Name of the AWS Key Pair to use for EC2 instance access"
  type        = string
  default     = null
}

# Database Configuration
variable "db_user" {
  description = "Database username"
  type        = string
  default     = "invisimart"
}

variable "db_password" {
  description = "Database password"
  type        = string
  default     = "invisimartpass"
  sensitive   = true
}

variable "db_name" {
  description = "Database name in Postgres"
  type        = string
  default     = "invisimartdb"
}

variable "aws_region" {
  description = "The AWS region to use for the demo."
  type        = string
  default     = "us-west-2"
}

variable "default_aws_tags" {
  description = "Default tags to apply to all AWS resources"
  type        = map(string)
  default     = {}
}

# VPC Configuration
variable "create_vpc" {
  description = "Whether to create a new VPC or use existing VPC resources"
  type        = bool
  default     = true
}

variable "vpc_id" {
  description = "ID of existing VPC to use (required if create_vpc = false)"
  type        = string
  default     = null
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs to use (required if create_vpc = false and use_alb = true)"
  type        = list(string)
  default     = []
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs to use (required if create_vpc = false)"
  type        = list(string)
  default     = []
}

# Load Balancer Configuration
variable "use_alb" {
  description = "Whether to create an Application Load Balancer"
  type        = bool
  default     = true
}

# DNS Configuration
variable "use_route53" {
  description = "Whether to create Route53 DNS records"
  type        = bool
  default     = true
}

variable "aws_route53_zone_name" {
  description = "The name of an *existing* Route 53 zone to use to access the application (required if use_route53 = true)"
  type        = string
  default     = null
}

