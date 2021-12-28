# Terraform resources for the Winnie_Bot database.

/**
 * The cluster on which the database is hosted.
 * Currently the smallest cluster that Digital Ocean offers,
 * running Postgres 13 in AMS3 (Amsterdam).
 */
resource "digitalocean_database_cluster" "winnie-db-cluster" {
  name       = "winnie-db"
  engine     = "pg"
  version    = "13"
  size       = "db-s-1vcpu-1gb"
  region     = "ams3"
  node_count = 1
}

/**
 * The Winnie database within the cluster.
 */
resource "digitalocean_database_db" "winnie-db" {
  cluster_id = digitalocean_database_cluster.winnie-db-cluster.id
  name       = "Winnie_DB"
}

/**
 * Database firewall rules.
 * These rules are two-way; we don't need both inbound and outbound.
 */
resource "digitalocean_database_firewall" "winnie-db-firewall" {
  depends_on = [digitalocean_droplet.winnie-bot]

  # Winnie's Digital Ocean droplet
  cluster_id = digitalocean_database_cluster.winnie-db-cluster.id
  rule {
    type  = "droplet"
    value = digitalocean_droplet.winnie-bot.id
  }
  # The Redash server that we use for manual queries
  rule {
    type  = "ip_addr"
    value = var.redash_ip_address
  }
}

/**
 * A private database connection URI.
 * Github Actions uses this to set up a database connection from
 * the Winnie code.  It's only usable from within Digital Ocean.
 */
output "database-connection-uri" {
  value      = digitalocean_database_cluster.winnie-db-cluster.private_uri
  sensitive  = true
}
