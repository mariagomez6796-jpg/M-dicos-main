"""
Core configuration module for chat-api
Loads environment variables and provides application settings
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = Field(default="chat-api", env="APP_NAME")
    APP_VERSION: str = Field(default="1.0.0", env="APP_VERSION")
    APP_ENV: str = Field(default="development", env="APP_ENV")
    DEBUG: bool = Field(default=False, env="DEBUG")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8004, env="PORT")
    WORKERS: int = Field(default=4, env="WORKERS")
    
    # Database - MySQL Configuration
    DB_HOST: str = Field(default="localhost", env="DB_HOST")
    DB_PORT: int = Field(default=3306, env="DB_PORT")
    DB_USER: str = Field(default="root", env="DB_USER")
    DB_PASS: str = Field(default="root", env="DB_PASS")
    DB_NAME: str = Field(default="CRUDG", env="DB_NAME")
    DB_POOL_SIZE: int = Field(default=20, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(default=10, env="DB_MAX_OVERFLOW")
    DB_ECHO: bool = Field(default=False, env="DB_ECHO")
    
    # Redis
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    REDIS_POOL_SIZE: int = Field(default=10, env="REDIS_POOL_SIZE")
    
    # JWT Configuration
    JWT_SECRET_KEY: str = Field(env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # WebSocket Configuration
    WEBSOCKET_PING_INTERVAL: int = Field(default=30, env="WEBSOCKET_PING_INTERVAL")
    WEBSOCKET_PING_TIMEOUT: int = Field(default=10, env="WEBSOCKET_PING_TIMEOUT")
    WEBSOCKET_MAX_CONNECTIONS_PER_USER: int = Field(default=5, env="WEBSOCKET_MAX_CONNECTIONS_PER_USER")
    WEBSOCKET_MESSAGE_MAX_SIZE: int = Field(default=10000, env="WEBSOCKET_MESSAGE_MAX_SIZE")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_REQUESTS_PER_MINUTE")
    RATE_LIMIT_BURST: int = Field(default=10, env="RATE_LIMIT_BURST")
    
    # External Services
    APPOINTMENTS_API_URL: str = Field(default="http://localhost:8001", env="APPOINTMENTS_API_URL")
    APPOINTMENTS_API_TIMEOUT: int = Field(default=10, env="APPOINTMENTS_API_TIMEOUT")
    AUTH_SERVICE_URL: str = Field(default="http://localhost:3000", env="AUTH_SERVICE_URL")
    AUTH_SERVICE_TIMEOUT: int = Field(default=5, env="AUTH_SERVICE_TIMEOUT")
    
    # Conversation Configuration
    CONVERSATION_EXPIRY_DAYS: int = Field(default=14, env="CONVERSATION_EXPIRY_DAYS")
    CONVERSATION_CLEANUP_INTERVAL_HOURS: int = Field(default=24, env="CONVERSATION_CLEANUP_INTERVAL_HOURS")
    MESSAGE_RETENTION_DAYS: int = Field(default=365, env="MESSAGE_RETENTION_DAYS")
    
    # File Upload (Future)
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, env="MAX_UPLOAD_SIZE_MB")
    ALLOWED_FILE_TYPES: str = Field(default="jpg,jpeg,png,pdf", env="ALLOWED_FILE_TYPES")
    
    # CORS Configuration
    CORS_ORIGINS: str = Field(default="http://localhost:3000", env="CORS_ORIGINS")
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True, env="CORS_ALLOW_CREDENTIALS")
    CORS_ALLOW_METHODS: str = Field(default="GET,POST,PUT,DELETE,OPTIONS", env="CORS_ALLOW_METHODS")
    CORS_ALLOW_HEADERS: str = Field(default="*", env="CORS_ALLOW_HEADERS")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    SENTRY_ENVIRONMENT: str = Field(default="development", env="SENTRY_ENVIRONMENT")
    SENTRY_TRACES_SAMPLE_RATE: float = Field(default=0.1, env="SENTRY_TRACES_SAMPLE_RATE")
    
    # Health Check
    HEALTH_CHECK_ENABLED: bool = Field(default=True, env="HEALTH_CHECK_ENABLED")
    HEALTH_CHECK_PATH: str = Field(default="/health", env="HEALTH_CHECK_PATH")
    
    # Metrics
    METRICS_ENABLED: bool = Field(default=True, env="METRICS_ENABLED")
    METRICS_PATH: str = Field(default="/metrics", env="METRICS_PATH")
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct MySQL database URL for SQLAlchemy"""
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Construct async MySQL database URL for SQLAlchemy"""
        return f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
    
    @property
    def REDIS_URL(self) -> str:
        """Construct Redis URL"""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def ALLOWED_FILE_TYPES_LIST(self) -> List[str]:
        """Parse allowed file types from comma-separated string"""
        return [ft.strip() for ft in self.ALLOWED_FILE_TYPES.split(",")]
    
    @validator("JWT_SECRET_KEY")
    def validate_jwt_secret(cls, v):
        """Ensure JWT secret is strong enough"""
        if len(v) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters long")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

# Made with Bob
