#!/usr/bin/env python3
"""
Analyze numerical precision in ratio calculations for rank-1 matrices.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import math

def analyze_problematic_matrix_precision():
    """Analyze the precision of ratio calculations for the problematic matrix."""
    
    print("Precision Analysis of Problematic Matrix")
    print("=" * 60)
    
    # The problematic matrix from feedback
    matrix = [
        [0.004, -0.082, -0.197, 0.057],
        [-0.031, 0.614, 1.483, -0.431],
        [-0.023, 0.452, 1.090, -0.317],
        [0.029, -0.574, -1.384, 0.403]
    ]
    
    print("Matrix:")
    for i, row in enumerate(matrix):
        print(f"Row {i+1}: {[f'{x:.6f}' for x in row]}")
    
    print("\nHigh-Precision Ratio Analysis (10 decimal places):")
    print("-" * 50)
    
    # Check ratios between Row 2 and Row 1 with high precision
    row1 = matrix[0]
    row2 = matrix[1]
    
    ratios = []
    print("Row 2 vs Row 1 ratios:")
    for j in range(4):
        if abs(row1[j]) > 1e-10:
            ratio = row2[j] / row1[j]
            ratios.append(ratio)
            print(f"  k_{j+1} = {row2[j]:.10f} / {row1[j]:.10f} = {ratio:.10f}")
        else:
            print(f"  k_{j+1} = undefined (division by zero)")
    
    print(f"\nRatios: {[f'{r:.10f}' for r in ratios]}")
    print(f"Range: {max(ratios) - min(ratios):.10f}")
    print(f"Are ratios constant? {abs(max(ratios) - min(ratios)) < 1e-10}")
    
    # Check if this could be due to floating point precision
    print("\nFloating Point Precision Analysis:")
    print("-" * 40)
    
    # Calculate the differences between ratios
    print("Differences between ratios:")
    for i in range(len(ratios)):
        for j in range(i+1, len(ratios)):
            diff = abs(ratios[i] - ratios[j])
            print(f"  |k_{i+1} - k_{j+1}| = |{ratios[i]:.10f} - {ratios[j]:.10f}| = {diff:.10f}")
    
    # Check if ratios could be explained by rounding
    print("\nRounding Analysis:")
    print("-" * 20)
    avg_ratio = sum(ratios) / len(ratios)
    print(f"Average ratio: {avg_ratio:.10f}")
    
    print("Deviations from average:")
    for i, ratio in enumerate(ratios):
        deviation = abs(ratio - avg_ratio)
        print(f"  k_{i+1}: deviation = {deviation:.10f}")

def analyze_current_generation_precision():
    """Analyze the precision of ratio calculations for current generation."""
    
    print("\n" + "="*60)
    print("Precision Analysis of Current Generation")
    print("="*60)
    
    # Current generation logic
    import random
    random.seed(42)
    
    # Generate using current method
    r = [random.uniform(-1.0, 1.0) for _ in range(4)]
    a = [random.uniform(-1.5, 1.5) for _ in range(4)]
    
    if abs(sum(a)) < 0.1:
        a[0] += 0.5
    
    # Generate matrix with high precision
    matrix = []
    for i in range(4):
        row = []
        for j in range(4):
            element = float(a[i] * r[j])
            row.append(element)
        matrix.append(row)
    
    print("Generated matrix (current method):")
    for i, row in enumerate(matrix):
        print(f"Row {i+1}: {[f'{x:.10f}' for x in row]}")
    
    print("\nHigh-Precision Ratio Analysis:")
    print("-" * 40)
    
    # Check ratios with high precision
    base_row = matrix[0]
    print("Row ratios vs Row 1:")
    
    for i in range(1, 4):
        row = matrix[i]
        if all(abs(x) < 1e-10 for x in row):
            print(f"  Row {i+1}: all zeros (valid multiple)")
            continue
        
        # Find ratio using first non-zero element
        ratio = None
        for j in range(4):
            if abs(base_row[j]) > 1e-10:
                ratio = row[j] / base_row[j]
                break
        
        if ratio is not None:
            # Check if row = ratio * base_row with high precision
            matches = True
            max_error = 0.0
            for j in range(4):
                expected = ratio * base_row[j]
                error = abs(row[j] - expected)
                max_error = max(max_error, error)
                if error > 1e-15:  # Machine precision for double
                    matches = False
            
            print(f"  Row {i+1}: ratio = {ratio:.10f}, max_error = {max_error:.2e}, matches = {matches}")

def check_if_problematic_matrix_could_be_rank_1():
    """Check if the problematic matrix could be rank-1 with different interpretation."""
    
    print("\n" + "="*60)
    print("Could Problematic Matrix Be Rank-1?")
    print("="*60)
    
    # The problematic matrix
    matrix = [
        [0.004, -0.082, -0.197, 0.057],
        [-0.031, 0.614, 1.483, -0.431],
        [-0.023, 0.452, 1.090, -0.317],
        [0.029, -0.574, -1.384, 0.403]
    ]
    
    print("Testing if this matrix could be rank-1 with different interpretation...")
    
    # Try to find vectors a and r such that A[i][j] = a[i] * r[j]
    # This is a system of equations that should be consistent for rank-1
    
    # From A[0][0] = a[0] * r[0], we get a[0] = A[0][0] / r[0]
    # From A[0][1] = a[0] * r[1], we get r[1] = A[0][1] * r[0] / A[0][0]
    # And so on...
    
    # Let's assume r[0] = 1 and try to reconstruct
    r0 = 1.0
    r = [0.0] * 4
    a = [0.0] * 4
    
    r[0] = r0
    a[0] = matrix[0][0] / r[0]
    
    # Fill in r from first row
    for j in range(1, 4):
        r[j] = matrix[0][j] / a[0]
    
    # Fill in a from first column
    for i in range(1, 4):
        a[i] = matrix[i][0] / r[0]
    
    print("Reconstructed vectors:")
    print(f"  a = {[f'{x:.10f}' for x in a]}")
    print(f"  r = {[f'{x:.10f}' for x in r]}")
    
    # Check if this reconstruction matches the original matrix
    reconstructed = []
    for i in range(4):
        row = []
        for j in range(4):
            row.append(a[i] * r[j])
        reconstructed.append(row)
    
    print("\nReconstructed matrix:")
    for i, row in enumerate(reconstructed):
        print(f"Row {i+1}: {[f'{x:.10f}' for x in row]}")
    
    print("\nOriginal matrix:")
    for i, row in enumerate(matrix):
        print(f"Row {i+1}: {[f'{x:.10f}' for x in row]}")
    
    # Check differences
    print("\nDifferences (original - reconstructed):")
    max_diff = 0.0
    for i in range(4):
        for j in range(4):
            diff = matrix[i][j] - reconstructed[i][j]
            max_diff = max(max_diff, abs(diff))
            if abs(diff) > 1e-10:
                print(f"  A[{i}][{j}]: diff = {diff:.10f}")
    
    print(f"\nMaximum difference: {max_diff:.10f}")
    print(f"Is rank-1 (within tolerance): {max_diff < 1e-10}")

if __name__ == '__main__':
    analyze_problematic_matrix_precision()
    analyze_current_generation_precision()
    check_if_problematic_matrix_could_be_rank_1()