use axum::{
    routing::get,
    Router,
};
use crate::{handlers::listings, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(listings::list_public).post(listings::create_listing))
        .route("/featured", get(listings::list_featured))
        .route("/:id", get(listings::get_listing).delete(listings::delete_listing))
        .route("/:id/related", get(listings::get_related))
}
