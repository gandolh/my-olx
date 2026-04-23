use axum::{
    extract::{Path, Query, State},
    Json,
};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;
use crate::{
    dto::listing::{CreateListingRequest, ListingCardResponse, ListingDetailResponse, ListingFilters, ListingResponse, ListingsPageResponse},
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{listings::PgListingRepository, users::PgUserRepository},
    services::listings::ListingService,
    state::AppState,
};

fn listing_service(state: &AppState) -> ListingService<PgListingRepository, PgUserRepository> {
    let repo = Arc::new(PgListingRepository { pool: state.db.clone() });
    let user_repo = Arc::new(PgUserRepository { pool: state.db.clone() });
    ListingService::new(repo, user_repo, state.config.clone())
}

pub async fn list_public(
    State(state): State<AppState>,
    Query(filters): Query<ListingFilters>,
) -> Result<Json<ListingsPageResponse>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.search(&filters).await?;
    Ok(Json(listings))
}

pub async fn list_featured(
    State(state): State<AppState>,
) -> Result<Json<Vec<ListingCardResponse>>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.featured(8).await?;
    Ok(Json(listings))
}

pub async fn get_listing(
    State(state): State<AppState>,
    auth_user: Option<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingDetailResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.get_detail(id, auth_user.map(|AuthUser(user_id)| user_id)).await?;
    Ok(Json(listing))
}

pub async fn get_related(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<ListingCardResponse>>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.get_related(id).await?;
    Ok(Json(listings))
}

pub async fn create_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<CreateListingRequest>,
) -> Result<Json<ListingResponse>, AppError> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let svc = listing_service(&state);
    let listing = svc.create(user_id, &body).await?;
    Ok(Json(listing))
}

pub async fn list_my_listings(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<Vec<ListingResponse>>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.list_by_user(user_id).await?;
    Ok(Json(listings))
}

pub async fn delete_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let svc = listing_service(&state);
    svc.delete(id, user_id).await?;
    Ok(Json(serde_json::json!({ "deleted": true })))
}
