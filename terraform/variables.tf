# Variables for the Winnie_Bot Terraform configuration.

/**
 * An API token for Digital Ocean.
 * Stored in Github Secrets.
 */
variable "do_token" {}

/**
 * The API address of the Redash server used for manual queries.
 * Stored in Github Secrets.
 */
variable "redash_ip_address" {}

/**
 * The IP address of the CI/CD agent.
 * Pulled from the agent at runtime.
 */
variable "runner_ip_address" {}