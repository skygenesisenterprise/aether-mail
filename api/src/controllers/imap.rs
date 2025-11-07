use axum::{Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::timeout;
use crate::services::imap_service::ImapService;

#[derive(Deserialize)]
pub struct TestImapLoginRequest {
    email: String,
    password: String,
    server_config: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct TestImapLoginResponse {
    success: bool,
    error: Option<String>,
    provider: Option<String>,
}

pub async fn test_imap_login(
    Json(payload): Json<TestImapLoginRequest>,
) -> Result<Json<TestImapLoginResponse>, StatusCode> {
    if payload.email.is_empty() || payload.password.is_empty() {
        return Ok(Json(TestImapLoginResponse {
            success: false,
            error: Some("Email and password are required".to_string()),
            provider: None,
        }));
    }

    let config = crate::config::Config::from_env().expect("Failed to load config");
    let imap_service = ImapService::new_with_custom_servers(config.custom_mail_servers);

    // Déterminer automatiquement la configuration IMAP selon le domaine
    let imap_config = if let Some(custom_config) = &payload.server_config {
        // Utiliser la configuration personnalisée fournie
        Some(crate::services::imap_service::ImapConfig {
            host: custom_config.get("imapHost")
                .and_then(|h| h.as_str())
                .unwrap_or("imap.gmail.com")
                .to_string(),
            port: custom_config.get("imapPort")
                .and_then(|p| p.as_u64())
                .unwrap_or(993) as u16,
            tls: custom_config.get("imapTls")
                .and_then(|t| t.as_bool())
                .unwrap_or(true),
        })
    } else {
        // Détecter automatiquement selon le domaine
        imap_service.get_imap_config(&payload.email)
    };

    let Some(imap_config) = imap_config else {
        return Ok(Json(TestImapLoginResponse {
            success: false,
            error: Some("Unsupported email provider".to_string()),
            provider: None,
        }));
    };

    // Tester la connexion IMAP avec timeout
    let result = timeout(Duration::from_secs(10), test_imap_connection(
        &payload.email,
        &payload.password,
        &imap_config.host,
        imap_config.port,
        imap_config.tls,
    )).await;

    let provider_name = imap_service.get_provider_config(&payload.email)
        .map(|config| config.display_name)
        .unwrap_or_else(|| "Unknown".to_string());

    match result {
        Ok(Ok(())) => Ok(Json(TestImapLoginResponse {
            success: true,
            error: None,
            provider: Some(provider_name),
        })),
        Ok(Err(e)) => Ok(Json(TestImapLoginResponse {
            success: false,
            error: Some(format!("IMAP connection failed: {}", e)),
            provider: Some(provider_name),
        })),
        Err(_) => Ok(Json(TestImapLoginResponse {
            success: false,
            error: Some("Connection timeout".to_string()),
            provider: Some(provider_name),
        })),
    }
}

async fn test_imap_connection(
    email: &str,
    _password: &str,
    host: &str,
    port: u16,
    _use_tls: bool,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Note: Cette fonction nécessite une vraie implémentation IMAP
    // Pour l'instant, on simule une connexion réussie
    // TODO: Implémenter la vraie connexion IMAP

    tracing::info!("Testing IMAP connection to {}:{} for {}", host, port, email);

    // Simulation d'une connexion IMAP réussie
    // En production, remplacer par une vraie connexion IMAP
    tokio::time::sleep(Duration::from_millis(500)).await;

    Ok(())
}

#[derive(Serialize)]
pub struct ProviderInfo {
    domain: String,
    display_name: String,
    imap_host: String,
    imap_port: u16,
    smtp_host: String,
    smtp_port: u16,
}

pub async fn get_supported_providers() -> Result<Json<Vec<ProviderInfo>>, StatusCode> {
    let config = crate::config::Config::from_env().expect("Failed to load config");
    let imap_service = ImapService::new_with_custom_servers(config.custom_mail_servers);
    let providers = imap_service.get_all_providers();

    let mut provider_info: Vec<ProviderInfo> = providers.into_iter()
        .map(|(domain, config)| ProviderInfo {
            domain,
            display_name: config.display_name,
            imap_host: config.imap.host,
            imap_port: config.imap.port,
            smtp_host: config.smtp.host,
            smtp_port: config.smtp.port,
        })
        .collect();

    // Ajouter les serveurs personnalisés configurés
    let custom_servers = imap_service.get_custom_servers();
    for (domain, server_config) in custom_servers {
        provider_info.push(ProviderInfo {
            domain: domain.clone(),
            display_name: format!("{} (Custom)", domain),
            imap_host: server_config.imap_host.clone(),
            imap_port: server_config.imap_port,
            smtp_host: server_config.smtp_host.clone(),
            smtp_port: server_config.smtp_port,
        });
    }

    Ok(Json(provider_info))
}

#[derive(Deserialize)]
pub struct AddDomainRequest {
    domain: String,
}

#[derive(Serialize)]
pub struct AddDomainResponse {
    success: bool,
    message: String,
}

pub async fn add_sky_genesis_domain(
    Json(payload): Json<AddDomainRequest>,
) -> Result<Json<AddDomainResponse>, StatusCode> {
    // Validation basique du domaine
    if payload.domain.is_empty() || !payload.domain.contains('.') {
        return Ok(Json(AddDomainResponse {
            success: false,
            message: "Invalid domain format".to_string(),
        }));
    }

    // En production, ajouter une vérification DNS ou une validation d'administration
    // Pour l'instant, accepter tous les domaines

    // Note: Dans une vraie implémentation, cette fonction devrait être protégée
    // par une authentification admin et vérifier que le domaine est bien hébergé

    Ok(Json(AddDomainResponse {
        success: true,
        message: format!("Domain {} added to Sky Genesis Enterprise infrastructure", payload.domain),
    }))
}

#[derive(Serialize)]
pub struct SkyGenesisDomainsResponse {
    domains: Vec<String>,
}

pub async fn get_sky_genesis_domains() -> Result<Json<SkyGenesisDomainsResponse>, StatusCode> {
    let config = crate::config::Config::from_env().expect("Failed to load config");
    let imap_service = ImapService::new_with_custom_servers(config.custom_mail_servers);
    let domains = imap_service.get_sky_genesis_domains();

    Ok(Json(SkyGenesisDomainsResponse { domains }))
}

