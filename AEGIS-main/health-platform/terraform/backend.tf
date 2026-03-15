terraform {
  backend "s3" {
    bucket         = "aegis-terraform-state"
    key            = "state/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "aegis-lock-table"
    encrypt        = true
  }
}
