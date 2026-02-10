
# DNS Record (optional)
resource "aws_route53_record" "this" {
  count           = var.enable_dns_record ? 1 : 0
  allow_overwrite = true
  name            = "${var.service_name}.${var.resource_prefix}"
  records         = ["${var.service_name}.invisimart.local"]
  ttl             = 60
  type            = "CNAME"
  zone_id         = var.aws_route53_zone_id
}
