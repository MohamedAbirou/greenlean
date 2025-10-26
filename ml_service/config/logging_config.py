"""Centralized logging configuration"""

import logging
import sys
from typing import Optional


class ColoredFormatter(logging.Formatter):
    """Custom formatter with color coding for different log levels"""

    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with color"""
        log_color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        record.levelname = f"{log_color}{record.levelname}{self.COLORS['RESET']}"
        return super().format(record)


def setup_logging(
    log_level: str = "INFO",
    log_format: Optional[str] = None
) -> logging.Logger:
    """
    Configure application logging with colored output.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Custom log format string

    Returns:
        Configured logger instance
    """
    # Default format if not provided
    if log_format is None:
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Create logger
    logger = logging.getLogger("ml_service")
    logger.setLevel(getattr(logging, log_level.upper()))

    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()

    # Console handler with colored output
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))

    # Use colored formatter
    formatter = ColoredFormatter(
        log_format,
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(console_handler)

    # Prevent propagation to root logger
    logger.propagate = False

    return logger


# Global logger instance
logger = setup_logging()


def log_api_request(
    endpoint: str,
    user_id: str,
    provider: str = "",
    model: str = ""
) -> None:
    """
    Log API request details.

    Args:
        endpoint: API endpoint being called
        user_id: User making the request
        provider: AI provider (if applicable)
        model: AI model (if applicable)
    """
    msg = f"API Request: {endpoint} | User: {user_id}"
    if provider:
        msg += f" | Provider: {provider}"
    if model:
        msg += f" | Model: {model}"
    logger.info(msg)


def log_api_response(
    endpoint: str,
    user_id: str,
    success: bool,
    duration_ms: Optional[float] = None
) -> None:
    """
    Log API response details.

    Args:
        endpoint: API endpoint called
        user_id: User ID
        success: Whether request was successful
        duration_ms: Request duration in milliseconds
    """
    status = "SUCCESS" if success else "FAILED"
    msg = f"API Response: {endpoint} | User: {user_id} | Status: {status}"
    if duration_ms:
        msg += f" | Duration: {duration_ms:.2f}ms"

    if success:
        logger.info(msg)
    else:
        logger.error(msg)


def log_error(
    error: Exception,
    context: str = "",
    user_id: Optional[str] = None
) -> None:
    """
    Log error with context.

    Args:
        error: Exception that occurred
        context: Additional context about the error
        user_id: User ID if applicable
    """
    msg = f"Error: {str(error)}"
    if context:
        msg = f"{context} - {msg}"
    if user_id:
        msg = f"User: {user_id} | {msg}"

    logger.error(msg, exc_info=True)


def log_database_operation(
    operation: str,
    table: str,
    user_id: Optional[str] = None,
    success: bool = True
) -> None:
    """
    Log database operations.

    Args:
        operation: Type of operation (INSERT, UPDATE, SELECT, etc.)
        table: Database table
        user_id: User ID if applicable
        success: Whether operation was successful
    """
    status = "SUCCESS" if success else "FAILED"
    msg = f"Database {operation}: {table} | Status: {status}"
    if user_id:
        msg = f"User: {user_id} | {msg}"

    if success:
        logger.info(msg)
    else:
        logger.error(msg)
