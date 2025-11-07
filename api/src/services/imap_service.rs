use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::config::MailServerConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImapConfig {
    pub host: String,
    pub port: u16,
    pub tls: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmtpConfig {
    pub host: String,
    pub port: u16,
    pub secure: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailProviderConfig {
    pub imap: ImapConfig,
    pub smtp: SmtpConfig,
    pub display_name: String,
}

pub struct ImapService {
    providers: HashMap<String, EmailProviderConfig>,
    custom_servers: HashMap<String, MailServerConfig>,
}

impl ImapService {
    pub fn new() -> Self {
        Self::new_with_custom_servers(HashMap::new())
    }

    pub fn new_with_custom_servers(custom_servers: HashMap<String, MailServerConfig>) -> Self {
        let mut providers = HashMap::new();

        // Configuration par défaut pour Sky Genesis Enterprise
        providers.insert("skygenesisenterprise.com".to_string(), EmailProviderConfig {
            imap: ImapConfig {
                host: "mail.skygenesisenterprise.com".to_string(),
                port: 993,
                tls: true,
            },
            smtp: SmtpConfig {
                host: "mail.skygenesisenterprise.com".to_string(),
                port: 587,
                secure: true,
            },
            display_name: "Sky Genesis Enterprise".to_string(),
        });

        // Configuration pour les principaux fournisseurs externes
        providers.insert("gmail.com".to_string(), EmailProviderConfig {
            imap: ImapConfig {
                host: "imap.gmail.com".to_string(),
                port: 993,
                tls: true,
            },
            smtp: SmtpConfig {
                host: "smtp.gmail.com".to_string(),
                port: 587,
                secure: true,
            },
            display_name: "Gmail".to_string(),
        });

        providers.insert("outlook.com".to_string(), EmailProviderConfig {
            imap: ImapConfig {
                host: "outlook.office365.com".to_string(),
                port: 993,
                tls: true,
            },
            smtp: SmtpConfig {
                host: "smtp-mail.outlook.com".to_string(),
                port: 587,
                secure: false,
            },
            display_name: "Outlook".to_string(),
        });

        providers.insert("hotmail.com".to_string(), EmailProviderConfig {
            imap: ImapConfig {
                host: "outlook.office365.com".to_string(),
                port: 993,
                tls: true,
            },
            smtp: SmtpConfig {
                host: "smtp-mail.outlook.com".to_string(),
                port: 587,
                secure: false,
            },
            display_name: "Hotmail".to_string(),
        });

        providers.insert("live.com".to_string(), EmailProviderConfig {
            imap: ImapConfig {
                host: "outlook.office365.com".to_string(),
                port: 993,
                tls: true,
            },
            smtp: SmtpConfig {
                host: "smtp-mail.outlook.com".to_string(),
                port: 587,
                secure: false,
            },
            display_name: "Live".to_string(),
        });

        providers.insert("yahoo.com".to_string(), EmailProviderConfig {
            imap: ImapConfig {
                host: "imap.mail.yahoo.com".to_string(),
                port: 993,
                tls: true,
            },
            smtp: SmtpConfig {
                host: "smtp.mail.yahoo.com".to_string(),
                port: 587,
                secure: true,
            },
            display_name: "Yahoo".to_string(),
        });

        providers.insert("aol.com".to_string(), EmailProviderConfig {
            imap: ImapConfig {
                host: "imap.aol.com".to_string(),
                port: 993,
                tls: true,
            },
            smtp: SmtpConfig {
                host: "smtp.aol.com".to_string(),
                port: 587,
                secure: true,
            },
            display_name: "AOL".to_string(),
        });

        // Configuration générique pour les autres domaines
        providers.insert("*".to_string(), EmailProviderConfig {
            imap: ImapConfig {
                host: "imap.{domain}".to_string(),
                port: 993,
                tls: true,
            },
            smtp: SmtpConfig {
                host: "smtp.{domain}".to_string(),
                port: 587,
                secure: true,
            },
            display_name: "Generic".to_string(),
        });

        Self { providers, custom_servers }
    }

    pub fn get_provider_config(&self, email: &str) -> Option<EmailProviderConfig> {
        let domain = email.split('@').nth(1)?;

        // Chercher d'abord une configuration spécifique pour ce domaine
        if let Some(config) = self.providers.get(domain) {
            return Some(config.clone());
        }

        // Vérifier si c'est un domaine configuré via variables d'environnement
        if let Some(custom_config) = self.custom_servers.get(domain) {
            return Some(EmailProviderConfig {
                imap: crate::services::imap_service::ImapConfig {
                    host: custom_config.imap_host.clone(),
                    port: custom_config.imap_port,
                    tls: custom_config.imap_tls,
                },
                smtp: crate::services::imap_service::SmtpConfig {
                    host: custom_config.smtp_host.clone(),
                    port: custom_config.smtp_port,
                    secure: custom_config.smtp_secure,
                },
                display_name: domain.to_string(),
            });
        }

        // Vérifier si c'est un domaine hébergé sur Sky Genesis Enterprise
        if self.is_sky_genesis_domain(domain) {
            // Utiliser la configuration Sky Genesis Enterprise par défaut
            if let Some(sge_config) = self.providers.get("skygenesisenterprise.com") {
                let mut config = sge_config.clone();
                config.display_name = format!("{} (Sky Genesis)", domain);
                return Some(config);
            }
        }

        // Vérifier s'il y a une configuration par défaut personnalisée
        if let Some(default_config) = self.custom_servers.get("default") {
            return Some(EmailProviderConfig {
                imap: crate::services::imap_service::ImapConfig {
                    host: default_config.imap_host.clone(),
                    port: default_config.imap_port,
                    tls: default_config.imap_tls,
                },
                smtp: crate::services::imap_service::SmtpConfig {
                    host: default_config.smtp_host.clone(),
                    port: default_config.smtp_port,
                    secure: default_config.smtp_secure,
                },
                display_name: domain.to_string(),
            });
        }

        // Sinon, utiliser la configuration générique
        if let Some(generic_config) = self.providers.get("*") {
            let mut config = generic_config.clone();
            config.imap.host = config.imap.host.replace("{domain}", domain);
            config.smtp.host = config.smtp.host.replace("{domain}", domain);
            config.display_name = domain.to_string();
            return Some(config);
        }

        None
    }

    /// Vérifie si un domaine est hébergé sur l'infrastructure Sky Genesis Enterprise
    fn is_sky_genesis_domain(&self, domain: &str) -> bool {
        // Liste des domaines connus comme n'étant PAS hébergés sur SGE
        let external_domains = [
            "gmail.com", "outlook.com", "hotmail.com", "live.com",
            "yahoo.com", "aol.com", "icloud.com", "me.com"
        ];

        // Si ce n'est pas un domaine externe connu, considérer qu'il pourrait être hébergé sur SGE
        !external_domains.contains(&domain) && domain != "*" && domain != "skygenesisenterprise.com"
    }

    pub fn get_imap_config(&self, email: &str) -> Option<ImapConfig> {
        self.get_provider_config(email).map(|config| config.imap)
    }

    pub fn get_smtp_config(&self, email: &str) -> Option<SmtpConfig> {
        self.get_provider_config(email).map(|config| config.smtp)
    }

    pub fn get_all_providers(&self) -> Vec<(String, EmailProviderConfig)> {
        self.providers.iter()
            .filter(|(domain, _)| *domain != "*")
            .map(|(domain, config)| (domain.clone(), config.clone()))
            .collect()
    }

    pub fn add_custom_provider(&mut self, domain: String, config: EmailProviderConfig) {
        self.providers.insert(domain, config);
    }

    /// Ajoute un domaine hébergé sur Sky Genesis Enterprise
    pub fn add_sky_genesis_domain(&mut self, domain: String) {
        let sge_config = self.providers.get("skygenesisenterprise.com")
            .expect("Sky Genesis Enterprise config should exist");

        let mut config = sge_config.clone();
        config.display_name = format!("{} (Sky Genesis)", domain);

        self.providers.insert(domain, config);
    }

    /// Ajoute un serveur personnalisé depuis la configuration
    pub fn add_custom_server(&mut self, domain: String, config: MailServerConfig) {
        self.custom_servers.insert(domain, config);
    }

    /// Retourne la liste des serveurs personnalisés configurés
    pub fn get_custom_servers(&self) -> Vec<(String, &MailServerConfig)> {
        self.custom_servers.iter()
            .filter(|(domain, _)| *domain != "default")
            .map(|(domain, config)| (domain.clone(), config))
            .collect()
    }

    /// Liste tous les domaines hébergés sur Sky Genesis Enterprise
    pub fn get_sky_genesis_domains(&self) -> Vec<String> {
        self.providers.iter()
            .filter(|(domain, config)| {
                *domain != "skygenesisenterprise.com" &&
                config.imap.host == "mail.skygenesisenterprise.com"
            })
            .map(|(domain, _)| domain.clone())
            .collect()
    }
}

impl Default for ImapService {
    fn default() -> Self {
        Self::new()
    }
}