resource "aws_lambda_function" "ses_notifier" {
  function_name = "aegis-ses-notifier"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "com.healthplatform.lambda.NotificationHandler::handleRequest"
  runtime       = "java21"
  memory_size   = 512
  timeout       = 30

  filename = "lambda_function.jar"

  environment {
    variables = {
      SES_REGION = "us-east-1"
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "aegis-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "ses_policy" {
  name = "aegis-ses-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = "ses:SendEmail"
      Effect   = "Allow"
      Resource = "*"
    }]
  })
}
