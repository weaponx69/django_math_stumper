#!/usr/bin/env python3
"""
Analyze the legacy data format vs current rank-1 generation format.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import random
import math

def analyze_legacy_format():
    """Analyze the legacy data format from the database."""
    
    print("Analysis of Legacy Data Format vs Current Rank-1 Format")
    print("=" * 60)
    
    # Legacy format from database
    legacy_data = {
        'linear': [1.6039921924236098, 1.307106244435146, -1.6856168767526487, 1.9345443733017351],
        'cross': [-0.04266003836386223, -0.16289893925594057, 0.04822165309565252, 0.304548117355534, 0.40051878092606996, 0.24368391750868068],
        'quadratic': [-0.2668200717476129, -0.03670010714489258, 0.3172167339742775, 0.42801343968279626],
        'cubic': [0.04610778832956139, -0.032265493636888715, 0.015074825139351586, -0.0193122244118569]
    }
    
    print("Legacy Data Format:")
    print(f"  Linear: {legacy_data['linear']}")
    print(f"  Cross: {legacy_data['cross']}")
    print(f"  Quadratic: {legacy_data['quadratic']}")
    print(f"  Cubic: {legacy_data['cubic']}")
    
    # Current format
    print("\nCurrent Rank-1 Format:")
    print("  Linear: 4x4 matrix where A[i][j] = a[i] * r[j]")
    print("  Cross: Not used (set to [0,0,0,0,0,0])")
    print("  Quadratic: Not used (set to [0,0,0,0])")
    print("  Cubic: Not used (set to [0,0,0,0])")
    
    print("\nKey Differences:")
    print("1. Legacy uses flat arrays, current uses 4x4 matrix")
    print("2. Legacy includes nonlinear terms, current is purely linear")
    print("3. Legacy is NOT rank-1, current IS rank-1 by construction")
    
    # Check if legacy data could be rank-1
    print("\nChecking if legacy data could be rank-1:")
    linear_flat = legacy_data['linear']
    
    # Try to interpret as 4x4 matrix (legacy might be row-major)
    matrix = []
    for i in range(4):
        row = []
        for j in range(4):
            if i*4 + j < len(linear_flat):
                row.append(linear_flat[i*4 + j])
            else:
                row.append(0.0)
        matrix.append(row)
    
    print("Legacy matrix (if interpreted as 4x4):")
    for i, row in enumerate(matrix):
        print(f"Row {i+1}: {[f'{x:.6f}' for x in row]}")
    
    # Check rank
    is_rank_1 = check_rank_1(matrix)
    print(f"Is rank-1: {is_rank_1}")
    
    if not is_rank_1:
        print("CONCLUSION: Legacy data is NOT rank-1 and uses different generation logic.")

def check_rank_1(matrix):
    """Check if matrix is rank-1."""
    
    # Find first non-zero row
    base_row_idx = -1
    for i in range(4):
        if any(abs(x) > 1e-10 for x in matrix[i]):
            base_row_idx = i
            break
    
    if base_row_idx == -1:
        return False
    
    base_row = matrix[base_row_idx]
    
    all_multiples = True
    for i in range(4):
        if i == base_row_idx:
            continue
            
        row = matrix[i]
        if all(abs(x) < 1e-10 for x in row):
            continue
        
        # Find ratio
        ratio = None
        for j in range(4):
            if abs(base_row[j]) > 1e-10:
                ratio = row[j] / base_row[j]
                break
        
        if ratio is None:
            all_multiples = False
            continue
        
        # Check if row = ratio * base_row
        matches = True
        for j in range(4):
            expected = ratio * base_row[j]
            if abs(row[j] - expected) > 1e-10:
                matches = False
                break
        
        if not matches:
            all_multiples = False
    
    return all_multiples

def demonstrate_current_generation():
    """Demonstrate current rank-1 generation."""
    
    print("\n" + "="*60)
    print("Current Rank-1 Generation (CORRECT)")
    print("="*60)
    
    # Set seed for reproducible testing
    random.seed(42)
    
    # Rank-one matrix A = a * r^T
    r = [random.uniform(-1.0, 1.0) for _ in range(4)]
    a = [random.uniform(-1.5, 1.5) for _ in range(4)]
    
    # Ensure sum(a) isn't zero
    if abs(sum(a)) < 0.1:
        a[0] += 0.5
    
    # Generate matrix
    matrix = []
    for i in range(4):
        row = []
        for j in range(4):
            element = float(a[i] * r[j])
            row.append(element)
        matrix.append(row)
    
    print("Generated rank-1 matrix:")
    for i, row in enumerate(matrix):
        print(f"Row {i+1}: {[f'{x:.6f}' for x in row]}")
    
    is_rank_1 = check_rank_1(matrix)
    print(f"Is rank-1: {is_rank_1}")
    
    if is_rank_1:
        print("✓ Current generation produces correct rank-1 matrices")

if __name__ == '__main__':
    analyze_legacy_format()
    demonstrate_current_generation()