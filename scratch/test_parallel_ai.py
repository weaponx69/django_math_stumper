import os
import django
import sys
import threading
import time
from google import genai
from google.genai import types

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_math_stumper.settings')
django.setup()

from django.conf import settings
from ode_solver.models import ODETask

def call_gemini(name, task_id, is_stumper=False):
    api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
    model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-flash-latest')
    client = genai.Client(api_key=api_key)
    
    ode_task = ODETask.objects.get(pk=task_id)
    linear = ode_task.get_coefficients_dict().get('linear', [])
    
    if is_stumper:
        prompt = f"Analyze the numerical stability of this matrix rigorously. 4 paragraphs. {linear}"
    else:
        prompt = f"Perform a rigorous mathematical derivation for this matrix solution. 4 paragraphs. {linear}"
        
    print(f"[{name}] Starting call to {model_name}...")
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(max_output_tokens=2048)
    )
    print(f"[{name}] Done. Length: {len(response.text)}, Finish: {response.candidates[0].finish_reason}")

if __name__ == "__main__":
    task_id = 19902
    t1 = threading.Thread(target=call_gemini, args=("EXPLAIN", task_id, False))
    t2 = threading.Thread(target=call_gemini, args=("STUMPER", task_id, True))
    
    t1.start()
    t2.start()
    
    t1.join()
    t2.join()
