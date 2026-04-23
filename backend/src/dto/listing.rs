use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateListingRequest {
    #[validate(length(min = 5, max = 200, message = "title must be 5-200 characters"))]
    pub title: String,
    #[validate(length(min = 10, message = "description must be at least 10 characters"))]
    pub description: String,
    pub price_ron: Option<i64>,
    pub is_negotiable: bool,
    #[validate(length(min = 1, message = "category is required"))]
    pub category: String,
    #[validate(length(min = 1, message = "city is required"))]
    pub city: String,
}

#[derive(Debug, Serialize)]
pub struct ListingResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: String,
    pub price_ron: Option<i64>,
    pub is_negotiable: bool,
    pub category: String,
    pub city: String,
    pub active: bool,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}
