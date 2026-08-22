"""
MemCode Client — Isolated OpenAI-compatible API adapter.
All AI provider communication flows through this module.
Changing the provider endpoint requires modifying ONLY this file.
"""
import json
import logging
from typing import Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

# Timeout configuration
TIMEOUT = httpx.Timeout(30.0, connect=10.0)


async def chat(
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 2000,
    response_format: Optional[dict] = None,
) -> Optional[str]:
    """
    Send a chat completion request to the configured AI provider.
    Returns the assistant's response text, or None on failure.
    """
    if not settings.ai_available:
        logger.warning("AI provider not configured — no API key")
        return None

    url = f"{settings.memcode_base_url.rstrip('/')}/chat/completions"

    headers = {
        "Authorization": f"Bearer {settings.memcode_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": settings.memcode_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if response_format:
        payload["response_format"] = response_format

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()

            # Standard OpenAI-compatible response format
            choices = data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "")

            logger.error("No choices in AI response: %s", data)
            return None

    except httpx.HTTPStatusError as e:
        logger.error("AI API HTTP error %s: %s", e.response.status_code, e.response.text[:200])
        return None
    except httpx.RequestError as e:
        logger.error("AI API request error: %s", str(e))
        return None
    except Exception as e:
        logger.error("AI API unexpected error: %s", str(e))
        return None


async def generate_structured(
    messages: list[dict],
    temperature: float = 0.5,
    max_tokens: int = 2000,
) -> Optional[dict]:
    """
    Generate a structured JSON response from the AI.
    Returns parsed dict, or None on failure.
    """
    # Request JSON response format
    response = await chat(
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )

    if not response:
        return None

    try:
        # Clean up potential markdown code fences
        cleaned = response.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse AI JSON response: %s — Response: %s", str(e), response[:200])
        return None
