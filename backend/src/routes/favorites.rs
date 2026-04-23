use axum::{
    routing::post,
    Router,
};
use crate::{handlers::favorites, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/:listing_id", post(favorites::add_favorite).delete(favorites::remove_favorite))
}
