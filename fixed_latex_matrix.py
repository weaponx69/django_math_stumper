#!/usr/bin/env python3
"""
Script to generate the correct MathJax LaTeX for a rank-1 matrix.
This demonstrates the fix for the rank-1 matrix issue.
"""

import numpy as np

def generate_rank_one_matrix():
    """Generate a proper rank-1 matrix and show the correct LaTeX."""
    
    # Generate rank-one matrix A = a * r^T
    # This ensures every row is a multiple of the base row
    
    # Base row (r vector)
    r = np.array([0.8, -0.5, 1.2, -0.3])
    
    # Weights (a vector) 
    a = np.array([1.5, -0.8, 2.1, 0.6])
    
    # Create rank-one matrix: A = a * r^T
    matrix = np.outer(a, r)
    
    print("Generated Rank-One Matrix:")
    print(matrix)
    print()
    
    # Verify it's rank-one
    rank = np.linalg.matrix_rank(matrix)
    print(f"Matrix rank: {rank}")
    print()
    
    # Show the correct LaTeX representation
    latex_matrix = r"\begin{pmatrix}"
    for i in range(4):
        row_str = " & ".join([f"{matrix[i,j]:.3f}" for j in range(4)])
        latex_matrix += f" {row_str} \\\\"
    latex_matrix += r" \end{pmatrix}"
    
    print("Correct MathJax LaTeX:")
    print(latex_matrix)
    print()
    
    # Show the factorization
    print("Rank-One Factorization:")
    print(f"A = a * r^T where:")
    print(f"a = [{a[0]:.3f}, {a[1]:.3f}, {a[2]:.3f}, {a[3]:.3f}]^T")
    print(f"r = [{r[0]:.3f}, {r[1]:.3f}, {r[2]:.3f}, {r[3]:.3f}]^T")
    print()
    
    # Verify each row is a multiple of the base row
    print("Row Verification (each row should be a_i * r):")
    for i in range(4):
        row_multiple = a[i] * r
        print(f"Row {i+1}: {matrix[i,:]} = {a[i]:.3f} * {r}")
        print(f"  Match: {np.allclose(matrix[i,:], row_multiple)}")
    
    return matrix, latex_matrix

def get_correct_latex_for_services():
    """Generate the corrected LaTeX matrix for the services.py file."""
    
    # This is the corrected LaTeX matrix format
    correct_latex = r"""
                        $$ 
                        \begin{aligned}
                        &\textbf{Step 0: Structural Audit and Matrix Rank} \\
                        &\mathbf{A} = \begin{pmatrix} 
                        0.800 & -0.500 & 1.200 & -0.300 \\
                        -0.400 & 0.250 & -0.600 & 0.150 \\
                        1.680 & -1.050 & 2.520 & -0.630 \\
                        0.480 & -0.300 & 0.720 & -0.180 
                        \end{pmatrix} \\
                        &\text{This matrix has rank-one structure: } \mathbf{A} = \mathbf{a}\mathbf{r}^\top \text{ where:} \\
                        &\mathbf{a} = [1.000, -0.500, 2.100, 0.600]^\top \text{ (column weights)} \\
                        &\mathbf{r} = [0.800, -0.500, 1.200, -0.300]^\top \text{ (base row)} \\
                        &\text{Verification: Row } i \text{ of } \mathbf{A} = a_i \cdot \mathbf{r}. \\
                        &\text{This confirms } \text{rank}(\mathbf{A}) = 1\text{. The entire image is spanned by } \mathbf{v}_1 = \mathbf{a}.
                        \end{aligned} 
                        $$
                        """
    
    return correct_latex

if __name__ == '__main__':
    matrix, latex = generate_rank_one_matrix()
    print("\n" + "="*60)
    print("CORRECTED LATEX FOR YOUR SERVICES.PY FILE:")
    print("="*60)
    print(get_correct_latex_for_services())