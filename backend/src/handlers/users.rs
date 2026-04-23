use axum::{extract::State, Json};
use serde::Serialize;
use crate::{error::AppError, middleware::auth::AuthUser, state::AppState};

#[derive(Serialize)]
pub struct MeResponse {
    pub user_id: String,
}

pub async fn me(
    State(_state): State<AppState>,
    auth: AuthUser,
) -> Result<Json<MeResponse>, AppError> {
    Ok(Json(MeResponse { user_id: auth.user_id.to_string() }))
}
