resource "digitalocean_database_cluster" "winnie-db-cluster" {
  name       = "winnie-db"
  engine     = "pg"
  version    = "13"
  size       = "db-s-1vcpu-1gb"
  region     = "ams3"
  node_count = 1
}

resource "digitalocean_database_db" "winnie-db" {
  cluster_id = digitalocean_database_cluster.winnie-db-cluster.id
  name       = "Winnie_DB"
}

resource "digitalocean_database_firewall" "winnie-db-firewall" {
  depends_on = [digitalocean_droplet.winnie-bot]

  cluster_id = digitalocean_database_cluster.winnie-db-cluster.id
  rule {
    type  = "droplet"
    value = digitalocean_droplet.winnie-bot.id
  }
  rule {
    type  = "ip_addr"
    value = var.test_ip_address
  }
}

output "database-connection-uri" {
  value      = digitalocean_database_cluster.winnie-db-cluster.private_uri
  sensitive  = true
}
