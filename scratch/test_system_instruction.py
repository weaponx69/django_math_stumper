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
from ode_solver.models import ODETask

def test_system_instruction_truncation(task_id):
    api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
    model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-flash-latest')
    client = genai.Client(api_key=api_key)
    
    system_instruction = "You are a PhD mathematician. Be VERBOSE and EXHAUSTIVE. 4 paragraphs."
    prompt = "Perform a rigorous mathematical derivation for this matrix: [[0,0,0,0],[0,0,0,0],[0,0,-1,1],[0,0,0,0]]"
    
    print(f"Testing with system_instruction and max_output_tokens=2048...")
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            max_output_tokens=2048,
        )
    )
    print(f"Length: {len(response.text)}, Finish: {response.candidates[0].finish_reason}")
    print(f"Ends in: ...{response.text[-50:]}")

if __name__ == "__main__":
    test_system_instruction_truncation(19902)
