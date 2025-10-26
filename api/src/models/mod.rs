use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Identifiable, Serialize, Deserialize, Debug)]
#[diesel(table_name = crate::schema::users)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub password: Option<String>,
    pub email_verified: bool,
    pub image: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Serialize, Deserialize, Debug)]
#[diesel(table_name = crate::schema::users)]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub password: Option<String>,
}

#[derive(Queryable, Identifiable, Associations, Serialize, Deserialize, Debug)]
#[diesel(table_name = crate::schema::folders)]
#[diesel(belongs_to(User))]
pub struct Folder {
    pub id: i32,
    pub name: String,
    pub user_id: String,
}

#[derive(Insertable, Serialize, Deserialize, Debug)]
#[diesel(table_name = crate::schema::folders)]
pub struct NewFolder {
    pub name: String,
    pub user_id: String,
}

#[derive(Queryable, Identifiable, Associations, Serialize, Deserialize, Debug)]
#[diesel(table_name = crate::schema::emails)]
#[diesel(belongs_to(Folder))]
#[diesel(belongs_to(User))]
pub struct Email {
    pub id: i32,
    pub subject: String,
    pub body: String,
    pub from: String,
    pub to: String,
    pub cc: Option<String>,
    pub bcc: Option<String>,
    pub sent_at: NaiveDateTime,
    pub folder_id: i32,
    pub user_id: String,
}

#[derive(Insertable, Serialize, Deserialize, Debug)]
#[diesel(table_name = crate::schema::emails)]
pub struct NewEmail {
    pub subject: String,
    pub body: String,
    pub from: String,
    pub to: String,
    pub cc: Option<String>,
    pub bcc: Option<String>,
    pub folder_id: i32,
    pub user_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EmailResponse {
    pub id: String,
    pub subject: String,
    pub body: String,
    pub from: EmailAddress,
    pub to: String,
    pub cc: Option<String>,
    pub bcc: Option<String>,
    pub timestamp: String,
    pub is_read: bool,
    pub is_starred: bool,
    pub is_encrypted: bool,
    pub has_attachments: bool,
    pub attachments: Vec<AttachmentResponse>,
    pub folder_id: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EmailAddress {
    pub name: String,
    pub email: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AttachmentResponse {
    pub filename: String,
    pub filesize: i32,
    pub filetype: String,
}