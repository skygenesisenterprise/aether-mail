mod config;
mod controllers;
mod core;
mod middlewares;
mod models;
mod queries;
mod routes;
mod services;
mod test;
mod utils;
mod schema;

use axum::Router;
use tower_http::cors::CorsLayer;
use tracing_subscriber;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .merge(routes::create_router())
        .layer(CorsLayer::permissive());

    let config = config::Config::from_env().expect("Failed to load config");
    let addr = format!("{}:{}", config.server_host, config.server_port);

    println!("Server running on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
