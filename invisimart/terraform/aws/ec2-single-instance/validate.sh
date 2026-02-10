#!/bin/bash
# Simple validation script for the ec2-single-instance module

set -e

echo "🔍 Validating Terraform configuration..."

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install Terraform first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "terraform.tf" ] || [ ! -f "aws_ec2.tf" ]; then
    echo "❌ Please run this script from the ec2-single-instance module directory"
    exit 1
fi

# Initialize and validate
echo "📦 Initializing Terraform..."
terraform init -backend=false

echo "✅ Validating configuration..."
terraform validate

echo "🎯 Formatting check..."
terraform fmt -check

echo "✅ All checks passed! The configuration is ready for deployment."
echo ""
echo "Next steps:"
echo "1. Copy examples/basic/terraform.tfvars.example to terraform.tfvars"
echo "2. Update the variables in terraform.tfvars with your values"
echo "3. Run 'terraform plan' to review the deployment"
echo "4. Run 'terraform apply' to deploy the infrastructure"
