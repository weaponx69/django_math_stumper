import os
import django
import sys
from google import genai
from google.genai import types

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_math_stumper.settings')
django.setup()

from django.conf import settings

def test_models():
    api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
    client = genai.Client(api_key=api_key)
    
    models_to_test = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-latest']
    
    for model_name in models_to_test:
        print(f"\n--- Testing Model: {model_name} ---")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents="Write a very long essay about the history of calculus. Write at least 2000 characters.",
                config=types.GenerateContentConfig(
                    max_output_tokens=2048,
                    temperature=0.1
                )
            )
            print(f"Success! Length: {len(response.text)}")
            print(f"Finish Reason: {response.candidates[0].finish_reason}")
        except Exception as e:
            print(f"Failed: {str(e)}")

if __name__ == "__main__":
    test_models()
