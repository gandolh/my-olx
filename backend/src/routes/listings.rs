use axum::{
    routing::{delete, get, post},
    Router,
};
use crate::{handlers::listings, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(listings::create_listing).get(listings::list_my_listings))
        .route("/:id", delete(listings::delete_listing))
}
