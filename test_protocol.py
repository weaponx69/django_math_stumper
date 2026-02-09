import os
import django
import json
import sys

# Setup Django environment
sys.path.append('/home/brian/Documents/coding_projects/django_math_stumper')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_math_stumper.settings')
django.setup()

from ode_solver.services import ODEGenerator, format_latex_solution

def test_detailed_protocol():
    gen = ODEGenerator()
    task = gen.generate_valid_ode_task()
    
    if not task:
        print("Failed to generate task")
        return

    print("\n--- System Audit ---")
    print(f"Target Time: {task['target_time']}")
    print(f"Initial: {task['initial_conditions']}")
    
    sol = task['solution']
    latex = format_latex_solution(
        task['coefficients'],
        (task['initial_conditions']['x0'], task['initial_conditions']['y0'], task['initial_conditions']['z0'], task['initial_conditions']['w0']),
        task['target_time'],
        tuple(sol['final_values']),
        sol['weighted_sum'],
        sol['arc_length'],
        sol['curvature'],
        sol['final_solution']
    )
    
    print("\n--- Detailed LaTeX Steps (Preview) ---")
    # Just print the first few lines to verify structure
    lines = latex.split('\n')
    for line in lines[:20]:
        print(line)
        
    print("\n--- Verification ---")
    print(f"Final Solution (Scalar Sum): {sol['final_solution']}")
    
    # Check if growth evaluate is in there
    if "Evaluating the Exponential Growth" in latex:
        print("SUCCESS: Detailed growth steps found in LaTeX.")
    else:
        print("FAILURE: Detailed growth steps missing.")

if __name__ == "__main__":
    test_detailed_protocol()
