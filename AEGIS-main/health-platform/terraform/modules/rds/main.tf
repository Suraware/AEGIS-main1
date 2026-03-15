variable "db_password" {
  type      = string
  sensitive = true
}

variable "subnet_ids" {
  type = list(string)
}

resource "aws_db_instance" "postgres" {
  identifier           = "aegis-health-db"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  allocated_storage     = 20
  db_name              = "aegis_health"
  username             = "aegis_admin"
  password             = var.db_password
  skip_final_snapshot  = true
  publicly_accessible  = false
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
