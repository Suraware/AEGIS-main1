resource "aws_apigatewayv2_api" "aegis_api" {
  name          = "aegis-gw"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id = aws_apigatewayv2_api.aegis_api.id
  name   = "prod"
  auto_deploy = true
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.aegis_api.api_endpoint
}
