import json
import textwrap
from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import ODETask, UserSolution
from google import genai
from google.genai import types

def get_gemini_client():
    api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
    if not api_key:
        return None
    return genai.Client(api_key=api_key)

class AIExplanationView(View):
    """API endpoint to get an AI-generated explanation for an ODE task"""
    
    def get(self, request, task_id):
        """Generate an AI explanation for a specific ODE task"""
        system_instruction = "You are a senior PhD mathematician and expert differential equations tutor. Use LaTeX for all mathematical expressions."
        client = get_gemini_client()
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-flash-latest')
        
        if not client:
            return JsonResponse({
                'error': 'Gemini API key not configured.',
                'configured': False
            }, status=503)
        
        try:
            try:
                ode_task = ODETask.objects.get(pk=task_id)
            except ODETask.DoesNotExist:
                return JsonResponse({'error': 'Task not found'}, status=404)
            
            coefficients = ode_task.get_coefficients_dict()
            initial_conditions = {
                'x0': float(ode_task.x0), 'y0': float(ode_task.y0),
                'z0': float(ode_task.z0), 'w0': float(ode_task.w0)
            }
            target_time = float(ode_task.target_time)
            final_values = [
                float(ode_task.x_final) if ode_task.x_final else float(ode_task.x0),
                float(ode_task.y_final) if ode_task.y_final else float(ode_task.y0),
                float(ode_task.z_final) if ode_task.z_final else float(ode_task.z0),
                float(ode_task.w_final) if ode_task.w_final else float(ode_task.w0)
            ]
            
            prompt = self._build_explanation_prompt(
                coefficients, initial_conditions, target_time, final_values
            )
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.3,
                    max_output_tokens=4096,
                )
            )
            ai_explanation = response.text
            
            return JsonResponse({
                'task_id': task_id,
                'explanation': ai_explanation,
                'model_used': model_name,
                'success': True
            })
            
        except Exception as e:
            return JsonResponse({
                'error': f'Failed to generate explanation: {str(e)}',
                'success': False
            }, status=500)
    
    def _build_explanation_prompt(self, coefficients, initial_conditions, target_time, final_values):
        """Build a rigorous, exhaustive technical solution report"""
        linear = coefficients.get('linear', [])
        
        prompt = f"""COMMAND: Perform a COMPREHENSIVE TECHNICAL SOLUTION REPORT for the following linear system. 
DO NOT PROVIDE A SUMMARY. Provide at least 5-6 paragraphs of rigorous mathematical analysis.

The system is defined as dU/dt = A*U where U(t) = [x, y, z, w]^T and the coefficient matrix A is:
{linear[0][0]:.4f} {linear[0][1]:.4f} {linear[0][2]:.4f} {linear[0][3]:.4f}
{linear[1][0]:.4f} {linear[1][1]:.4f} {linear[1][2]:.4f} {linear[1][3]:.4f}
{linear[2][0]:.4f} {linear[2][1]:.4f} {linear[2][2]:.4f} {linear[2][3]:.4f}
{linear[3][0]:.4f} {linear[3][1]:.4f} {linear[3][2]:.4f} {linear[3][3]:.4f}

Initial conditions at t=0:
x(0) = {initial_conditions['x0']}
y(0) = {initial_conditions['y0']}
z(0) = {initial_conditions['z0']}
w(0) = {initial_conditions['w0']}

Your report must include:
1. Spectral Analysis: An exhaustive eigenvalue and eigenvector analysis of matrix A.
2. Derivation of the General Solution: The complete construction of the time-dependent state vector.
3. Particular State Evaluation: Step-by-step calculation leading to the state at t={target_time}.
4. Technical Verification: Comparison of the derived state with the provided numerical result:
   x({target_time}) = {final_values[0]:.6f}, y({target_time}) = {final_values[1]:.6f}, z({target_time}) = {final_values[2]:.6f}, w({target_time}) = {final_values[3]:.6f}

REITERATE: Be as verbose and technically detailed as possible. No brevity allowed.
"""
        return prompt

class AIStumperView(View):
    """API endpoint to get AI-generated analysis of why an ODE task is particularly difficult"""
    
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Analyze why the ODE task is a 'stumper'"""
        system_instruction = "You are a senior numerical analyst and PhD mathematician. Expertise: linear algebra and numerical stability."
        client = get_gemini_client()
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-flash-latest')
        
        if not client:
            return JsonResponse({'error': 'Gemini API key not configured.'}, status=503)
        
        try:
            data = json.loads(request.body)
            task_id = data.get('task_id')
            ode_task = ODETask.objects.get(pk=task_id)
            coefficients = ode_task.get_coefficients_dict()
            linear = coefficients.get('linear', [])
            target_time = float(ode_task.target_time)
            
            prompt = f"""COMMAND: Perform a RIGOROUS, EXHAUSTIVE technical analysis of the following linear system for numerical stability and potential integration 'traps'.
DO NOT PROVIDE A SUMMARY. Provide at least 4-5 exhaustive paragraphs of technical depth.

dU/dt = A*U where A is:
{linear[0][0]:.4f} {linear[0][1]:.4f} {linear[0][2]:.4f} {linear[0][3]:.4f}
{linear[1][0]:.4f} {linear[1][1]:.4f} {linear[1][2]:.4f} {linear[1][3]:.4f}
{linear[2][0]:.4f} {linear[2][1]:.4f} {linear[2][2]:.4f} {linear[2][3]:.4f}
{linear[3][0]:.4f} {linear[3][1]:.4f} {linear[3][2]:.4f} {linear[3][3]:.4f}

Target time: t = {target_time}

Your report must cover:
1. Matrix Properties: Eigenvalue distribution, presence of zero/unstable modes, and the condition number.
2. Numerical Integration Risks: Sensitivity to step size, risk of error accumulation, and potential for numerical instability.
3. Algebraic Structure: The implications of the rank and sparsity of this specific coefficient set.

REITERATE: This is for PhD-level research. Be as verbose and technically detailed as possible.
"""
            response = client.models.generate_content(
                model=model_name, contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction, temperature=0.3, max_output_tokens=4096
                )
            )
            return JsonResponse({'analysis': response.text, 'success': True})
            
        except Exception as e:
            return JsonResponse({'error': str(e), 'success': False}, status=500)
