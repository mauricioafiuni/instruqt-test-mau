# Service Discovery Service (optional)
resource "aws_service_discovery_service" "this" {
  count = var.enable_service_discovery ? 1 : 0
  name  = var.service_name

  dns_config {
    namespace_id = var.service_discovery_namespace_id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  tags = merge(
    {
      Name = "${var.resource_prefix}-${var.service_name}-discovery"
    },
    var.additional_tags
  )
}
