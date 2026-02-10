data "aws_availability_zones" "available" {
  filter {
    name   = "zone-type"
    values = ["availability-zone"]
  }
}

module "vpc" {
  source               = "terraform-aws-modules/vpc/aws"
  version              = "6.0.1"
  azs                  = data.aws_availability_zones.available.names
  cidr                 = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_nat_gateway   = true
  single_nat_gateway   = true
  name                 = "${local.resource_prefix}-vpc"
  private_subnets      = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets       = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}
