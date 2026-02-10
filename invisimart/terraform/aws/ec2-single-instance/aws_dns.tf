data "aws_route53_zone" "hosted_zone" {
  count = var.use_route53 ? 1 : 0
  name  = var.aws_route53_zone_name
}

resource "aws_route53_record" "app_url" {
  count   = var.use_route53 && var.use_alb ? 1 : 0
  zone_id = data.aws_route53_zone.hosted_zone[0].zone_id
  name    = local.resource_prefix
  type    = "A"

  alias {
    name                   = aws_alb.main[0].dns_name
    zone_id                = aws_alb.main[0].zone_id
    evaluate_target_health = true
  }
}

# Create A record pointing to EC2 instance when ALB is not used
resource "aws_route53_record" "app_url_direct" {
  count   = var.use_route53 && !var.use_alb ? 1 : 0
  zone_id = data.aws_route53_zone.hosted_zone[0].zone_id
  name    = local.resource_prefix
  type    = "A"
  ttl     = 300
  records = [aws_instance.invisimart.public_ip]
}