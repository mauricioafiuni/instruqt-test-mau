# Invisimart Packer Configuration

This directory contains Packer templates for building Invisimart AMIs on Red Hat Enterprise Linux 9.

## Directory Structure

```
packer/
├── common/
│   ├── variables.pkr.hcl        # Common variables and configuration
│   └── scripts/
│       ├── install-docker.sh   # Docker installation script
│       └── setup-systemd.sh    # Systemd service configuration
├── templates/
│   ├── api-service.pkr.hcl      # API service AMI
│   ├── inventory-service.pkr.hcl # Inventory service AMI
│   ├── frontend-service.pkr.hcl  # Frontend service AMI
│   └── all-in-one.pkr.hcl      # Complete stack AMI
└── README.md                   # This file
```

## AMI Types

### Single-Service AMIs
- **api-service**: Contains only the API service
- **inventory-service**: Contains only the inventory simulator
- **frontend-service**: Contains only the frontend application

### All-in-One AMI
- **all-in-one**: Contains all services plus PostgreSQL databases

## Prerequisites

1. **AWS Credentials**: Configured via IAM role or AWS CLI
2. **ECR Access**: Permissions to pull container images
3. **Packer**: HashiCorp Packer installed
4. **Container Images**: Must exist in ECR before building AMIs

## Building AMIs

### Manual Build

```bash
# Build a specific service AMI
cd packer
packer build \
  -var "version=v1.0.0" \
  -var "timestamp=$(date +%Y%m%d-%H%M%S)" \
  -var "ecr_registry=123456789012.dkr.ecr.us-west-2.amazonaws.com" \
  -var "aws_region=us-west-2" \
  templates/api-service.pkr.hcl

# Build all-in-one AMI
packer build \
  -var "version=v1.0.0" \
  -var "timestamp=$(date +%Y%m%d-%H%M%S)" \
  -var "ecr_registry=123456789012.dkr.ecr.us-west-2.amazonaws.com" \
  -var "aws_region=us-west-2" \
  templates/all-in-one.pkr.hcl
```

### GitHub Actions Build

AMIs are automatically built by GitHub Actions when:
- Container images are successfully built
- New version tags are pushed
- Manual workflow dispatch

## AMI Features

### Base Configuration
- **OS**: Red Hat Enterprise Linux 9
- **Docker**: Latest version with systemd integration
- **AWS CLI**: v2 for ECR authentication
- **ECR Login**: Automatic refresh every 11 hours

### Single-Service AMIs
- Pull specific container image from ECR
- Configure systemd service for the container
- Automatic startup on boot
- Service management scripts

### All-in-One AMI
- Pull all container images from ECR
- Docker Compose configuration for complete stack
- PostgreSQL databases included
- Management scripts for easy operation

## Usage

### Single-Service AMI

```bash
# Start the service (done automatically on boot)
sudo systemctl start invisimart-api

# Check status
sudo systemctl status invisimart-api

# View logs
sudo journalctl -u invisimart-api -f
```

### All-in-One AMI

```bash
# Start complete stack
sudo /opt/invisimart/start-stack.sh

# Check status
/opt/invisimart/status.sh

# Stop stack
sudo /opt/invisimart/stop-stack.sh
```

## Environment Variables

The following environment variables are configured in the systemd services:

### API Service
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

### Inventory Service
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `PURCHASE_INTERVAL`: Purchase simulation interval
- `RESTOCK_INTERVAL`: Restock simulation interval

### Frontend Service
- `API_URL`: API endpoint URL

## Security

### ECR Authentication
- AMIs use IAM instance profiles for ECR access
- ECR login tokens automatically refresh
- No long-lived credentials stored

### Container Security
- Containers run with restart policies
- Resource limits can be configured
- Security groups control network access

## Troubleshooting

### ECR Authentication Issues
```bash
# Manual ECR login
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com

# Check ECR login service
sudo systemctl status ecr-login
sudo journalctl -u ecr-login -f
```

### Container Issues
```bash
# Check container status
docker ps -a

# View container logs
docker logs invisimart-api

# Restart container service
sudo systemctl restart invisimart-api
```

### All-in-One Stack Issues
```bash
# Check docker-compose status
cd /opt/invisimart
docker-compose ps

# View service logs
docker-compose logs api
docker-compose logs frontend
docker-compose logs db
```

## Customization

### Adding New Services
1. Create new Packer template in `templates/`
2. Add service configuration to GitHub Actions matrix
3. Configure systemd service in the template
4. Update documentation

### Modifying Environment Variables
Edit the systemd service configuration in the Packer templates:
```hcl
provisioner "shell" {
  inline = [
    "# Update environment variables in systemd service",
    "sudo sed -i 's/OLD_VALUE/NEW_VALUE/' /etc/systemd/system/invisimart-service.service",
    "sudo systemctl daemon-reload"
  ]
}
```
