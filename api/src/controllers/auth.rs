use axum::{Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use crate::models::NewUser;
use crate::queries;
use crate::services::auth as auth_service;
use tracing;

#[derive(Deserialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    token: String,
}

#[derive(Deserialize)]
pub struct RegisterRequest {
    username: String,
    email: String,
    password: String,
}

pub async fn login(
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    // Pour simplifier, on utilise une connexion DB globale, mais en prod, utiliser un pool
    let mut conn = crate::core::establish_connection();

    let user = queries::get_user_by_email(&mut conn, &payload.email)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    if let Some(hash) = user.password {
        if auth_service::verify_password(&payload.password, &hash).unwrap_or(false) {
            let config = crate::config::Config::from_env().unwrap_or_else(|_| {
                crate::config::Config {
                    database_url: String::new(),
                    jwt_secret: "default-secret".to_string(),
                    api_access_token: String::new(),
                    server_host: String::new(),
                    server_port: 3000,
                    use_test_data: true,
                    custom_mail_servers: std::collections::HashMap::new(),
                }
            });
            let token = auth_service::create_jwt(&user.id, &config.jwt_secret).unwrap();
            Ok(Json(LoginResponse { token }))
        } else {
            Err(StatusCode::UNAUTHORIZED)
        }
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

pub async fn register(
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut conn = crate::core::establish_connection();

    let hashed = auth_service::hash_password(&payload.password).unwrap();
    let new_user = NewUser {
        username: payload.username.clone(),
        email: payload.email.clone(),
        password: Some(hashed),
    };

    queries::create_user(&mut conn, new_user).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "User registered successfully"
    })))
}

#[derive(Deserialize)]
pub struct RegisterV1Request {
    username: String,
    password: String,
}

pub async fn register_v1(
    Json(payload): Json<RegisterV1Request>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut conn = crate::core::establish_connection();

    // Generate email from username
    let email = format!("{}@aethermail.me", payload.username);

    let hashed = auth_service::hash_password(&payload.password).unwrap();
    let new_user = NewUser {
        username: payload.username.clone(),
        email: email.clone(),
        password: Some(hashed),
    };

    queries::create_user(&mut conn, new_user).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Account created successfully"
    })))
}

pub async fn sign_out() -> Result<Json<serde_json::Value>, StatusCode> {
    // In a real implementation, you might invalidate the session/token
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Signed out successfully"
    })))
}

pub async fn session() -> Result<Json<serde_json::Value>, StatusCode> {
    // For now, return a mock session. In production, validate JWT token from header
    Ok(Json(serde_json::json!({
        "user": {
            "id": "mock-user-id",
            "username": "mockuser",
            "email": "mock@example.com",
            "emailVerified": true
        },
        "session": {
            "id": "mock-session-id",
            "expiresAt": "2025-12-31T23:59:59Z",
            "token": "mock-token"
        }
    })))
}

#[derive(Deserialize)]
pub struct RecoverRequest {
    identifier: String,
}

#[derive(Serialize)]
struct RecoveryEmailRequest {
    to: String,
    subject: String,
    body: String,
}

pub async fn recover(
    Json(payload): Json<RecoverRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // In production, you would:
    // 1. Check if user exists in database
    // 2. Generate a reset token
    // 3. Send recovery email via external API

    let api_client = crate::core::create_api_client();

    // Example: Send recovery email via external email service
    let email_request = RecoveryEmailRequest {
        to: payload.identifier.clone(),
        subject: "Password Recovery - Aether Mail".to_string(),
        body: format!("Click here to reset your password: https://aethermail.me/reset?token=demo-token"),
    };

    // This would call an external email service API
    // For now, we'll just log it and return success
    match api_client.post::<RecoveryEmailRequest, serde_json::Value>("/send-email", &email_request).await {
        Ok(_) => {
            tracing::info!("Recovery email sent to: {}", payload.identifier);
        }
        Err(e) => {
            tracing::error!("Failed to send recovery email: {}", e);
            // In production, you might want to return an error or handle this differently
        }
    }

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Recovery instructions sent if account exists"
    })))
}