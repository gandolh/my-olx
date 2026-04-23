use axum::{
    extract::{Path, State},
    Json,
};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;
use crate::{
    dto::listing::{CreateListingRequest, ListingResponse},
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{listings::PgListingRepository, users::PgUserRepository},
    services::listings::ListingService,
    state::AppState,
};

pub async fn create_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<CreateListingRequest>,
) -> Result<Json<ListingResponse>, AppError> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgListingRepository { pool: state.db.clone() });
    let user_repo = Arc::new(PgUserRepository { pool: state.db.clone() });
    let svc = ListingService::new(repo, user_repo);
    let listing = svc.create(user_id, &body).await?;
    Ok(Json(listing))
}

pub async fn list_my_listings(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<Vec<ListingResponse>>, AppError> {
    let repo = Arc::new(PgListingRepository { pool: state.db.clone() });
    let user_repo = Arc::new(PgUserRepository { pool: state.db.clone() });
    let svc = ListingService::new(repo, user_repo);
    let listings = svc.list_by_user(user_id).await?;
    Ok(Json(listings))
}

pub async fn delete_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let repo = Arc::new(PgListingRepository { pool: state.db.clone() });
    let user_repo = Arc::new(PgUserRepository { pool: state.db.clone() });
    let svc = ListingService::new(repo, user_repo);
    svc.delete(id, user_id).await?;
    Ok(Json(serde_json::json!({ "deleted": true })))
}
