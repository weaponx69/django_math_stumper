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

def test_stumper_verbosity(task_id):
    api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
    model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-flash-latest')
    client = genai.Client(api_key=api_key)
    
    ode_task = ODETask.objects.get(pk=task_id)
    coefficients = ode_task.get_coefficients_dict()
    linear = coefficients.get('linear', [])
    
    system_instruction = "You are a PhD mathematician. Provide an EXHAUSTIVE technical analysis. DO NOT SUMMARIZE. Write at least 4 long paragraphs."
    prompt = f"Analyze this matrix for numerical stability traps: {linear}. Focus on eigenvalues and error propagation."
    
    print(f"Testing STUMPER for {task_id} with model: {model_name}")
    
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            max_output_tokens=2048,
        )
    )
    
    candidate = response.candidates[0]
    print(f"Finish reason: {candidate.finish_reason}")
    if hasattr(candidate, 'safety_ratings'):
        print(f"Safety ratings: {candidate.safety_ratings}")
    
    print(f"Text length: {len(response.text)}")
    print(f"Text: {response.text}")

if __name__ == "__main__":
    test_stumper_verbosity(19804)
