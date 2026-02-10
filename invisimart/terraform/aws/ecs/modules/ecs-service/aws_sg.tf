# Security Group for the service
resource "aws_security_group" "this" {
  name        = "${var.resource_prefix}-${var.service_name}-sg"
  description = "Security group for ${var.service_name} service"
  vpc_id      = var.vpc_id

  # Dynamic ingress rules
  dynamic "ingress" {
    for_each = var.security_group_ingress_rules
    content {
      from_port       = ingress.value.from_port
      to_port         = ingress.value.to_port
      protocol        = ingress.value.protocol
      cidr_blocks     = ingress.value.cidr_blocks
      security_groups = ingress.value.security_groups
    }
  }

  # Dynamic egress rules
  dynamic "egress" {
    for_each = var.security_group_egress_rules
    content {
      from_port   = egress.value.from_port
      to_port     = egress.value.to_port
      protocol    = egress.value.protocol
      cidr_blocks = egress.value.cidr_blocks
    }
  }

  tags = merge(
    {
      Name = "${var.resource_prefix}-${var.service_name}-sg"
    },
    var.additional_tags
  )
}
