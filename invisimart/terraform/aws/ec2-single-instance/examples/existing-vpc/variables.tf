variable "key_name" {
  description = "The name of the key pair to use for SSH access"
  type        = string
  default     = null
}

variable "aws_route53_zone_name" {
  description = "The Route53 hosted zone name to create a record in (requires use_route53 = true)"
  type        = string
  default     = null
}

variable "vpc_id" {
  description = "The ID of the existing VPC to deploy resources into (requires create_vpc = false)"
  type        = string
  default     = null
}

variable "private_subnet_ids" {
  description = "A list of private subnet IDs in the existing VPC (requires create_vpc = false)"
  type        = list(string)
  default     = []
}

variable "public_subnet_ids" {
  description = "A list of public subnet IDs in the existing VPC (requires create_vpc = false)"
  type        = list(string)
  default     = []
}
