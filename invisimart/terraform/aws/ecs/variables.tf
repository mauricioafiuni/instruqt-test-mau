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

# Frontend Service Configuration
variable "frontend_cpu" {
  description = "Fargate CPU units for frontend service (1 vCPU = 1024 CPU units)"
  type        = number
  default     = 512
}

variable "frontend_memory" {
  description = "Fargate memory for frontend service (in MiB)"
  type        = number
  default     = 1024
}

variable "frontend_replicas" {
  description = "Number of frontend containers to run"
  type        = number
  default     = 1
}

# API Service Configuration
variable "api_cpu" {
  description = "Fargate CPU units for API service (1 vCPU = 1024 CPU units)"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "Fargate memory for API service (in MiB)"
  type        = number
  default     = 1024
}

variable "api_replicas" {
  description = "Number of API containers to run"
  type        = number
  default     = 1
}

# Inventory Service Configuration
variable "inventory_cpu" {
  description = "Fargate CPU units for inventory service (1 vCPU = 1024 CPU units)"
  type        = number
  default     = 256
}

variable "inventory_memory" {
  description = "Fargate memory for inventory service (in MiB)"
  type        = number
  default     = 512
}

# Database Configuration
variable "db_cpu" {
  description = "Fargate CPU units for database services (1 vCPU = 1024 CPU units)"
  type        = number
  default     = 256
}

variable "db_memory" {
  description = "Fargate memory for database services (in MiB)"
  type        = number
  default     = 512
}

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

variable "aws_route53_zone_name" {
  description = "The name of an *existing* Route 53 zone to use to access the application"
  type        = string
}

variable "include_database" {
  description = "Whether to deploy database resources"
  type        = bool
  default     = true
}

# Maintenance Mode Configuration
variable "maintenance_cpu" {
  description = "Fargate CPU units for maintenance service (1 vCPU = 1024 CPU units)"
  type        = number
  default     = 256
}

variable "maintenance_memory" {
  description = "Fargate memory for maintenance service (in MiB)"
  type        = number
  default     = 512
}

variable "environment" {
  description = "Environment to determine which container images to use (e.g., dev, prod)"
  type        = string
  default     = "dev"
}
