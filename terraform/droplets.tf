data "digitalocean_ssh_key" "winnie-key" {
  name = "winnie-key"
}

resource "digitalocean_droplet" "winnie-bot" {
  image  = "debian-11-x64"
  name   = "bot"
  region = "ams3"
  size   = "s-1vcpu-1gb"
  ssh_keys = [
    data.digitalocean_ssh_key.lexi.id
  ]
}

resource "digitalocean_firewall" "winnie-bot-firewall" {
  name = "block-port-access"

  droplet_ids = [digitalocean_droplet.winnie-bot.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0"] // TODO: we will need to look at limiting this using the Github Actions API
  }
}

output "droplet-ip-address" {
  value      = digitalocean_droplet.bot.ipv4_address
}