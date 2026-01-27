"""
Test OpenRouter API directly
"""
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.config import get_settings

settings = get_settings()

print("=" * 80)
print("API CONFIGURATION TEST")
print("=" * 80)

print(f"\nGemini API Key: {'SET' if settings.gemini_api_key else 'NOT SET'}")
print(f"OpenRouter API Key: {'SET' if settings.openrouter_api_key else 'NOT SET'}")
print(f"OpenRouter Model: {settings.openrouter_model}")

if settings.openrouter_api_key:
    print(f"\nOpenRouter Key (first 20 chars): {settings.openrouter_api_key[:20]}...")

print("\n" + "-" * 80)
print("Testing OpenRouter API directly...")
print("-" * 80)

try:
    from openai import OpenAI
    
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.openrouter_api_key,
    )
    
    print("✓ OpenAI client created")
    
    # Try a simple API call
    print("\nMaking test API call...")
    
    completion = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[
            {"role": "user", "content": "Say 'Hello, I am working!' in exactly 5 words."}
        ],
        max_tokens=20
    )
    
    response = completion.choices[0].message.content
    print(f"\n✓ API Response: {response}")
    print("\n" + "=" * 80)
    print("✅ OpenRouter API is WORKING!")
    print("=" * 80)
    
except Exception as e:
    print(f"\n❌ API ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    print("\n" + "=" * 80)
    print("❌ OpenRouter API is FAILING!")
    print("=" * 80)
