# Configuration for Winnie_Bot's Terraform providers.

terraform {
  # A list of required providers.
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "2.3.0"
    }
  }

  # The Terraform Cloud remote backend.
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "aigeroni"
    workspaces {
      name = "Winnie_Bot"
    }
  }
}

# Provider config for Digital Ocean.
provider "digitalocean" {
  token = var.do_token
}
