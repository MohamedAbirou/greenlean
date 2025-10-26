"""AI service for interacting with multiple AI providers"""

import json
from typing import Dict, Any, Optional
import anthropic
import google.generativeai as genai
from llamaapi import LlamaAPI
from openai import OpenAI
from fastapi import HTTPException

from config.settings import settings
from config.logging_config import logger, log_error


class AIService:
    """Service for AI model interactions with comprehensive error handling"""

    def __init__(self):
        """Initialize AI clients based on available API keys"""
        self.openai_client: Optional[OpenAI] = None
        self.anthropic_client: Optional[anthropic.Anthropic] = None
        self.llama_client: Optional[LlamaAPI] = None
        self.gemini_configured: bool = False

        # Initialize OpenAI
        if settings.has_openai:
            try:
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
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

    def call_openai(
        self,
        prompt: str,
        model: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        Call OpenAI API.

        Args:
            prompt: User prompt
            model: Model name
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature

        Returns:
            AI response text

        Raises:
            HTTPException: If API call fails
        """
        if not self.openai_client:
            raise HTTPException(
                status_code=500,
                detail="OpenAI client not initialized. Check API key."
            )

        try:
            response = self.openai_client.chat.completions.create(
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
            return response.choices[0].message.content.strip()

        except Exception as e:
            error_msg = f"OpenAI API call failed: {str(e)}"
            log_error(e, "OpenAI API call")
            raise HTTPException(status_code=500, detail=error_msg)

    def call_anthropic(
        self,
        prompt: str,
        model: str,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Call Anthropic Claude API.

        Args:
            prompt: User prompt
            model: Model name
            max_tokens: Maximum tokens to generate

        Returns:
            AI response text

        Raises:
            HTTPException: If API call fails
        """
        if not self.anthropic_client:
            raise HTTPException(
                status_code=500,
                detail="Anthropic client not initialized. Check API key."
            )

        try:
            # Ensure model starts with "claude"
            if not model.startswith("claude"):
                model = "claude-3-5-sonnet-20241022"

            message = self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens or settings.AI_MAX_TOKENS,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text.strip()

        except Exception as e:
            error_msg = f"Anthropic API call failed: {str(e)}"
            log_error(e, "Anthropic API call")
            raise HTTPException(status_code=500, detail=error_msg)

    def generate_plan(
        self,
        prompt: str,
        provider: str,
        model: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a plan using the specified AI provider.

        Args:
            prompt: Formatted prompt string
            provider: AI provider name ('openai', 'anthropic', etc.)
            model: Model name
            user_id: Optional user ID for logging

        Returns:
            Parsed JSON response as dictionary

        Raises:
            HTTPException: If generation fails
        """
        provider_lower = provider.lower()

        # Validate provider is configured
        if not settings.validate_ai_provider(provider_lower):
            raise HTTPException(
                status_code=400,
                detail=f"AI provider '{provider}' is not configured or invalid"
            )

        try:
            # Log request
            logger.info(
                f"Generating plan with {provider} ({model}) "
                f"{f'for user {user_id}' if user_id else ''}"
            )

            # Call appropriate provider
            if provider_lower == "openai":
                response = self.call_openai(prompt, model)
            elif provider_lower == "anthropic":
                response = self.call_anthropic(prompt, model)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported AI provider: {provider}"
                )

            # Clean and parse response
            clean_response = self.clean_json_response(response)

            try:
                parsed_data = json.loads(clean_response)
                logger.info(f"Successfully generated plan with {provider}")
                return parsed_data

            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {str(e)}")
                logger.error(f"Response preview: {clean_response[:500]}")
                raise HTTPException(
                    status_code=500,
                    detail=f"AI returned invalid JSON: {str(e)}"
                )

        except HTTPException:
            raise
        except Exception as e:
            error_msg = f"Plan generation failed: {str(e)}"
            log_error(e, "Plan generation", user_id)
            raise HTTPException(status_code=500, detail=error_msg)


# Global AI service instance
ai_service = AIService()
