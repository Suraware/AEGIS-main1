variable "cluster_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

resource "aws_msk_cluster" "kafka" {
  cluster_name           = var.cluster_name
  kafka_version          = "3.6.0"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type = "kafka.m5.large"
    client_subnets = var.subnet_ids
    security_groups = []
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
    }
  }
}

output "bootstrap_brokers_tls" {
  value = aws_msk_cluster.kafka.bootstrap_brokers_tls
}
