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

def test_task_verbosity(task_id):
    api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
    model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-pro-latest')
    client = genai.Client(api_key=api_key)
    
    ode_task = ODETask.objects.get(pk=task_id)
    coefficients = ode_task.get_coefficients_dict()
    linear = coefficients.get('linear', [])
    
    system_instruction = "Provide a VERBOSE, MULTI-PARAGRAPH derivation."
    prompt = f"Explain this matrix: {linear}"
    
    print(f"Testing task {task_id} with model: {model_name}")
    
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
    print(f"Text length: {len(response.text)}")
    print(f"Text ends in: ...{response.text[-50:]}")

if __name__ == "__main__":
    test_task_verbosity(19804)
