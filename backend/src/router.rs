use crate::{routes, state::AppState};
use axum::Router;
use tower_http::{
    compression::CompressionLayer,
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};

pub fn build(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .nest("/auth", routes::auth::router())
        .nest("/favorites", routes::favorites::router())
        .nest("/conversations", routes::messaging::router())
        .nest("/listings", routes::listings::router())
        .nest("/me", routes::me::router())
        .route("/me/unread-count", get(crate::handlers::messaging::get_unread_count))
        .nest("/users", routes::users::router())
        .layer(CompressionLayer::new())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
