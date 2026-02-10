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
