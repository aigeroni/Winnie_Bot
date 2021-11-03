terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "2.3.0"
    }
  }

  backend "remote" {
    hostname = "app.terraform.io"
    organization = "aigeroni"

    workspaces {
      name = "Winnie_Bot"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}
