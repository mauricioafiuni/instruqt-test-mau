provider "aws" {
  region = "us-west-2"
}

module "invisimart-aws-ecs" {
  source                = "../"
  aws_route53_zone_name = "justinclayton.sbx.hashidemos.io"
}
