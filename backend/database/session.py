from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.config import settings
from backend.models.base import Base
from backend.models import feedback  # noqa: F401 - ensure models are registered

engine = create_async_engine(settings.database_url, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as connection:
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Starting database initialization")
        try:
            # show which tables SQLAlchemy knows about (for debugging)
            known = list(Base.metadata.tables.keys())
            logger.info(f"SQLAlchemy knows about tables: {known}")
            await connection.run_sync(Base.metadata.create_all)
            logger.info("Database tables ensured/created successfully")
        except Exception as e:
            # Log error details so startup issues are visible in container logs
            logger.exception("Database initialization failed")


async def dispose_engine() -> None:
    await engine.dispose()
