use diesel::prelude::*;
use crate::models::{User, NewUser, Folder, NewFolder, Email, NewEmail};
use crate::schema::{users, folders, emails};

pub fn create_user(conn: &mut PgConnection, new_user: NewUser) -> QueryResult<User> {
    diesel::insert_into(users::table)
        .values(&new_user)
        .get_result(conn)
}

pub fn get_user_by_id(conn: &mut PgConnection, user_id: &str) -> QueryResult<User> {
    users::table.find(user_id).first(conn)
}

pub fn get_user_by_email(conn: &mut PgConnection, user_email: &str) -> QueryResult<User> {
    users::table.filter(users::email.eq(user_email)).first(conn)
}

pub fn create_folder(conn: &mut PgConnection, new_folder: NewFolder) -> QueryResult<Folder> {
    diesel::insert_into(folders::table)
        .values(&new_folder)
        .get_result(conn)
}

pub fn get_folders_by_user(conn: &mut PgConnection, user_id: &str) -> QueryResult<Vec<Folder>> {
    folders::table.filter(folders::user_id.eq(user_id)).load(conn)
}

pub fn create_email(conn: &mut PgConnection, new_email: NewEmail) -> QueryResult<Email> {
    diesel::insert_into(emails::table)
        .values(&new_email)
        .get_result(conn)
}

pub fn get_emails_by_folder(conn: &mut PgConnection, folder_id: i32) -> QueryResult<Vec<Email>> {
    emails::table.filter(emails::folder_id.eq(folder_id)).load(conn)
}