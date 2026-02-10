variable "service_name" {
  description = "Name of the ECS service"
  type        = string
}

variable "resource_prefix" {
  description = "Prefix for all resources"
  type        = string
}

variable "container_image" {
  description = "Docker image for the container"
  type        = string
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
}

variable "cpu" {
  description = "Fargate CPU units (1 vCPU = 1024 CPU units)"
  type        = number
}

variable "memory" {
  description = "Fargate memory (in MiB)"
  type        = number
}

variable "desired_count" {
  description = "Number of containers to run"
  type        = number
  default     = 1
}

variable "container_environment" {
  description = "Environment variables for the container"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "container_secrets" {
  description = "Environment variables coming from secrets (e.g., SSM Parameter Store)"
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}

variable "container_command" {
  description = "Command to run in the container (optional)"
  type        = list(string)
  default     = null
}

# Infrastructure dependencies
variable "ecs_cluster_id" {
  description = "ECS cluster ID"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnets" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "execution_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
}

variable "task_role_arn" {
  description = "ECS task role ARN"
  type        = string
}

variable "cloudwatch_log_group_name" {
  description = "CloudWatch log group name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

# Security group configuration
variable "security_group_ingress_rules" {
  description = "List of ingress rules for the security group"
  type = list(object({
    from_port       = number
    to_port         = number
    protocol        = string
    cidr_blocks     = optional(list(string))
    security_groups = optional(list(string))
  }))
  default = []
}

variable "security_group_egress_rules" {
  description = "List of egress rules for the security group"
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
  }))
  default = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

# Optional integrations
variable "enable_service_discovery" {
  description = "Enable service discovery registration"
  type        = bool
  default     = false
}

variable "service_discovery_namespace_id" {
  description = "Service discovery namespace ID"
  type        = string
  default     = ""
}

variable "enable_dns_record" {
  description = "Enable Route53 DNS record creation"
  type        = bool
  default     = false
}

variable "aws_route53_zone_id" {
  description = "Route53 zone ID"
  type        = string
  default     = ""
}

variable "enable_load_balancer" {
  description = "Enable load balancer integration"
  type        = bool
  default     = false
}

variable "target_group_arn" {
  description = "Load balancer target group ARN"
  type        = string
  default     = ""
}

variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
