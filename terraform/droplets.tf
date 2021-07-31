data "digitalocean_ssh_key" "winnie-key" {
  name = "winnie-key"
}

resource "digitalocean_droplet" "winnie-bot" {
  image  = "debian-10-x64"
  name   = "bot"
  region = "ams3"
  size   = "s-1vcpu-1gb"
  ssh_keys = [
    data.digitalocean_ssh_key.lexi.id
  ]
}

output "droplet_ip_address" {
  value      = digitalocean_droplet.bot.ipv4_address
}