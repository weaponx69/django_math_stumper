#!/usr/bin/env python3
"""
Simple test script to verify if the ODE generator is creating rank-1 matrices.
Uses only built-in Python modules.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import math
from ode_solver.services import ODEGenerator

def matrix_rank_simple(matrix):
    """Simple rank calculation for 4x4 matrices."""
    # For a 4x4 matrix to be rank-1, all 2x2 minors must be zero
    # and at least one element must be non-zero
    
    n = len(matrix)
    if n != 4:
        return 0
    
    # Check if all rows are multiples of the first non-zero row
    # Find first non-zero row
    base_row_idx = -1
    for i in range(4):
        if any(abs(x) > 1e-10 for x in matrix[i]):
            base_row_idx = i
            break
    
    if base_row_idx == -1:
        return 0  # All zeros, rank 0
    
    base_row = matrix[base_row_idx]
    
    # Check if all other rows are multiples of base_row
    for i in range(4):
        if i == base_row_idx:
            continue
            
        row = matrix[i]
        
        # Check if row is all zeros
        if all(abs(x) < 1e-10 for x in row):
            continue
            
        # Find ratio
        ratio = None
        for j in range(4):
            if abs(base_row[j]) > 1e-10:
                ratio = row[j] / base_row[j]
                break
        
        if ratio is None:
            # base_row is all zeros, but row is not - impossible case
            return 2
        
        # Check if row = ratio * base_row
        for j in range(4):
            expected = ratio * base_row[j]
            if abs(row[j] - expected) > 1e-10:
                return 2  # Not a multiple, so rank > 1
    
    return 1

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
        matrix = coefficients['linear']
        
        print(f"Generated matrix:")
        for row in matrix:
            print([f"{x:.6f}" for x in row])
        
        # Check rank using our simple method
        rank = matrix_rank_simple(matrix)
        print(f"Matrix rank: {rank}")
        
        # Check if rank is 1
        is_rank_one = rank == 1
        print(f"Is rank-1: {is_rank_one}")
        
        # Check trace
        trace = sum(matrix[i][i] for i in range(4))
        print(f"Trace: {trace:.6f}")
        
        # Check if rows are multiples of each other
        print("Row relationships:")
        base_row_idx = -1
        for i in range(4):
            if any(abs(x) > 1e-10 for x in matrix[i]):
                base_row_idx = i
                break
        
        if base_row_idx != -1:
            base_row = matrix[base_row_idx]
            print(f"Base row {base_row_idx}: {[f'{x:.6f}' for x in base_row]}")
            
            for i in range(4):
                if i == base_row_idx:
                    continue
                row = matrix[i]
                if any(abs(x) > 1e-10 for x in row):
                    # Find ratio
                    ratio = None
                    for j in range(4):
                        if abs(base_row[j]) > 1e-10:
                            ratio = row[j] / base_row[j]
                            break
                    if ratio is not None:
                        print(f"  Row {i}: ratio = {ratio:.6f}")
                        expected_row = [ratio * base_row[j] for j in range(4)]
                        matches = all(abs(row[j] - expected_row[j]) < 1e-10 for j in range(4))
                        print(f"    Expected: {[f'{x:.6f}' for x in expected_row]}")
                        print(f"    Actual:   {[f'{x:.6f}' for x in row]}")
                        print(f"    Matches: {matches}")
        
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
    
    # Create a rank-1 matrix manually: A = a * r^T
    a = [1.5, -0.8, 2.1, 0.6]
    r = [0.8, -0.5, 1.2, -0.3]
    
    manual_matrix = []
    for i in range(4):
        row = []
        for j in range(4):
            row.append(a[i] * r[j])
        manual_matrix.append(row)
    
    print("Manual rank-1 matrix:")
    for row in manual_matrix:
        print([f"{x:.6f}" for x in row])
    
    rank = matrix_rank_simple(manual_matrix)
    print(f"Rank: {rank}")
    print(f"Is rank-1: {rank == 1}")
    
    # Check trace vs sum(a*r)
    trace = sum(manual_matrix[i][i] for i in range(4))
    sum_ar = sum(a[i] * r[i] for i in range(4))
    print(f"Trace: {trace:.6f}")
    print(f"Sum(a*r): {sum_ar:.6f}")
    print(f"Trace matches sum(a*r): {abs(trace - sum_ar) < 1e-10}")

if __name__ == '__main__':
    test_manual_rank_one()
    test_rank_one_generation()