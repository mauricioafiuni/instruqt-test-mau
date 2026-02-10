data "aws_route53_zone" "hosted_zone" {
  name = var.aws_route53_zone_name
}

resource "aws_route53_record" "app_url" {
  allow_overwrite = true
  name            = local.resource_prefix
  records         = [aws_alb.main.dns_name]
  ttl             = 60
  type            = "CNAME"
  zone_id         = data.aws_route53_zone.hosted_zone.zone_id
}
