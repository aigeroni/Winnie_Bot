data "digitalocean_ssh_key" "winnie-key" {
  name = "winnie-key"
}

resource "digitalocean_droplet" "winnie-bot" {
  image  = "debian-11-x64"
  name   = "bot"
  region = "ams3"
  size   = "s-1vcpu-1gb"
  ssh_keys = [
    data.digitalocean_ssh_key.winnie-key.id
  ]
}

resource "digitalocean_firewall" "winnie-bot-firewall" {
  name = "block-port-access"

  droplet_ids = [digitalocean_droplet.winnie-bot.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = [var.runner_ip_address]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = [0.0.0.0/0]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

output "droplet-ip-address" {
  value      = digitalocean_droplet.winnie-bot.ipv4_address
}