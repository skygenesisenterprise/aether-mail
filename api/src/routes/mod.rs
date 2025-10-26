use axum::{Router, routing::{get, post}};

use crate::controllers;

pub fn create_router() -> Router {
    Router::new()
        .route("/auth/login", post(controllers::auth::login))
        .route("/auth/register", post(controllers::auth::register))
        .route("/auth/sign-out", post(controllers::auth::sign_out))
        .route("/auth/session", get(controllers::auth::session))
        .route("/emails", get(controllers::email::get_emails).post(controllers::email::send_email))
        .route("/inbox", post(controllers::email::get_inbox))
        .route("/folders", get(controllers::folder::get_folders).post(controllers::folder::create_folder))
        .route("/test-imap-login", post(controllers::imap::test_imap_login))
        .route("/providers", get(controllers::imap::get_supported_providers))
        .route("/sky-genesis/domains", get(controllers::imap::get_sky_genesis_domains).post(controllers::imap::add_sky_genesis_domain))
        .route("/v1/register", post(controllers::auth::register_v1))
        .route("/v1/recover", post(controllers::auth::recover))
        .route("/v1/emails/stats", get(controllers::email::get_stats))
}