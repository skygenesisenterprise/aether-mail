use axum::{Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use diesel::PgConnection;
use crate::models::{NewFolder, Folder};
use crate::queries;

#[derive(Deserialize)]
pub struct CreateFolderRequest {
    name: String,
    user_id: String,
}

pub async fn create_folder(
    Json(payload): Json<CreateFolderRequest>,
) -> Result<StatusCode, StatusCode> {
    let mut conn = crate::core::establish_connection();

    let new_folder = NewFolder {
        name: payload.name,
        user_id: payload.user_id,
    };

    queries::create_folder(&mut conn, new_folder).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(StatusCode::CREATED)
}

pub async fn get_folders() -> Result<Json<Vec<Folder>>, StatusCode> {
    let mut conn = crate::core::establish_connection();
    // Hardcode user_id
    let folders = queries::get_folders_by_user(&mut conn, "user_id").unwrap_or_default();
    Ok(Json(folders))
}