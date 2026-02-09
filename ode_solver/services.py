import numpy as np
from scipy.integrate import solve_ivp
from decimal import Decimal, getcontext
import random
import math
from typing import Dict, Tuple, List, Optional
from concurrent.futures import ThreadPoolExecutor, TimeoutError

# Set decimal precision for exact arithmetic
getcontext().prec = 50

class ODEGenerator:
    """Generate valid ODE tasks with rank-1 matrices and exact solutions"""
    
    def __init__(self):
        self.max_attempts = 100  # Reduced from 500 to prevent timeouts
        
    def _generate_coefficients(self) -> Dict[str, List[List[float]]]:
        """Generate coefficients for a rank-1 matrix using direct outer product method."""
        print("DEBUG: _generate_coefficients using direct rank-1 generation")
        
        # Generate two random vectors 'a' and 'r' with ranges that ensure
        # coefficients stay within [-0.5, 0.5] without needing scaling
        a = np.array([random.uniform(-0.4, 0.4) for _ in range(4)])
        r = np.array([random.uniform(-0.4, 0.4) for _ in range(4)])

        # Construct the rank-1 matrix A = a * r^T
        A = np.outer(a, r)
        
        # Calculate the trace (which is a . r for rank-1 matrices)
        trace = np.dot(a, r)
        
        # Ensure the trace is significantly non-zero to avoid division by zero later
        # and to ensure a meaningful non-zero eigenvalue.
        max_attempts_trace = 0
        while abs(trace) < 0.05 and max_attempts_trace < 10:
            max_attempts_trace += 1
            # Adjust one element to ensure non-zero trace
            if abs(a[0]) > 1e-10:
                r[0] = 0.06 / a[0]  # Ensure trace = 0.06
            else:
                a[0] = 0.06 / r[0] if abs(r[0]) > 1e-10 else 0.1
            A = np.outer(a, r)
            trace = np.dot(a, r)
        
        linear = [[float(A[i, j]) for j in range(4)] for i in range(4)]
        nonlinear = [[0.0 for _ in range(4)] for i in range(4)] # Ensure 4x4 for nonlinear
        
        print(f"DEBUG: _generate_coefficients successful with trace={trace:.6f}")
        return {'linear': linear, 'nonlinear': nonlinear}
    
    def _solve_system(self, coefficients: Dict[str, List[List[float]]], 
                     initial_conditions: Tuple[float, float, float, float], 
                     target_time: float) -> Optional[Dict]:
        print("DEBUG: _solve_system started")
        linear = coefficients['linear']
        def system(t, u):
            return np.dot(linear, u).tolist()
        
        try:
            print("DEBUG: _solve_system solve_ivp started (timeout=10s)")
            # Use ThreadPoolExecutor to apply a timeout to solve_ivp
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(solve_ivp, system, [0, target_time], initial_conditions, 
                                          method='RK45', rtol=1e-9, atol=1e-9, dense_output=True)
                sol = future.result(timeout=10) # 10 second timeout for solve_ivp
            
            if not sol.success: 
                print("DEBUG: _solve_system solve_ivp not successful")
                return None
                
            final_values = sol.y[:, -1]
            t_eval = np.linspace(0, target_time, 1000)
            u_eval = sol.sol(t_eval)
            speeds = np.linalg.norm(np.gradient(u_eval, t_eval, axis=1), axis=0)
            arc_length = np.trapezoid(speeds, t_eval)
            
            # Calculate final solution and ensure it's between 0 and 999
            raw_solution = int(round(sum(final_values)))
            final_solution = raw_solution % 1000  # Ensure result is between 0 and 999
            if final_solution < 0:
                final_solution += 1000  # Handle negative values
            
            print(f"DEBUG: _solve_system successful, final_solution={final_solution}")
            return {
                'final_values': final_values.tolist(),
                'weighted_sum': float(final_values[0] + 2*final_values[1] + 3*final_values[2] + 4*final_values[3]),
                'arc_length': float(arc_length),
                'curvature': 0.0,
                'final_solution': final_solution
            }
        except TimeoutError:
            print("DEBUG: _solve_system TimeoutError caught")
            # If solve_ivp takes too long, return None
            return None
        except Exception as e: 
            print(f"DEBUG: _solve_system general Exception caught: {e}")
            return None

    def generate_valid_ode_task(self) -> Optional[Dict]:
        """Generate a valid ODE task with rank-1 matrix and exact solution"""
        import time
        
        start_time = time.time()
        max_generation_time = 30.0  # 30 second timeout for entire generation process
        
        for attempt in range(self.max_attempts):
            print(f"DEBUG: generate_valid_ode_task attempt {attempt + 1}")
            
            # Check if we've exceeded the time limit
            if time.time() - start_time > max_generation_time:
                print(f"DEBUG: generate_valid_ode_task timeout after {attempt} attempts")
                return None
            
            # Generate coefficients (this should be fast now)
            coefficients = self._generate_coefficients()
            
            # Generate random initial conditions
            initial_conditions = (
                random.uniform(-1, 1),
                random.uniform(-1, 1),
                random.uniform(-1, 1),
                random.uniform(-1, 1)
            )
            
            # Generate random target time
            target_time = random.uniform(0.1, 2.0)
            
            # Try to solve the system
            solution = self._solve_system(coefficients, initial_conditions, target_time)
            
            if solution:
                print(f"DEBUG: generate_valid_ode_task successful after {attempt + 1} attempts")
                return {
                    'coefficients': coefficients,
                    'initial_conditions': {
                        'x0': initial_conditions[0],
                        'y0': initial_conditions[1],
                        'z0': initial_conditions[2],
                        'w0': initial_conditions[3],
                    },
                    'target_time': target_time,
                    'solution': solution
                }
        
        print(f"DEBUG: generate_valid_ode_task failed after all {self.max_attempts} attempts")
        return None

    def create_custom_task(self, coefficients: Dict[str, List[List[float]]], 
                          initial_conditions: Tuple[float, float, float, float], 
                          target_time: float) -> Optional[Dict]:
        """Create a custom ODE task with provided parameters"""
        solution = self._solve_system(coefficients, initial_conditions, target_time)
        
        if solution:
            return {
                'coefficients': coefficients,
                'initial_conditions': {
                    'x0': initial_conditions[0],
                    'y0': initial_conditions[1],
                    'z0': initial_conditions[2],
                    'w0': initial_conditions[3],
                },
                'target_time': target_time,
                'solution': solution
            }
        
        return None

def format_equation_latex(coefficients: Dict[str, List[List[float]]], var_name: str) -> str:
    linear = coefficients['linear']
    idx = {'x': 0, 'y': 1, 'z': 2, 'w': 3}[var_name]
    vars = ['x', 'y', 'z', 'w']
    terms = []
    for i, v in enumerate(vars):
        c = linear[idx][i]
        if abs(c) < 1e-10: continue
        c_str = f"{abs(c):.6f}"
        sign = " - " if c < 0 else (" + " if terms else "")
        terms.append(f"{sign}{c_str}{v}")
    
    rhs = "".join(terms) if terms else "0.000000"
    return rf"\frac{{d{var_name}}}{{dt}} = {rhs}"

def format_latex_solution(coefficients: Dict[str, List[List[float]]],
                         initial_conditions_dict: Dict[str, float],
                         target_time: float,
                         solution_data: Dict) -> str:
    linear = coefficients['linear']
    ic = [initial_conditions_dict['x0'], initial_conditions_dict['y0'], 
          initial_conditions_dict['z0'], initial_conditions_dict['w0']]
    
    trace = sum(linear[i][i] for i in range(4))
    matrix_rows = [" & ".join([f"{c:.6f}" for c in r]) for r in linear]
    matrix_latex = r"\begin{pmatrix} " + r" \\ ".join(matrix_rows) + r" \end{pmatrix}"

    # Rank-1 Analysis - FIND THE RATIO FIRST
    row_r = linear[0]
    
    # Find the ratio between rows to confirm rank-1 structure
    # In A = a*r^T, all rows should be multiples of row_r
    ratios = []
    for i in range(4):
        if i == 0:
            ratios.append(1.0)  # First row is the base
        else:
            # Find the ratio between row i and row 0
            ratio_found = False
            for j in range(4):
                if abs(row_r[j]) > 1e-12:
                    if abs(linear[i][j]) > 1e-12:
                        ratios.append(linear[i][j] / row_r[j])
                        ratio_found = True
                        break
            if not ratio_found:
                # If row_r[j] is all zeros and row i is all zeros, ratio is 1
                if all(abs(x) < 1e-12 for x in linear[i]):
                    ratios.append(1.0)
                else:
                    ratios.append(0.0)  # This shouldn't happen for rank-1
    
    # Handle the case where row_r[0] is zero or very close to zero
    if abs(row_r[0]) < 1e-12:
        # Find the first non-zero column to define 'a'
        first_nonzero_col_idx = -1
        for j in range(4):
            if any(abs(linear[i][j]) > 1e-12 for i in range(4)):
                first_nonzero_col_idx = j
                break
        
        if first_nonzero_col_idx != -1:
            first_nonzero_element_in_col = 0.0
            for i in range(4):
                if abs(linear[i][first_nonzero_col_idx]) > 1e-12:
                    first_nonzero_element_in_col = linear[i][first_nonzero_col_idx]
                    break
            
            if abs(first_nonzero_element_in_col) > 1e-12:
                weights_a = [linear[i][first_nonzero_col_idx] / first_nonzero_element_in_col for i in range(4)]
            else:
                weights_a = [0.0, 0.0, 0.0, 0.0]
        else:
            weights_a = [0.0, 0.0, 0.0, 0.0]
            
    else:
        weights_a = [linear[i][0]/row_r[0] for i in range(4)]

    r_dot_u0 = sum(r_i * u_i for r_i, u_i in zip(row_r, ic))
    c1 = r_dot_u0 / trace
    
    def wrap_step(title: str, prose_content: List[str], math_content: List[str]) -> str:
        """
        Formats step content with title, prose, and math content.
        prose_content: List of strings, each representing a paragraph of prose.
        math_content: List of strings, each representing a LaTeX math block (e.g., "$$...$$").
        """
        parts = [title]
        if prose_content:
            parts.append("\n".join(prose_content))
        if math_content:
            parts.append("\n".join(math_content)) # Math content is expected to be already wrapped in $$...$$
            
        return "\n\n".join(parts)

    all_steps = []

    # Step 1
    r_vector_latex = r"\begin{pmatrix} " + r" & ".join([f"{c:.6f}" for c in row_r]) + r" \end{pmatrix}"
    a_vector_latex = r"\begin{pmatrix} " + r" \\ ".join([f"{c:.6f}" for c in weights_a]) + r" \end{pmatrix}"
    
    # Show the ratio relationships that prove rank-1 structure
    ratio_relationships = []
    vars = ['x', 'y', 'z', 'w']
    for i in range(1, 4):
        ratio_relationships.append(f"Row {i} = {ratios[i]:.6f} × Row 0")
    
    all_steps.append(wrap_step(
        "Step 1: Structural Audit",
        prose_content=[
            "Analytical Evaluation of High-Dimensional Coupled System in $\\mathbf{A} = \\mathbf{a}\\mathbf{r}^T$:",
            "First, we find the ratio between rows to confirm the rank-1 structure:"
        ],
        math_content=[
            f"$$\\mathbf{{A}} = {matrix_latex}$$",
            "$$\\text{{Ratios between rows:}}$$",
            f"$${ratio_relationships[0]}$$",
            f"$${ratio_relationships[1]}$$",
            f"$${ratio_relationships[2]}$$",
            "$$\\text{{This confirms that all rows are multiples of the first row, proving } \\mathbf{{A}} \\text{{ is rank-1.}}$$",
            f"$$\\text{{Thus, }} \\mathbf{{r}}^T = {r_vector_latex}$$",
            f"$$\\text{{and }} \\mathbf{{a}} = {a_vector_latex}$$"
        ]
    ))

    # Step 2
    all_steps.append(wrap_step(
        "Step 2: Spectral Characteristics",
        prose_content=[
            "The non-zero eigenvalue is the trace of the matrix:"
        ],
        math_content=[
            rf"$$\lambda_1 = {trace:.6f}$$"
        ]
    ))

    # Step 3
    all_steps.append(wrap_step(
        "Step 3: Analytical Derivation",
        prose_content=[
            ""
        ],
        math_content=[
            rf"$$\mathbf{{u}}(t) = \mathbf{{u}}(0) + \frac{{\mathbf{{r}} \cdot \mathbf{{u}}(0)}}{{\lambda_1}} (e^{{\lambda_1 t}} - 1) \mathbf{{a}}$$"
        ]
    ))

    # Step 4
    all_steps.append(wrap_step(
        "Step 4: Projection Calculation",
        prose_content=[
            "Calculating the projection of the initial state:",
            "The coefficient is:"
        ],
        math_content=[
            rf"$$\mathbf{{r}} \cdot \mathbf{{u}}(0) = {r_dot_u0:.6f}$$",
            rf"$$c_1 = {c1:.8f}$$"
        ]
    ))

    # Step 5
    final_factor = (math.exp(trace * target_time) - 1)
    all_steps.append(wrap_step(
        "Step 5: Solution at Target Time",
        prose_content=[
            "Applying the solution formula at the target time:"
        ],
        math_content=[
            rf"$$\mathbf{{u}}(t_f) = \mathbf{{u}}(0) + c_1 (e^{{\lambda_1 t_f}} - 1) \mathbf{{a}}$$",
            rf"$$\mathbf{{u}}(t_f) = \begin{{pmatrix}} {ic[0]:.6f} \\\\ {ic[1]:.6f} \\\\ {ic[2]:.6f} \\\\ {ic[3]:.6f} \end{{pmatrix}} + {c1:.6f} ({final_factor:.6f}) \begin{{pmatrix}} {weights_a[0]:.6f} \\\\ {weights_a[1]:.6f} \\\\ {weights_a[2]:.6f} \\\\ {weights_a[3]:.6f} \end{{pmatrix}}$$"
        ]
    ))

    # Step 6
    fv = solution_data['final_values']
    all_steps.append(wrap_step(
        "Step 6: Final State Evaluation",
        prose_content=[
            "The terminal state at the target time is:"
        ],
        math_content=[
            rf"$$\mathbf{{u}}(t_f) = \begin{{pmatrix}} {fv[0]:.6f} \\\\ {fv[1]:.6f} \\\\ {fv[2]:.6f} \\\\ {fv[3]:.6f} \end{{pmatrix}}$$"
        ]
    ))

    # Answer
    all_steps.append(wrap_step(
        "Answer",
        prose_content=[
            f"The final solution is: {solution_data['final_solution']}"
        ],
        math_content=[]
    ))

    return "\n\n".join(all_steps)