from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    redis_url: str = "redis://redis:6379/0"
    redis_stream_name: str = "feedback_stream"
    redis_consumer_group: str = "feedmind_workers"
    
    alert_negative_ratio_threshold: float = 0.5
    alert_window_minutes: int = 10
    alert_min_posts: int = 10
    
    log_level: str = "INFO"


settings = Settings()
