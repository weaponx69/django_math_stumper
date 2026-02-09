import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_math_stumper.settings')
django.setup()

from ode_solver.services import ODEGenerator, format_latex_solution

def test_task_generation():
    """
    Test if the ODEGenerator can generate a valid task and print its LaTeX solution.
    """
    print("Attempting to generate a valid ODE task...")
    generator = ODEGenerator()
    task_data = generator.generate_valid_ode_task()
    
    if task_data:
        print("Successfully generated a valid ODE task!")
        print(f"Task ID: {task_data.get('task_id', 'N/A')}")
        print(f"Final Solution: {task_data['solution']['final_solution']}")
        
        # Print the LaTeX solution for verification
        latex_solution = format_latex_solution(
            task_data['coefficients'],
            (task_data['initial_conditions']['x0'],
             task_data['initial_conditions']['y0'],
             task_data['initial_conditions']['z0'],
             task_data['initial_conditions']['w0']),
            task_data['target_time'],
            tuple(task_data['solution']['final_values']),
            task_data['solution']['weighted_sum'],
            task_data['solution']['arc_length'],
            task_data['solution']['curvature'],
            task_data['solution']['final_solution']
        )
        print("\n--- LaTeX Solution ---")
        print(latex_solution)
        print("----------------------")
        
    else:
        print("Failed to generate a valid ODE task.")

if __name__ == '__main__':
    test_task_generation()