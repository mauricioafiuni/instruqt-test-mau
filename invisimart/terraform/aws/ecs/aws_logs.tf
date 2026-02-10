# Set up CloudWatch group and log stream for all Invisimart services
resource "aws_cloudwatch_log_group" "invisimart_logs" {
  name              = "/ecs/${local.resource_prefix}-invisimart"
  retention_in_days = 30

  tags = {
    Name = "${local.resource_prefix}-logs"
  }
}
