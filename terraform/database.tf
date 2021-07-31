resource "digitalocean_database_cluster" "winnie-db" {
  name       = "winnie-db"
  engine     = "pg"
  version    = "13"
  size       = "db-s-1vcpu-1gb"
  region     = "ams3"
  node_count = 1
}