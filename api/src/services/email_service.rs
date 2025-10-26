use crate::models::{NewEmail, Email};
use crate::queries;
use diesel::PgConnection;

pub fn send_email(conn: &mut PgConnection, new_email: NewEmail) -> Result<Email, diesel::result::Error> {
    // Ici, on pourrait intégrer avec un service SMTP réel, mais pour l'instant, on sauvegarde juste en DB
    queries::create_email(conn, new_email)
}

pub fn get_emails_for_user(conn: &mut PgConnection, user_id: &str) -> Result<Vec<Email>, diesel::result::Error> {
    // Récupérer tous les emails de l'utilisateur via ses dossiers
    let folders = queries::get_folders_by_user(conn, user_id)?;
    let mut all_emails = Vec::new();
    for folder in folders {
        let emails = queries::get_emails_by_folder(conn, folder.id)?;
        all_emails.extend(emails);
    }
    Ok(all_emails)
}