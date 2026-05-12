from collections.abc import AsyncGenerator

from sqlalchemy import text
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
            await _apply_feedback_posts_schema_updates(connection)
        except Exception:
            # Log error details so startup issues are visible in container logs
            logger.exception("Database initialization failed")


async def _apply_feedback_posts_schema_updates(connection) -> None:
    result = await connection.execute(
        text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'feedback_posts'"
        )
    )
    existing_columns = {row[0] for row in result}

    if "section" not in existing_columns:
        await connection.execute(
            text(
                "ALTER TABLE feedback_posts ADD COLUMN section VARCHAR(10) NOT NULL DEFAULT 'A'"
            )
        )
    if "faculty_name" not in existing_columns:
        await connection.execute(
            text(
                "ALTER TABLE feedback_posts ADD COLUMN faculty_name VARCHAR(255) NOT NULL DEFAULT 'Unknown'"
            )
        )
    if "subject" not in existing_columns:
        await connection.execute(
            text(
                "ALTER TABLE feedback_posts ADD COLUMN subject VARCHAR(120) NOT NULL DEFAULT 'General'"
            )
        )
    if "reported_emotion" not in existing_columns:
        await connection.execute(
            text(
                "ALTER TABLE feedback_posts ADD COLUMN reported_emotion VARCHAR(50) NOT NULL DEFAULT 'neutral'"
            )
        )


async def dispose_engine() -> None:
    await engine.dispose()
