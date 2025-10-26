use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
    body::Body,
};
use crate::services::auth;

pub async fn auth_middleware(req: Request<Body>, next: Next) -> Result<Response, StatusCode> {
    // Simple auth check, extract token from header
    if let Some(auth_header) = req.headers().get("authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                if auth::verify_jwt(token, "secret").is_ok() {
                    return Ok(next.run(req).await);
                }
            }
        }
    }
    Err(StatusCode::UNAUTHORIZED)
}