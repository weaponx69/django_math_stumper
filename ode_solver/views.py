from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
import decimal
from decimal import Decimal
from .models import ODETask
from .services import ODEGenerator, format_latex_solution, format_equation_latex


def index(request):
    """Redirect to React frontend"""
    from django.http import HttpResponseRedirect
    return HttpResponseRedirect('http://localhost:3000')


class UserView(View):
    """API endpoint to get current user info"""
    
    def get(self, request):
        """Return user authentication status"""
        return JsonResponse({
            'is_authenticated': request.user.is_authenticated,
            'username': request.user.username if request.user.is_authenticated else None,
        })


class GenerateODETaskView(View):
    """API endpoint to generate a new ODE task"""
    
    def get(self, request):
        import traceback
        print("=" * 60)
        print("DEBUG: GenerateODETaskView.get started") 
        print("=" * 60)
        
        try:
            generator = ODEGenerator()
            print("DEBUG: ODEGenerator created")
            
            # Generate a valid ODE task
            print("DEBUG: Calling generate_valid_ode_task()...")
            task_data = generator.generate_valid_ode_task()
            print("DEBUG: generate_valid_ode_task returned:", task_data is not None)
            
            if not task_data:
                print("DEBUG: GenerateODETaskView.get - could not generate valid ODE task")
                return JsonResponse({'error': 'Could not generate a valid ODE task'}, status=500)
            
            print("DEBUG: Task data generated successfully, creating database record...")
            
            # Create database record
            ode_task = ODETask.objects.create(
                coefficients=task_data['coefficients'],
                x0=task_data['initial_conditions']['x0'],
                y0=task_data['initial_conditions']['y0'],
                z0=task_data['initial_conditions']['z0'],
                w0=task_data['initial_conditions']['w0'],
                target_time=task_data['target_time'],
                x_final=task_data['solution']['final_values'][0],
                y_final=task_data['solution']['final_values'][1],
                z_final=task_data['solution']['final_values'][2],
                w_final=task_data['solution']['final_values'][3],
                weighted_sum=task_data['solution']['weighted_sum'],
                arc_length=task_data['solution']['arc_length'],
                curvature=task_data['solution']['curvature'],
                final_solution=task_data['solution']['final_solution'],
                is_valid=True
            )
            
            print("DEBUG: Database record created with ID:", ode_task.pk)
            
            # Return task details (without the solution for challenge)
            response_data = {
                'task_id': ode_task.pk,
                'coefficients': ode_task.get_coefficients_dict(),
                'initial_conditions': {
                    'x0': float(ode_task.x0),
                    'y0': float(ode_task.y0),
                    'z0': float(ode_task.z0),
                    'w0': float(ode_task.w0),
                },
                'target_time': float(ode_task.target_time),
                'equation_preview': self.get_equation_preview(
                    ode_task.get_coefficients_dict(), 
                    ode_task.target_time,
                    (float(ode_task.x0), float(ode_task.y0), float(ode_task.z0), float(ode_task.w0))
                )
            }
            
            print("DEBUG: Response prepared, returning JSON")
            return JsonResponse(response_data)
            
        except Exception as e:
            print("=" * 60)
            print("DEBUG: GenerateODETaskView.get EXCEPTION")
            print("ERROR:", str(e))
            print(traceback.format_exc())
            print("=" * 60)
            return JsonResponse({'error': str(e)}, status=500)
    
    def get_equation_preview(self, coefficients, target_time=None, initial_conditions=None):
        """Generate a LaTeX representation of the ODE system"""
        # This will be used for frontend display
        preview = {
            'dx_dt': format_equation_latex(coefficients, 'x'),
            'dy_dt': format_equation_latex(coefficients, 'y'),
            'dz_dt': format_equation_latex(coefficients, 'z'),
            'dw_dt': format_equation_latex(coefficients, 'w'),
        }
        
        # For consistency, also generate a basic raw_latex field
        # This ensures both generated and custom tasks have the same structure
        if target_time is not None and initial_conditions is not None:
            # Generate a simple raw LaTeX representation
            dx = preview['dx_dt']
            dy = preview['dy_dt']
            dz = preview['dz_dt']
            dw = preview['dw_dt']
            
            # Create the aligned environment with pure mathematical content
            raw_latex = f"$$\n\\begin{{aligned}}\n{dx} \\\\\n{dy} \\\\\n{dz} \\\\\n{dw}\n\\end{{aligned}}\n$$"
            preview['raw_latex'] = raw_latex
        
        return preview



class CreateCustomTaskView(GenerateODETaskView):
    """API endpoint to create a custom ODE task"""

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        # Using super().dispatch correctly calls the next class in MRO (View.dispatch)
        return super().dispatch(*args, **kwargs)
        
    def post(self, request):
        """Create a new ODE task from submitted parameters"""
        try:
            data = json.loads(request.body)
            
            # Extract parameters
            coefficients = data.get('coefficients')
            initial_conditions_dict = data.get('initial_conditions')
            target_time = data.get('target_time')
            
            if not coefficients or not initial_conditions_dict or target_time is None:
                return JsonResponse({'error': 'Missing required parameters'}, status=400)
            
            # Format initial conditions
            initial_conditions = (
                float(initial_conditions_dict.get('x0', 0)),
                float(initial_conditions_dict.get('y0', 0)),
                float(initial_conditions_dict.get('z0', 0)),
                float(initial_conditions_dict.get('w0', 0))
            )
            
            generator = ODEGenerator()
            
            # Create the custom task
            task_data = generator.create_custom_task(coefficients, initial_conditions, float(target_time))
            
            if not task_data:
                return JsonResponse({'error': 'Could not solve the system with provided parameters'}, status=400)
            
            # Create database record
            ode_task = ODETask.objects.create(
                coefficients=task_data['coefficients'],
                x0=task_data['initial_conditions']['x0'],
                y0=task_data['initial_conditions']['y0'],
                z0=task_data['initial_conditions']['z0'],
                w0=task_data['initial_conditions']['w0'],
                target_time=task_data['target_time'],
                x_final=task_data['solution']['final_values'][0],
                y_final=task_data['solution']['final_values'][1],
                z_final=task_data['solution']['final_values'][2],
                w_final=task_data['solution']['final_values'][3],
                weighted_sum=task_data['solution']['weighted_sum'],
                arc_length=task_data['solution']['arc_length'],
                curvature=task_data['solution']['curvature'],
                final_solution=task_data['solution']['final_solution'],
                is_valid=True
            )
            
            # Reuse the response format from GenerateODETaskView
            # We can't easily reuse the 'get' method code without refactoring, so we duplicate the response structure
            response_data = {
                'task_id': ode_task.pk,
                'coefficients': ode_task.get_coefficients_dict(),
                'initial_conditions': {
                    'x0': float(ode_task.x0),
                    'y0': float(ode_task.y0),
                    'z0': float(ode_task.z0),
                    'w0': float(ode_task.w0),
                },
                'target_time': float(ode_task.target_time),
                'equation_preview': self.get_equation_preview(
                    ode_task.get_coefficients_dict(), 
                    ode_task.target_time,
                    initial_conditions
                )
            }
            
            return JsonResponse(response_data)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class VerifySolutionView(View):
    """API endpoint to verify a submitted solution"""
    
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Verify a submitted solution against the ground truth"""
        try:
            data = json.loads(request.body)
            task_id = data.get('task_id')
            submitted_solution = data.get('solution')
            
            if not task_id or submitted_solution is None:
                return JsonResponse({'error': 'Missing task_id or solution'}, status=400)
            
            # Get the ODE task
            try:
                ode_task = ODETask.objects.get(pk=task_id)
            except ODETask.DoesNotExist:
                return JsonResponse({'error': 'Task not found'}, status=404)
            
            # Compare with ground truth
            ground_truth = ode_task.final_solution
            is_correct = submitted_solution == ground_truth
            
            response_data = {
                'task_id': task_id,
                'submitted_solution': submitted_solution,
                'ground_truth': int(ground_truth) if ground_truth is not None else None,
                'is_correct': is_correct,
                'details': {
                    'weighted_sum': float(ode_task.weighted_sum) if ode_task.weighted_sum else None,
                    'arc_length': float(ode_task.arc_length) if ode_task.arc_length else None,
                    'curvature': float(ode_task.curvature) if ode_task.curvature else None,
                }
            }
            
            return JsonResponse(response_data)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class TaskDetailView(View):
    """API endpoint to get details of a specific task"""
    
    def get(self, request, task_id):
        """Get details of a specific ODE task"""
        try:
            # Try to get the task, but catch any database conversion errors
            try:
                ode_task = ODETask.objects.get(pk=task_id)
            except (decimal.InvalidOperation, ValueError, TypeError) as e:
                print(f"DEBUG: Database conversion error for task {task_id}: {e}")
                return JsonResponse({'error': f'Database error: {str(e)}'}, status=500)
            
            # Use the same formatting methods as GenerateODETaskView
            generator_view = GenerateODETaskView()
            equation_preview = generator_view.get_equation_preview(ode_task.get_coefficients_dict())
            
            # Safely convert Decimal fields to float with error handling
            def safe_float_conversion(value, field_name):
                try:
                    if value is None:
                        return 0.0
                    return float(value)
                except (ValueError, TypeError, decimal.InvalidOperation) as e:
                    print(f"DEBUG: Error converting {field_name}: {e}")
                    return 0.0
            
            response_data = {
                'task_id': ode_task.pk,
                'coefficients': ode_task.get_coefficients_dict(),
                'initial_conditions': {
                    'x0': safe_float_conversion(ode_task.x0, 'x0'),
                    'y0': safe_float_conversion(ode_task.y0, 'y0'),
                    'z0': safe_float_conversion(ode_task.z0, 'z0'),
                    'w0': safe_float_conversion(ode_task.w0, 'w0'),
                },
                'target_time': safe_float_conversion(ode_task.target_time, 'target_time'),
                'equation_preview': equation_preview,
                'created_at': ode_task.created_at.isoformat(),
                'is_valid': ode_task.is_valid
            }
            
            return JsonResponse(response_data)
            
        except ODETask.DoesNotExist:
            return JsonResponse({'error': 'Task not found'}, status=404)


class ProblemListView(View):
    """API endpoint to list all ODE tasks (problems)"""
    
    def get(self, request):
        """Get list of all ODE tasks"""
        try:
            # Get all tasks, ordered by most recent
            tasks = ODETask.objects.all().order_by('-created_at')[:50]  # Limit to 50 most recent
            
            # Format response to match what ProblemList.js expects
            problems = []
            for task in tasks:
                # Generate a "question" from the equation preview
                preview = GenerateODETaskView().get_equation_preview(
                    task.get_coefficients_dict(),
                    task.target_time,
                    (float(task.x0), float(task.y0), float(task.z0), float(task.w0))
                )
                
                problems.append({
                    'id': task.pk,
                    'task_id': task.pk,
                    'question': f"Solve the ODE system with target time t_f = {float(task.target_time)}",
                    'answer': task.final_solution,
                    'created_at': task.created_at.isoformat(),
                    'target_time': float(task.target_time),
                    'initial_conditions': {
                        'x0': float(task.x0),
                        'y0': float(task.y0),
                        'z0': float(task.z0),
                        'w0': float(task.w0),
                    },
                    'equation_preview': preview
                })
            
            return JsonResponse({'problems': problems})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class TaskSolutionView(View):
    """API endpoint to get detailed solution for a specific task"""
    
    def get(self, request, task_id):
        """Get detailed solution information for educational purposes"""
        try:
            ode_task = ODETask.objects.get(pk=task_id)
            
            # Use the same formatting methods as GenerateODETaskView
            generator_view = GenerateODETaskView()
            initial_conditions = (float(ode_task.x0), float(ode_task.y0), float(ode_task.z0), float(ode_task.w0))
            equation_preview = generator_view.get_equation_preview(
                ode_task.get_coefficients_dict(),
                float(ode_task.target_time),
                initial_conditions
            )
            
            # Get final values (with fallback to initial conditions for old tasks)
            final_values = [
                float(ode_task.x_final) if ode_task.x_final is not None else float(ode_task.x0),
                float(ode_task.y_final) if ode_task.y_final is not None else float(ode_task.y0),
                float(ode_task.z_final) if ode_task.z_final is not None else float(ode_task.z0),
                float(ode_task.w_final) if ode_task.w_final is not None else float(ode_task.w0)
            ]
            
            # Recalculate metrics from final values to verify consistency
            recalculated_weighted_sum = self.calculate_weighted_sum(final_values)
            recalculated_arc_length = float(ode_task.arc_length) if ode_task.arc_length else 0.0  # Arc length requires integration, use stored value
            recalculated_curvature = float(ode_task.curvature) if ode_task.curvature else 0.0  # Use stored value
            recalculated_final_solution = self.calculate_final_solution(final_values)
            
            # Check for consistency between stored and recalculated values
            weighted_sum_consistent = abs(float(ode_task.weighted_sum) - recalculated_weighted_sum) < 1e-10 if ode_task.weighted_sum else True
            final_solution_consistent = ode_task.final_solution == recalculated_final_solution
            
            response_data = {
                'task_id': ode_task.pk,
                'coefficients': ode_task.get_coefficients_dict(),
                'initial_conditions': {
                    'x0': float(ode_task.x0),
                    'y0': float(ode_task.y0),
                    'z0': float(ode_task.z0),
                    'w0': float(ode_task.w0),
                },
                'target_time': float(ode_task.target_time),
                'equation_preview': equation_preview,
                'final_values': final_values,
                'stored_metrics': {
                    'weighted_sum': float(ode_task.weighted_sum) if ode_task.weighted_sum else 0.0,
                    'arc_length': float(ode_task.arc_length) if ode_task.arc_length else 0.0,
                    'curvature': float(ode_task.curvature) if ode_task.curvature else 0.0,
                    'final_solution': int(ode_task.final_solution) if ode_task.final_solution is not None else None,
                },
                'recalculated_metrics': {
                    'weighted_sum': recalculated_weighted_sum,
                    'arc_length': recalculated_arc_length,
                    'curvature': recalculated_curvature,
                    'final_solution': recalculated_final_solution,
                },
                'consistency_check': {
                    'weighted_sum_consistent': weighted_sum_consistent,
                    'final_solution_consistent': final_solution_consistent,
                    'all_consistent': weighted_sum_consistent and final_solution_consistent
                },
                'created_at': ode_task.created_at.isoformat(),
                'is_valid': ode_task.is_valid,
                'latex_solution': format_latex_solution(
                    ode_task.get_coefficients_dict(),
                    {
                        'x0': float(ode_task.x0),
                        'y0': float(ode_task.y0),
                        'z0': float(ode_task.z0),
                        'w0': float(ode_task.w0)
                    },
                    float(ode_task.target_time),
                    {
                        'final_values': final_values,
                        'weighted_sum': float(ode_task.weighted_sum or 0),
                        'arc_length': float(ode_task.arc_length or 0),
                        'curvature': float(ode_task.curvature or 0),
                        'final_solution': ode_task.final_solution
                    }
                )
            }
            
            return JsonResponse(response_data)
            
        except ODETask.DoesNotExist:
            return JsonResponse({'error': 'Task not found'}, status=404)
    
    def calculate_weighted_sum(self, final_values):
        """Calculate weighted sum from final values: S = x_f + 2*y_f + 3*z_f + 4*w_f"""
        x_f, y_f, z_f, w_f = final_values
        weighted_sum = x_f + 2*y_f + 3*z_f + 4*w_f
        return float(weighted_sum)
    
    def calculate_final_solution(self, final_values):
        """Calculate final solution: ℒ = round(Σ u_i(t_f))"""
        try:
            scalar_sum = sum(final_values)
            return int(round(scalar_sum))
        except Exception:
            return 0
