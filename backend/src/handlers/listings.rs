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
    repositories::listings::PgListingRepository,
    services::listings::ListingService,
    state::AppState,
};

pub async fn create_listing(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(body): Json<CreateListingRequest>,
) -> Result<Json<ListingResponse>, AppError> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgListingRepository { pool: state.db.clone() });
    let svc = ListingService::new(repo);
    let listing = svc.create(auth.user_id, &body).await?;
    Ok(Json(listing))
}

pub async fn list_my_listings(
    State(state): State<AppState>,
    auth: AuthUser,
) -> Result<Json<Vec<ListingResponse>>, AppError> {
    let repo = Arc::new(PgListingRepository { pool: state.db.clone() });
    let svc = ListingService::new(repo);
    let listings = svc.list_by_user(auth.user_id).await?;
    Ok(Json(listings))
}

pub async fn delete_listing(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let repo = Arc::new(PgListingRepository { pool: state.db.clone() });
    let svc = ListingService::new(repo);
    svc.delete(id, auth.user_id).await?;
    Ok(Json(serde_json::json!({ "deleted": true })))
}
