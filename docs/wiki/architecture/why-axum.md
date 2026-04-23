# Why Axum

**Decision:** Use Axum 0.7 as the Rust web framework.

**Why:** Axum has the best ecosystem momentum in Rust web today. It's explicit and type-driven — no macro magic hiding behavior. First-class WebSocket support is built in (needed for future real-time messaging). It builds on `tower`/`hyper`, which is the standard async Rust stack, so middleware, timeouts, and tracing are composable without framework-specific wrappers. Compiler errors are clear and the DX is manageable for a mixed-experience Rust team.

**Trade-offs:** More verbose than Rocket for simple cases. The `tower` middleware ecosystem has a learning curve. No built-in ORM or admin panel — everything is assembled manually.

**Context:** Rocket was the main alternative considered. Rejected because of its heavier macro usage and weaker WebSocket story.
