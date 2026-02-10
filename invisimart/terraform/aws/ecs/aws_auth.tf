data "aws_caller_identity" "current" {}

#---------------------------------------------------------------------------
# Policy for Cross-Account ECR Access
#----------------------------------------------------------------------------
data "aws_iam_policy_document" "ecr_cross_account_pull" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken"
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage"
    ]
    resources = [
      "arn:aws:ecr:us-west-2:730335318773:repository/invisimart/*",
    ]
  }
}

resource "aws_iam_policy" "ecr_cross_account_pull_policy" {
  name   = "${local.resource_prefix}-ecr-cross-account-pull"
  policy = data.aws_iam_policy_document.ecr_cross_account_pull.json
}
