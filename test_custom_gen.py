
import os
import django
import sys
import json

# Set up Django environment
sys.path.append('/home/brian/Documents/coding_projects/django_math_stumper')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_math_stumper.settings')
django.setup()

from ode_solver.services import ODEGenerator

def test_custom_task():
    print("Testing custom task creation...")
    generator = ODEGenerator()
    
    # Test case 1: All zeros (Static)
    coefficients = {
        'linear': [0, 0, 0, 0],
        'cross': [0, 0, 0, 0, 0, 0],
        'quadratic': [0, 0, 0, 0],
        'cubic': [0, 0, 0, 0]
    }
    initial_conditions = (0.5, 0.5, 0.5, 0.5)
    target_time = 1.0
    
    try:
        task = generator.create_custom_task(coefficients, initial_conditions, target_time)
        if task:
            print("SUCCESS: Task created.")
            print(f"Solution: {task['solution']['final_solution']}")
        else:
            print("FAILURE: Generator returned None.")
            
            # Debug deeper - reproduce _solve_ode_system logic
            print("Debugging inner logic...")
            try:
                sol = generator._solve_ode_system(coefficients, initial_conditions, target_time)
                if sol is None:
                    print(" Inner _solve_ode_system returned None")
                else:
                    print(f" Inner _solve_ode_system returned: {sol}")
            except Exception as e:
                print(f" Inner exception: {e}")

    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_custom_task()
