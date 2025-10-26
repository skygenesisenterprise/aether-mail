use diesel::pg::PgConnection;
use diesel::prelude::*;
use crate::config::Config;
use crate::services::api_client::ApiClient;

pub fn establish_connection() -> PgConnection {
    let config = Config::from_env().expect("Failed to load config");
    PgConnection::establish(&config.database_url)
        .expect("Failed to connect to database")
}

pub fn create_api_client() -> ApiClient {
    let config = Config::from_env().expect("Failed to load config");
    // For now, using a placeholder base URL. In production, this should be configurable
    let base_url = std::env::var("EXTERNAL_API_BASE_URL")
        .unwrap_or_else(|_| "https://api.example.com".to_string());

    ApiClient::new(base_url, config.api_access_token)
}