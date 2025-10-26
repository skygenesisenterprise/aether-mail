use axum::{Json, http::StatusCode, Extension};
use serde::{Deserialize, Serialize};
use diesel::PgConnection;
use crate::models::{NewEmail, Email, EmailResponse, EmailAddress, AttachmentResponse};
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
                .unwrap_or_else(|| "Unknown".to_string())
        }))),
        Err(e) => Ok(Json(serde_json::json!({
            "success": false,
            "error": format!("Failed to fetch emails: {}", e)
        }))),
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
    password: &str,
    host: &str,
    port: u16,
    use_tls: bool,
) -> Result<Vec<EmailResponse>, Box<dyn std::error::Error + Send + Sync>> {
    use std::time::Duration;

    tracing::info!("Fetching emails from IMAP server {}:{} for {}", host, port, email);

    // Pour l'instant, retourner des emails mockés adaptés au domaine
    // TODO: Implémenter la vraie connexion IMAP quand la crate sera stable

    let domain = email.split('@').nth(1).unwrap_or("example.com");
    let now = chrono::Utc::now();

    let mock_emails = vec![
        EmailResponse {
            id: format!("imap-{}-1", email.replace("@", "-")),
            subject: format!("Welcome to {} Mail", domain.split('.').next().unwrap_or("Your")),
            body: format!("<h1>Welcome to {} Mail</h1><p>Your email account is ready.</p>", domain.split('.').next().unwrap_or("Your")),
            from: EmailAddress {
                name: "Welcome Team".to_string(),
                email: format!("welcome@{}", domain),
            },
            to: email.to_string(),
            cc: None,
            bcc: None,
            timestamp: now.to_rfc3339(),
            is_read: false,
            is_starred: false,
            is_encrypted: false,
            has_attachments: false,
            attachments: vec![],
            folder_id: Some(1), // Inbox
        },
        EmailResponse {
            id: format!("imap-{}-2", email.replace("@", "-")),
            subject: "Account Security Notice".to_string(),
            body: "<p>Your account was recently accessed from a new device.</p>".to_string(),
            from: EmailAddress {
                name: "Security Team".to_string(),
                email: format!("noreply@{}", domain),
            },
            to: email.to_string(),
            cc: None,
            bcc: None,
            timestamp: (now - chrono::Duration::hours(2)).to_rfc3339(),
            is_read: false,
            is_starred: false,
            is_encrypted: false,
            has_attachments: false,
            attachments: vec![],
            folder_id: Some(1), // Inbox
        },
        EmailResponse {
            id: format!("imap-{}-3", email.replace("@", "-")),
            subject: "Weekly Updates".to_string(),
            body: "<h2>This week's important updates...</h2>".to_string(),
            from: EmailAddress {
                name: "Newsletter".to_string(),
                email: format!("newsletter@{}", domain),
            },
            to: email.to_string(),
            cc: None,
            bcc: None,
            timestamp: (now - chrono::Duration::hours(6)).to_rfc3339(),
            is_read: true,
            is_starred: false,
            is_encrypted: false,
            has_attachments: true,
            attachments: vec![
                AttachmentResponse {
                    filename: "newsletter.pdf".to_string(),
                    filesize: 2048576, // 2MB
                    filetype: "application/pdf".to_string(),
                }
            ],
            folder_id: Some(1), // Inbox
        },
    ];

    // Simuler un délai réseau réaliste
    tokio::time::sleep(Duration::from_millis(1500)).await;

    Ok(mock_emails)
}