"""Environment configuration and settings management"""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    """Application settings and environment configuration"""

    def __init__(self):
        # API Keys
        self.OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
        self.GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        self.LLAMA_API_KEY: str = os.getenv("LLAMA_API_KEY", "")
        self.ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

        # Database Configuration
        self.DB_USER: Optional[str] = os.getenv("user")
        self.DB_PASSWORD: Optional[str] = os.getenv("password")
        self.DB_HOST: Optional[str] = os.getenv("host")
        self.DB_PORT: Optional[str] = os.getenv("port")
        self.DB_NAME: Optional[str] = os.getenv("dbname")

        # Application Configuration
        self.APP_TITLE: str = "AI Health & Fitness ML Service"
        self.APP_DESCRIPTION: str = "Machine learning service for personalized meal and workout plan generation"
        self.APP_VERSION: str = "2.0.0"
        self.HOST: str = os.getenv("APP_HOST", "0.0.0.0")
        self.PORT: int = int(os.getenv("APP_PORT", "8000"))

        # CORS Configuration
        self.ALLOWED_ORIGINS: list = [
            "http://localhost:5173",
            "https://rsufjeprivwzzygrbvdb.supabase.co",
            "https://greenlean.vercel.app/",
            "*"
        ]

        # Database Pool Configuration
        self.DB_POOL_MIN_SIZE: int = int(os.getenv("DB_POOL_MIN_SIZE", "1"))
        self.DB_POOL_MAX_SIZE: int = int(os.getenv("DB_POOL_MAX_SIZE", "10"))

        # AI Model Configuration
        self.DEFAULT_AI_PROVIDER: str = os.getenv("DEFAULT_AI_PROVIDER", "openai")
        self.DEFAULT_MODEL_NAME: str = os.getenv("DEFAULT_MODEL_NAME", "gpt-4o-mini")
        self.AI_MAX_TOKENS: int = int(os.getenv("AI_MAX_TOKENS", "4000"))
        self.AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", "0.7"))

        # Logging Configuration
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FORMAT: str = os.getenv(
            "LOG_FORMAT",
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )

    @property
    def has_openai(self) -> bool:
        """Check if OpenAI API key is configured"""
        return bool(self.OPENAI_API_KEY)

    @property
    def has_anthropic(self) -> bool:
        """Check if Anthropic API key is configured"""
        return bool(self.ANTHROPIC_API_KEY)

    @property
    def has_gemini(self) -> bool:
        """Check if Gemini API key is configured"""
        return bool(self.GEMINI_API_KEY)

    @property
    def has_llama(self) -> bool:
        """Check if Llama API key is configured"""
        return bool(self.LLAMA_API_KEY)

    @property
    def database_url(self) -> Optional[str]:
        """Get formatted database connection URL"""
        if all([self.DB_USER, self.DB_PASSWORD, self.DB_HOST, self.DB_PORT, self.DB_NAME]):
            return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        return None

    def validate_ai_provider(self, provider: str) -> bool:
        """
        Validate if the requested AI provider is available.

        Args:
            provider: AI provider name

        Returns:
            True if provider is configured and available
        """
        provider_map = {
            "openai": self.has_openai,
            "anthropic": self.has_anthropic,
            "gemini": self.has_gemini,
            "llama": self.has_llama,
        }
        return provider_map.get(provider.lower(), False)


# Global settings instance
settings = Settings()
