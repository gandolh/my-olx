use crate::{handlers::users, state::AppState};
use axum::{routing::get, Router};

pub fn router() -> Router<AppState> {
    Router::new().route("/me", get(users::me))
}
