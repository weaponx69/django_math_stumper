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

def test_verbosity():
    api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
    model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
    client = genai.Client(api_key=api_key)
    
    system_instruction = "You are a PhD mathematician. Provide an EXTREMELY LONG AND DETAILED step-by-step derivation."
    prompt = "Explain how to solve a 4x4 system of linear ODEs where the matrix is rank 1. Be as verbose as possible, write thousands of characters."
    
    print(f"Testing with model: {model_name}")
    
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            max_output_tokens=2048,
        )
    )
    
    print(f"Candidate count: {len(response.candidates)}")
    candidate = response.candidates[0]
    print(f"Finish reason: {candidate.finish_reason}")
    print(f"Grounding metadata: {candidate.grounding_metadata is not None}")
    
    text = response.text
    print(f"Response length: {len(text)}")
    print("--- RESPONSE ---")
    print(text)

if __name__ == "__main__":
    test_verbosity()
