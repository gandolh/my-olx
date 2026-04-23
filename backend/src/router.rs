use axum::Router;
use tower_http::{
    compression::CompressionLayer,
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use crate::{routes, state::AppState};

pub fn build(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .nest("/auth", routes::auth::router())
        .nest("/favorites", routes::favorites::router())
        .nest("/listings", routes::listings::router())
        .nest("/me", routes::me::router())
        .nest("/users", routes::users::router())
        .layer(CompressionLayer::new())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
