use axum::{Json, http::StatusCode};
use serde::Deserialize;
use std::fs;
use crate::models::{NewEmail, Email, EmailResponse};
use crate::services::email_service;

#[derive(Deserialize)]
pub struct SendEmailRequest {
    subject: String,
    body: String,
    to: String,
    folder_id: i32,
    user_id: String,
}

pub async fn send_email(
    Json(payload): Json<SendEmailRequest>,
) -> Result<StatusCode, StatusCode> {
    let mut conn = crate::core::establish_connection();

    let new_email = NewEmail {
        subject: payload.subject,
        body: payload.body,
        from: "user@example.com".to_string(), // À remplacer par l'utilisateur connecté
        to: payload.to,
        cc: None,
        bcc: None,
        folder_id: payload.folder_id,
        user_id: payload.user_id,
    };

    email_service::send_email(&mut conn, new_email).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(StatusCode::CREATED)
}

pub async fn get_emails() -> Result<Json<Vec<Email>>, StatusCode> {
    let mut conn = crate::core::establish_connection();
    // Pour simplifier, on hardcode un user_id
    let emails = email_service::get_emails_for_user(&mut conn, "user_id").unwrap_or_default();
    Ok(Json(emails))
}

#[derive(Deserialize)]
pub struct InboxRequest {
    imap_config: serde_json::Value, // IMAP configuration
}

pub async fn get_inbox(
    Json(payload): Json<InboxRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // Extract IMAP config
    let email = payload.imap_config.get("imapUser")
        .and_then(|u| u.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let password = payload.imap_config.get("imapPass")
        .and_then(|p| p.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?;

    // Charger la configuration pour déterminer si on utilise les données de test
    let config = match crate::config::Config::from_env() {
        Ok(config) => config,
        Err(_) => {
            return Ok(Json(serde_json::json!({
                "success": false,
                "error": "Configuration error"
            })));
        }
    };

    if config.use_test_data {
        // Mode test : charger les données depuis le fichier JSON
        match fetch_emails_from_imap(email, password, "", 0, false).await {
            Ok(mails) => Ok(Json(serde_json::json!({
                "success": true,
                "mails": mails,
                "provider": "Test Data",
                "mode": "test"
            }))),
            Err(e) => Ok(Json(serde_json::json!({
                "success": false,
                "error": format!("Failed to load test emails: {}", e)
            }))),
        }
    } else {
        // Mode production : connexion IMAP réelle
        let imap_service = crate::services::imap_service::ImapService::new();

        // Déterminer automatiquement la configuration IMAP selon le domaine
        let imap_config = if payload.imap_config.get("imapHost").is_some() {
            // Utiliser la configuration personnalisée fournie
            Some(crate::services::imap_service::ImapConfig {
                host: payload.imap_config.get("imapHost")
                    .and_then(|h| h.as_str())
                    .unwrap_or("imap.gmail.com")
                    .to_string(),
                port: payload.imap_config.get("imapPort")
                    .and_then(|p| p.as_u64())
                    .unwrap_or(993) as u16,
                tls: payload.imap_config.get("imapTls")
                    .and_then(|t| t.as_bool())
                    .unwrap_or(true),
            })
        } else {
            // Détecter automatiquement selon le domaine
            imap_service.get_imap_config(email)
        };

        let Some(imap_config) = imap_config else {
            return Ok(Json(serde_json::json!({
                "success": false,
                "error": "Unsupported email provider"
            })));
        };

        // Fetch emails from IMAP
        match fetch_emails_from_imap(email, password, &imap_config.host, imap_config.port, imap_config.tls).await {
            Ok(mails) => Ok(Json(serde_json::json!({
                "success": true,
                "mails": mails,
                "provider": imap_service.get_provider_config(email)
                    .map(|config| config.display_name)
                    .unwrap_or_else(|| "Unknown".to_string()),
                "mode": "production"
            }))),
            Err(e) => Ok(Json(serde_json::json!({
                "success": false,
                "error": format!("Failed to fetch emails: {}", e)
            }))),
        }
    }
}



pub async fn get_stats() -> Result<Json<serde_json::Value>, StatusCode> {
    // Mock email statistics
    Ok(Json(serde_json::json!({
        "folders": {
            "inbox": { "total": 10, "unread": 3 },
            "sent": { "total": 5, "unread": 0 },
            "trash": { "total": 2, "unread": 0 }
        }
    })))
}

async fn fetch_emails_from_imap(
    email: &str,
    _password: &str,
    _host: &str,
    _port: u16,
    _use_tls: bool,
) -> Result<Vec<EmailResponse>, Box<dyn std::error::Error + Send + Sync>> {
    use std::time::Duration;

    tracing::info!("Loading test emails for {}", email);

    // Charger les emails de test depuis le fichier JSON
    // En production, cette fonction sera remplacée par une vraie connexion IMAP
    let test_data_path = "api/test-data/emails.json";

    let emails: Vec<EmailResponse> = match fs::read_to_string(test_data_path) {
        Ok(content) => {
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse test emails JSON: {}", e))?
        }
        Err(_) => {
            tracing::warn!("Test data file not found, returning empty list");
            vec![]
        }
    };

    // Simuler un délai réseau réaliste
    tokio::time::sleep(Duration::from_millis(800)).await;

    Ok(emails)
}