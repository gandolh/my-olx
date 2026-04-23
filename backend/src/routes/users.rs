use axum::{routing::get, Router};
use crate::{handlers::users, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/me", get(users::me))
}
