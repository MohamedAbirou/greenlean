# ml_service/services/ai_service.py

"""AI service for interacting with multiple AI providers with retry logic and validation"""

import json
import logging
from typing import Dict, Any, Optional
import anthropic
import google.generativeai as genai
from llamaapi import LlamaAPI
from openai import AsyncOpenAI
from fastapi import HTTPException
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)
from pydantic import ValidationError

from config.settings import settings
from config.logging_config import logger, log_error
from models.plan_schemas import (
    validate_meal_plan,
    validate_workout_plan,
    MealPlanSchema,
    WorkoutPlanSchema
)


class AIService:
    """Service for AI model interactions with comprehensive error handling"""

    def __init__(self):
        """Initialize AI clients based on available API keys"""
        self.openai_client: Optional[AsyncOpenAI] = None
        self.anthropic_client: Optional[anthropic.Anthropic] = None
        self.llama_client: Optional[LlamaAPI] = None
        self.gemini_configured: bool = False

        # Initialize OpenAI
        if settings.has_openai:
            try:
                self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI client initialized")
            except Exception as e:
                log_error(e, "Failed to initialize OpenAI client")

        # Initialize Anthropic
        if settings.has_anthropic:
            try:
                self.anthropic_client = anthropic.Anthropic(
                    api_key=settings.ANTHROPIC_API_KEY
                )
                logger.info("Anthropic client initialized")
            except Exception as e:
                log_error(e, "Failed to initialize Anthropic client")

        # Initialize Gemini
        if settings.has_gemini:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_configured = True
                logger.info("Gemini client configured")
            except Exception as e:
                log_error(e, "Failed to configure Gemini")

        # Initialize Llama
        if settings.has_llama:
            try:
                self.llama_client = LlamaAPI(settings.LLAMA_API_KEY)
                logger.info("Llama client initialized")
            except Exception as e:
                log_error(e, "Failed to initialize Llama client")

    def clean_json_response(self, response: str) -> str:
        """
        Clean AI response to extract valid JSON.

        Args:
            response: Raw AI response string

        Returns:
            Cleaned JSON string
        """
        response = response.strip()

        # Remove markdown code blocks
        if response.startswith("```json"):
            response = response[7:]
        elif response.startswith("```"):
            response = response[3:]

        if response.endswith("```"):
            response = response[:-3]

        return response.strip()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((Exception,)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def call_openai(
        self,
        prompt: str,
        model: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        Call OpenAI API asynchronously with automatic retry logic.

        Retries up to 3 times with exponential backoff (2s, 4s, 8s) on failure.

        Args:
            prompt: User prompt
            model: Model name
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature

        Returns:
            AI response text

        Raises:
            HTTPException: If API call fails after all retries
        """
        if not self.openai_client:
            raise HTTPException(
                status_code=500,
                detail="OpenAI client not initialized. Check API key."
            )

        try:
            logger.info(f"Calling OpenAI API with model: {model}")
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional nutritionist and fitness trainer. Return only valid JSON."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens or settings.AI_MAX_TOKENS,
                temperature=temperature or settings.AI_TEMPERATURE
            )
            logger.info(f"OpenAI API call successful")
            return response.choices[0].message.content.strip()

        except Exception as e:
            error_msg = f"OpenAI API call failed: {str(e)}"
            log_error(e, "OpenAI API call")
            raise HTTPException(status_code=500, detail=error_msg)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((Exception,)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def call_anthropic(
        self,
        prompt: str,
        model: str,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Call Anthropic Claude API asynchronously with automatic retry logic.

        Retries up to 3 times with exponential backoff (2s, 4s, 8s) on failure.

        Args:
            prompt: User prompt
            model: Model name
            max_tokens: Maximum tokens to generate

        Returns:
            AI response text

        Raises:
            HTTPException: If API call fails after all retries
        """
        if not self.anthropic_client:
            raise HTTPException(
                status_code=500,
                detail="Anthropic client not initialized. Check API key."
            )

        try:
            if not model.startswith("claude"):
                model = "claude-3-5-sonnet-20241022"

            logger.info(f"Calling Anthropic API with model: {model}")
            message = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens or settings.AI_MAX_TOKENS,
                messages=[{"role": "user", "content": prompt}]
            )
            logger.info(f"Anthropic API call successful")
            return message.content[0].text.strip()

        except Exception as e:
            error_msg = f"Anthropic API call failed: {str(e)}"
            log_error(e, "Anthropic API call")
            raise HTTPException(status_code=500, detail=error_msg)

    async def generate_plan(
        self,
        prompt: str,
        provider: str,
        model: str,
        user_id: Optional[str] = None,
        plan_type: Optional[str] = None  # 'meal' or 'workout'
    ) -> Dict[str, Any]:
        """
        Generate a plan using the specified AI provider with automatic validation.
        NOW ASYNC - must be awaited!

        Args:
            prompt: Formatted prompt string
            provider: AI provider name ('openai', 'anthropic', etc.)
            model: Model name
            user_id: Optional user ID for logging
            plan_type: Optional plan type for validation ('meal' or 'workout')

        Returns:
            Parsed and validated JSON response as dictionary

        Raises:
            HTTPException: If generation or validation fails
        """
        provider_lower = provider.lower()

        if not settings.validate_ai_provider(provider_lower):
            raise HTTPException(
                status_code=400,
                detail=f"AI provider '{provider}' is not configured or invalid"
            )

        try:
            logger.info(
                f"Generating {plan_type or 'plan'} with {provider} ({model}) "
                f"{f'for user {user_id}' if user_id else ''}"
            )

            if provider_lower == "openai":
                response = await self.call_openai(prompt, model)
            elif provider_lower == "anthropic":
                response = await self.call_anthropic(prompt, model)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported AI provider: {provider}"
                )

            clean_response = self.clean_json_response(response)

            try:
                parsed_data = json.loads(clean_response)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {str(e)}")
                logger.error(f"Response preview: {clean_response[:500]}")
                raise HTTPException(
                    status_code=500,
                    detail=f"AI returned invalid JSON: {str(e)}"
                )

            # Validate plan structure if plan_type is specified
            if plan_type:
                try:
                    if plan_type == 'meal':
                        validated_plan = validate_meal_plan(parsed_data)
                        logger.info(f"Meal plan validation successful")
                        return validated_plan.model_dump()
                    elif plan_type == 'workout':
                        validated_plan = validate_workout_plan(parsed_data)
                        logger.info(f"Workout plan validation successful")
                        return validated_plan.model_dump()
                    else:
                        logger.warning(f"Unknown plan_type: {plan_type}, skipping validation")
                except ValidationError as e:
                    logger.error(f"Plan validation failed: {str(e)}")
                    logger.error(f"Validation errors: {e.errors()}")
                    # Log the full response for debugging
                    logger.debug(f"Failed plan data: {json.dumps(parsed_data, indent=2)[:1000]}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"AI generated plan with missing/invalid fields: {str(e)}"
                    )

            logger.info(f"Successfully generated {plan_type or 'plan'} with {provider}")
            return parsed_data

        except HTTPException:
            raise
        except Exception as e:
            error_msg = f"Plan generation failed: {str(e)}"
            log_error(e, "Plan generation", user_id)
            raise HTTPException(status_code=500, detail=error_msg)


ai_service = AIService()