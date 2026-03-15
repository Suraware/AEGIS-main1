module "eks" {
  source          = "./modules/eks"
  cluster_name    = "health-platform-cluster"
  cluster_version = "1.29"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      desired_size = 2
      min_size     = 1
      max_size     = 4
      instance_types = ["t3.medium"]
    }
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "health-db"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  allocated_storage     = 20
  db_name              = "health_db"
  username             = "admin"
  password             = var.db_password
  skip_final_snapshot  = true
  vpc_security_group_ids = [aws_security_group.db.id]
}
