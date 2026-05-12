from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "FeedMind API"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    frontend_port: int = 3000

    database_url: str = "postgresql+asyncpg://feedmind:feedmind_password@postgres:5432/feedmind_db"
    redis_url: str = "redis://redis:6379/0"
    redis_stream_name: str = "feedback_stream"
    redis_consumer_group: str = "feedmind_workers"
    redis_cache_prefix: str = "feedmind_cache"

    huggingface_model: str = "distilbert-base-uncased-finetuned-sst-2-english"
    emotion_model: str = "j-hartmann/emotion-english-distilroberta-base"
    external_llm_provider: str = "groq"
    external_llm_api_key: str = ""
    external_llm_model: str = "llama-3.1-8b-instant"

    alert_negative_ratio_threshold: float = 0.5
    alert_window_minutes: int = 10
    alert_min_posts: int = 10

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    redis_event_channel: str = "feedmind_notifications"
    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
