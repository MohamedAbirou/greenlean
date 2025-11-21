"""
In-Memory Cache for AI Responses
Reduces OpenAI API costs by caching responses for similar quiz answers
"""

import hashlib
import json
import time
from typing import Any, Dict, Optional
from datetime import datetime, timedelta


class ResponseCache:
    """Simple in-memory cache with TTL for AI responses"""

    def __init__(self, ttl_hours: int = 24):
        """
        Initialize cache with time-to-live

        Args:
            ttl_hours: How long to cache responses (default: 24 hours)
        """
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_hours * 3600

    def _generate_key(self, quiz_answers: Dict[str, Any], plan_type: str) -> str:
        """
        Generate cache key from quiz answers

        Args:
            quiz_answers: User's quiz answers
            plan_type: 'meal' or 'workout'

        Returns:
            MD5 hash of normalized quiz data
        """
        # Normalize quiz data (sort keys, convert to JSON)
        normalized = json.dumps(
            {
                "plan_type": plan_type,
                "answers": dict(sorted(quiz_answers.items())),
            },
            sort_keys=True,
            default=str,
        )

        # Generate hash
        return hashlib.md5(normalized.encode()).hexdigest()

    def get(self, quiz_answers: Dict[str, Any], plan_type: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached response if available and not expired

        Args:
            quiz_answers: User's quiz answers
            plan_type: 'meal' or 'workout'

        Returns:
            Cached response or None if not found/expired
        """
        key = self._generate_key(quiz_answers, plan_type)

        if key not in self.cache:
            return None

        cached_item = self.cache[key]

        # Check if expired
        if time.time() > cached_item["expires_at"]:
            # Remove expired item
            del self.cache[key]
            return None

        # Update hit count
        cached_item["hits"] += 1
        cached_item["last_accessed"] = time.time()

        return cached_item["data"]

    def set(
        self, quiz_answers: Dict[str, Any], plan_type: str, response: Dict[str, Any]
    ) -> str:
        """
        Store response in cache

        Args:
            quiz_answers: User's quiz answers
            plan_type: 'meal' or 'workout'
            response: AI-generated response to cache

        Returns:
            Cache key
        """
        key = self._generate_key(quiz_answers, plan_type)

        self.cache[key] = {
            "data": response,
            "created_at": time.time(),
            "expires_at": time.time() + self.ttl_seconds,
            "hits": 0,
            "last_accessed": time.time(),
            "plan_type": plan_type,
        }

        return key

    def invalidate(self, quiz_answers: Dict[str, Any], plan_type: str) -> bool:
        """
        Remove specific item from cache

        Args:
            quiz_answers: User's quiz answers
            plan_type: 'meal' or 'workout'

        Returns:
            True if item was removed, False if not found
        """
        key = self._generate_key(quiz_answers, plan_type)

        if key in self.cache:
            del self.cache[key]
            return True

        return False

    def clear(self):
        """Clear all cached items"""
        self.cache.clear()

    def cleanup_expired(self):
        """Remove all expired items from cache"""
        current_time = time.time()
        expired_keys = [
            key for key, item in self.cache.items() if current_time > item["expires_at"]
        ]

        for key in expired_keys:
            del self.cache[key]

        return len(expired_keys)

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics

        Returns:
            Dictionary with cache stats
        """
        self.cleanup_expired()

        total_items = len(self.cache)
        total_hits = sum(item["hits"] for item in self.cache.values())
        meal_plans = sum(1 for item in self.cache.values() if item["plan_type"] == "meal")
        workout_plans = sum(1 for item in self.cache.values() if item["plan_type"] == "workout")

        # Calculate memory usage (rough estimate)
        memory_bytes = sum(
            len(json.dumps(item["data"], default=str).encode())
            for item in self.cache.values()
        )
        memory_mb = memory_bytes / (1024 * 1024)

        return {
            "total_items": total_items,
            "meal_plans": meal_plans,
            "workout_plans": workout_plans,
            "total_hits": total_hits,
            "memory_mb": round(memory_mb, 2),
            "avg_hits_per_item": round(total_hits / total_items, 2) if total_items > 0 else 0,
        }


# Global cache instance (24-hour TTL)
response_cache = ResponseCache(ttl_hours=24)


# Convenience functions
def get_cached_response(quiz_answers: Dict[str, Any], plan_type: str) -> Optional[Dict[str, Any]]:
    """Get cached AI response"""
    return response_cache.get(quiz_answers, plan_type)


def cache_response(quiz_answers: Dict[str, Any], plan_type: str, response: Dict[str, Any]) -> str:
    """Cache AI response"""
    return response_cache.set(quiz_answers, plan_type, response)


def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    return response_cache.get_stats()


def cleanup_cache():
    """Clean up expired cache entries"""
    return response_cache.cleanup_expired()
