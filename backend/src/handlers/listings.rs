use crate::{
    dto::listing::{
        CreateListingRequest, ListingCardResponse, ListingDetailResponse, ListingFilters,
        ListingResponse, ListingsPageResponse, UpdateListingRequest,
    },
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{listings::PgListingRepository, users::PgUserRepository},
    services::listings::ListingService,
    state::AppState,
};
use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Default, Deserialize)]
pub struct MyListingsQuery {
    pub active: Option<bool>,
}

fn listing_service(state: &AppState) -> ListingService<PgListingRepository, PgUserRepository> {
    let repo = Arc::new(PgListingRepository {
        pool: state.db.clone(),
    });
    let user_repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
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
    let listing = svc
        .get_detail(id, auth_user.map(|AuthUser(user_id)| user_id))
        .await?;
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
    if body.active.unwrap_or(true) {
        body.validate()
            .map_err(|e| AppError::Validation(e.to_string()))?;
    }
    let svc = listing_service(&state);
    let listing = svc.create(user_id, &body).await?;
    Ok(Json(listing))
}

pub async fn list_my_listings(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Query(query): Query<MyListingsQuery>,
) -> Result<Json<Vec<ListingResponse>>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.list_by_user(user_id, query.active).await?;
    Ok(Json(listings))
}

pub async fn update_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateListingRequest>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.update(id, user_id, &body).await?;
    Ok(Json(listing))
}

pub async fn renew_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.renew(id, user_id).await?;
    Ok(Json(listing))
}

pub async fn deactivate_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.set_active(id, user_id, false).await?;
    Ok(Json(listing))
}

pub async fn activate_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.set_active(id, user_id, true).await?;
    Ok(Json(listing))
}

pub async fn publish_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.publish(id, user_id).await?;
    Ok(Json(listing))
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
