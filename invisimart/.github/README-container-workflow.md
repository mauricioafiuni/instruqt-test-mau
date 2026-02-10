# Container Build Workflow Configuration

## Overview
The `build-containers.yml` workflow has been updated to support dev/prod environments with different AWS accounts for container builds and pushes.

## Environment Logic
- **Main Branch and Tags (`v*`)**: Build and push to **BOTH dev AND prod** environments
  - `build-dev` job: Pushes to dev account (configured via `ECR_REGISTRY_DEV`)
  - `build-prod` job: Pushes to prod account (configured via `ECR_REGISTRY_PROD`)
  - Both jobs run in parallel

- **All Other Branches and Pull Requests**: Build and push to **dev environment ONLY**
  - `build-dev` job: Pushes to dev account (configured via `ECR_REGISTRY_DEV`)
  - `build-prod` job: Skipped

## Required GitHub Repository Variables

The workflow expects the following repository variables to be configured:

### Variables
- `AWS_ROLE_ARN_DEV`: AWS IAM role ARN for the dev account
- `AWS_ROLE_ARN_PROD`: AWS IAM role ARN for the prod account
- `ECR_REGISTRY_DEV`: ECR registry URL for dev environment (e.g., `730335318773.dkr.ecr.us-west-2.amazonaws.com`)
- `ECR_REGISTRY_PROD`: ECR registry URL for prod environment (e.g., `982534354776.dkr.ecr.us-west-2.amazonaws.com`)
- `AWS_REGION`: AWS region (typically `us-west-2`)

### Example Configuration
```
AWS_ROLE_ARN_DEV=arn:aws:iam::730335318773:role/invisimart-github-actions-role
AWS_ROLE_ARN_PROD=arn:aws:iam::982534354776:role/invisimart-github-actions-role
ECR_REGISTRY_DEV=730335318773.dkr.ecr.us-west-2.amazonaws.com
ECR_REGISTRY_PROD=982534354776.dkr.ecr.us-west-2.amazonaws.com
AWS_REGION=us-west-2
```

## Image Tagging Strategy

### Main Branch and Tags (pushed to both environments)
**Dev Environment:**
- `invisimart/frontend:main`
- `invisimart/frontend:latest`
- `invisimart/frontend:v1.0.0`

**Prod Environment:**
- `invisimart/frontend:main`
- `invisimart/frontend:latest`
- `invisimart/frontend:v1.0.0`

**Note**: Dev and prod environments use **identical tag names** for the same image builds.

### Feature Branches and Pull Requests (dev only)
- `invisimart/frontend:feature-branch`
- `invisimart/frontend:latest`

## Workflow Jobs

### `build-dev` Job
- **Always runs** for all triggers (branches, tags, PRs)
- Builds and pushes to dev account (via `ECR_REGISTRY_DEV`)
- Uses `AWS_ROLE_ARN_DEV` variable

### `build-prod` Job  
- **Conditionally runs** only for:
  - Pushes to `main` branch
  - Tags matching `v*` pattern
- Builds and pushes to prod account (via `ECR_REGISTRY_PROD`)
- Uses `AWS_ROLE_ARN_PROD` variable

## ECR Repository Requirements

Each AWS account must have the following ECR repositories created:
- `invisimart/frontend`
- `invisimart/api` 
- `invisimart/inventory`
- `invisimart/maintenance`

## IAM Role Permissions

Each IAM role must have permissions for:
- ECR login and push operations
- Access to the specific account's ECR repositories

Example policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "*"
    }
  ]
}
```