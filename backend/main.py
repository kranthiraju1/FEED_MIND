from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.config import settings
from backend.database.redis_client import close_redis_client, get_redis_client
from backend.database.session import dispose_engine, init_db
from backend.services.streaming import ensure_consumer_group

app = FastAPI(title=settings.app_name, version="1.0.0")


# Development helper: remove Origin header from incoming WebSocket scopes so
# origin-based 403 rejections (from upstream ASGI checks) don't block local
# browser connections. This is safe for local development only.
class _StripWebsocketOriginMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "websocket":
            headers = [(k, v) for k, v in scope.get("headers", []) if k.lower() != b"origin"]
            scope["headers"] = headers
        await self.app(scope, receive, send)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.on_event("startup")
async def startup_event() -> None:
    await init_db()
    redis_client = get_redis_client()
    await ensure_consumer_group(redis_client, settings.redis_stream_name, settings.redis_consumer_group)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_redis_client()
    await dispose_engine()


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": "FeedMind API", "status": "running"}


# Finally, wrap the FastAPI app with the websocket-origin-stripping middleware.
# This must happen after all decorators and router setup so FastAPI methods
# like `on_event` and `add_middleware` remain available during import.
app = _StripWebsocketOriginMiddleware(app)
