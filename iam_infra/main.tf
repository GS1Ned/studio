provider "google" {
  project = var.project_id
  region  = var.region
}

# Module for creating service accounts with standard permissions
module "service_account" {
  source   = "./modules/service_account"
  for_each = var.service_accounts

  account_id   = each.key
  display_name = each.value.display_name
  roles        = each.value.roles
}