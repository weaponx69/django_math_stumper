#!/usr/bin/env python3
"""
Test script to verify if the ODE generator is creating rank-1 matrices.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from ode_solver.services import ODEGenerator

def test_rank_one_generation():
    """Test if the generated matrices are actually rank-1."""
    
    generator = ODEGenerator()
    
    print("Testing ODE Generator for Rank-1 Matrix Generation")
    print("=" * 60)
    
    for test_num in range(5):
        print(f"\nTest {test_num + 1}:")
        print("-" * 20)
        
        # Generate a task
        task = generator.generate_valid_ode_task()
        
        if task is None:
            print("Failed to generate task")
            continue
            
        # Extract the matrix
        coefficients = task['coefficients']
        matrix = np.array(coefficients['linear'])
        
        print(f"Generated matrix:")
        print(matrix)
        
        # Check rank
        rank = np.linalg.matrix_rank(matrix)
        print(f"Matrix rank: {rank}")
        
        # Check if rank is 1
        is_rank_one = rank == 1
        print(f"Is rank-1: {is_rank_one}")
        
        # Check trace
        trace = np.trace(matrix)
        print(f"Trace: {trace:.6f}")
        
        # Check if rows are multiples of each other
        if matrix.shape[0] > 1:
            print("Row relationships:")
            base_row = matrix[0]
            print(f"Row 0: {base_row}")
            
            for i in range(1, matrix.shape[0]):
                row = matrix[i]
                # Check if row i is a multiple of row 0
                if np.allclose(base_row, 0):
                    is_multiple = np.allclose(row, 0)
                else:
                    # Find the ratio
                    non_zero_idx = np.where(base_row != 0)[0]
                    if len(non_zero_idx) > 0:
                        ratio = row[non_zero_idx[0]] / base_row[non_zero_idx[0]]
                        expected_row = ratio * base_row
                        is_multiple = np.allclose(row, expected_row)
                        print(f"  Row {i}: {row} (ratio: {ratio:.6f}, multiple: {is_multiple})")
                    else:
                        is_multiple = np.allclose(row, 0)
                        print(f"  Row {i}: {row} (multiple: {is_multiple})")
        
        # Check eigenvalues
        try:
            eigenvals = np.linalg.eigvals(matrix)
            print(f"Eigenvalues: {eigenvals}")
            # For rank-1 matrix, only one eigenvalue should be non-zero
            non_zero_eigenvals = [ev for ev in eigenvals if abs(ev) > 1e-10]
            print(f"Non-zero eigenvalues: {len(non_zero_eigenvals)}")
        except:
            print("Could not compute eigenvalues")
        
        print(f"Result: {'PASS' if is_rank_one else 'FAIL'}")
        
        if not is_rank_one:
            print("ERROR: Matrix is not rank-1!")
            return False
    
    print("\n" + "=" * 60)
    print("All tests passed! The app IS generating rank-1 matrices.")
    return True

def test_manual_rank_one():
    """Test with a manually created rank-1 matrix to verify our testing logic."""
    print("\nTesting with manually created rank-1 matrix:")
    print("-" * 50)
    
    # Create a rank-1 matrix manually
    a = np.array([1.5, -0.8, 2.1, 0.6])
    r = np.array([0.8, -0.5, 1.2, -0.3])
    manual_matrix = np.outer(a, r)
    
    print(f"Manual rank-1 matrix:")
    print(manual_matrix)
    
    rank = np.linalg.matrix_rank(manual_matrix)
    print(f"Rank: {rank}")
    print(f"Is rank-1: {rank == 1}")
    
    # Check trace vs sum(a*r)
    trace = np.trace(manual_matrix)
    sum_ar = sum(a[i] * r[i] for i in range(4))
    print(f"Trace: {trace:.6f}")
    print(f"Sum(a*r): {sum_ar:.6f}")
    print(f"Trace matches sum(a*r): {abs(trace - sum_ar) < 1e-10}")

if __name__ == '__main__':
    test_manual_rank_one()
    test_rank_one_generation()