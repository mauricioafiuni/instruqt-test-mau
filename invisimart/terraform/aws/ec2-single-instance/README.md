# Invisimart Single EC2 Instance Deployment

This Terraform module deploys the Invisimart e-commerce application on a single EC2 instance in AWS. It uses the same container images from ECR as the ECS deployment but runs them on a single instance using Docker Compose.

## Architecture

- **Single EC2 Instance**: Runs all Invisimart services as Docker containers
- **Application Load Balancer**: (Optional) Provides external access to frontend (port 80) and API (port 8080)
- **VPC**: Can create new VPC or use existing VPC infrastructure
- **PostgreSQL Database**: Custom Invisimart database container (pre-seeded) running on the same instance
- **Security Groups**: Configured for ALB and EC2 instance access based on deployment options
- **Route53**: (Optional) DNS record for application access

### Deployment Flexibility

The module supports multiple deployment patterns. Look for these variables to customize your deployment:
- var.use_alb: Enable/disable ALB
- var.use_route53: Enable/disable use of Route53 DNS records
- var.create_vpc: Create a new VPC or use existing VPC resources

## Container Images

The module defaults to using container images from CDL's private ECR registry. If you're using a HashiCorp-provided AWS account, you should already have access to pull these images.


## Prerequisites

1. **ECR Access**: The EC2 instance needs access to the ECR registry (handled via IAM role)
2. **AWS Key Pair**: (Optional) For SSH access to the instance
3. **Route53 Hosted Zone**: Required only if `use_route53 = true` (can be disabled for direct IP/DNS access)

## Deployment Options

This module supports several deployment configurations:

### Full Stack with ALB and Route53 (Default)
```terraform
module "invisimart_single_ec2" {
  source = "./terraform/aws/ec2-single-instance"

  resource_prefix        = "demo"
  aws_route53_zone_name  = "example.com"
  use_alb               = true   # default
  use_route53           = true   # default
}
```

### Direct EC2 Access (No ALB, with Route53)
```terraform
module "invisimart_single_ec2" {
  source = "./terraform/aws/ec2-single-instance"

  resource_prefix        = "demo"
  aws_route53_zone_name  = "example.com"
  use_alb               = false
  use_route53           = true
}
```

### Simple IP-based Access (No ALB, No Route53)
```terraform
module "invisimart_single_ec2" {
  source = "./terraform/aws/ec2-single-instance"

  resource_prefix = "demo"
  use_alb        = false
  use_route53    = false
}
```

### Using Existing VPC
```terraform
module "invisimart_single_ec2" {
  source = "./terraform/aws/ec2-single-instance"

  resource_prefix     = "demo"
  create_vpc         = false
  vpc_id            = "vpc-12345678"
  private_subnet_ids = ["subnet-abc123", "subnet-def456"]
  public_subnet_ids  = ["subnet-ghi789", "subnet-jkl012"]  # Required if use_alb = true
}
```

## Usage

### Basic Deployment

```terraform
module "invisimart_single_ec2" {
  source = "./terraform/aws/ec2-single-instance"

  resource_prefix         = "demo"
  aws_route53_zone_name  = "example.com"
  aws_region             = "us-west-2"

  # Optional: SSH access
  key_name = "my-keypair"
}
```

## Variables

### Application Configuration
| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| `resource_prefix` | Prefix for all resources created by this demo | `string` | `""` | no |
| `image_tag` | Docker image tag for all services | `string` | `"latest"` | no |
| `container_registry` | ECR container registry URL | `string` | `"982534354776.dkr.ecr.us-west-2.amazonaws.com"` | no |

### Infrastructure Configuration
| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| `instance_type` | EC2 instance type for running Invisimart | `string` | `"t3.large"` | no |
| `key_name` | Name of the AWS Key Pair to use for EC2 instance access | `string` | `null` | no |
| `aws_region` | The AWS region to use for the demo | `string` | `"us-west-2"` | no |
| `default_aws_tags` | Default tags to apply to all AWS resources | `map(string)` | `{}` | no |

### Database Configuration
| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| `db_user` | Database username | `string` | `"invisimart"` | no |
| `db_password` | Database password | `string` | `"invisimartpass"` | no |
| `db_name` | Database name in Postgres | `string` | `"invisimartdb"` | no |

### Network & DNS Configuration
| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| `create_vpc` | Whether to create a new VPC or use existing VPC resources | `bool` | `true` | no |
| `vpc_id` | ID of existing VPC to use (required if create_vpc = false) | `string` | `null` | conditional* |
| `private_subnet_ids` | List of private subnet IDs to use (required if create_vpc = false and use_alb = true) | `list(string)` | `[]` | conditional* |
| `public_subnet_ids` | List of public subnet IDs to use (required if create_vpc = false) | `list(string)` | `[]` | conditional* |
| `use_alb` | Whether to create an Application Load Balancer | `bool` | `true` | no |
| `use_route53` | Whether to create Route53 DNS records | `bool` | `true` | no |
| `aws_route53_zone_name` | The name of an existing Route 53 zone (required if use_route53 = true) | `string` | `null` | conditional* |

*Conditional requirements:
- `vpc_id` is required when `create_vpc = false`
- `public_subnet_ids` is required when `create_vpc = false`
- `private_subnet_ids` is required when `create_vpc = false` AND `use_alb = true`
- `aws_route53_zone_name` is required when `use_route53 = true`

## Outputs

| Name | Description |
|------|-------------|
| `app_url` | URL for the Invisimart application |
| `api_url` | URL for the Invisimart API |
| `instance_id` | ID of the EC2 instance |
| `instance_private_ip` | Private IP address of the EC2 instance |
| `instance_public_ip` | Public IP address of the EC2 instance (if assigned) |
| `load_balancer_dns` | DNS name of the Application Load Balancer |
| `vpc_id` | ID of the VPC |
| `private_subnets` | IDs of the private subnets |
| `public_subnets` | IDs of the public subnets |
| `security_group_ec2_id` | ID of the EC2 security group |
| `security_group_lb_id` | ID of the load balancer security group |
| `route53_zone_name` | Name of the Route53 zone |
| `resource_prefix` | Resource prefix used for naming |
| `use_alb` | Whether ALB is being used |
| `use_route53` | Whether Route53 is being used |
| `create_vpc` | Whether VPC was created by this module |

## Deployment

1. Clone the repository
2. Navigate to the module directory
3. Initialize Terraform:
   ```bash
   terraform init
   ```
4. Create a `terraform.tfvars` file with your configuration:
   ```hcl
   resource_prefix       = "my-demo"
   aws_route53_zone_name = "example.com"
   aws_region           = "us-west-2"
   key_name            = "my-keypair"
   ```
5. Plan the deployment:
   ```bash
   terraform plan
   ```
6. Apply the configuration:
   ```bash
   terraform apply
   ```

## Accessing the Application

After deployment:
- **Frontend**: Available at `output.app_url`
- **API**: Available at `output.api_url`

## SSH Access

If you provided a `key_name`, you can SSH to the instance:
```bash
ssh -i /path/to/your/keypair.pem ec2-user@<instance_private_ip>
```

Note: You'll need to access through a bastion host or VPN since the instance is in a private subnet.

## Monitoring and Troubleshooting

### Check Application Status

SSH to the instance and run:
```bash
cd /opt/invisimart
docker-compose ps
docker-compose logs
```

### Health Check

The instance includes a health check script:
```bash
/opt/invisimart/health-check.sh
```

### Service Management

The application is managed by systemd:
```bash
sudo systemctl status invisimart
sudo systemctl restart invisimart
sudo systemctl stop invisimart
sudo systemctl start invisimart
```

## Comparison with ECS Deployment

| Feature | Single EC2 | ECS |
|---------|------------|-----|
| **Cost** | Lower (single instance) | Higher (multiple services) |
| **Scaling** | Manual (instance resize) | Automatic (Fargate scaling) |
| **High Availability** | Single point of failure | Multi-AZ deployment |
| **Management** | Direct instance access | Managed by AWS ECS |
| **Complexity** | Simpler setup | More complex architecture |
| **Best For** | Development, demos, small deployments | Production, high-traffic applications |

## Security Considerations

- The EC2 instance is deployed in a private subnet
- Security groups restrict access to necessary ports only
- IAM roles provide minimal required permissions for ECR access
- Consider using AWS Systems Manager Session Manager instead of SSH

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

This will remove all AWS resources created by the module, including the VPC, EC2 instance, load balancer, and associated networking components.
