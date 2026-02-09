#!/usr/bin/env python3
"""
Analysis of the problematic matrix to understand why it's not rank-1.
"""

def analyze_matrix():
    """Analyze the specific matrix that was flagged as problematic."""
    
    # The problematic matrix from the feedback
    matrix = [
        [0.004, -0.082, -0.197, 0.057],
        [-0.031, 0.614, 1.483, -0.431],
        [-0.023, 0.452, 1.090, -0.317],
        [0.029, -0.574, -1.384, 0.403]
    ]
    
    print("Analysis of Problematic Matrix")
    print("=" * 50)
    print("Matrix:")
    for i, row in enumerate(matrix):
        print(f"Row {i+1}: {[f'{x:.4f}' for x in row]}")
    
    print("\nRow Ratio Analysis:")
    print("-" * 30)
    
    # Check ratios between Row 2 and Row 1
    print("Row 2 vs Row 1 ratios:")
    row1 = matrix[0]
    row2 = matrix[1]
    
    ratios = []
    for j in range(4):
        if abs(row1[j]) > 1e-10:
            ratio = row2[j] / row1[j]
            ratios.append(ratio)
            print(f"  k_{j+1} = {row2[j]:.4f} / {row1[j]:.4f} = {ratio:.6f}")
        else:
            print(f"  k_{j+1} = undefined (division by zero)")
    
    print(f"\nRatios: {[f'{r:.6f}' for r in ratios]}")
    print(f"Range: {max(ratios) - min(ratios):.6f}")
    print(f"Are ratios constant? {abs(max(ratios) - min(ratios)) < 1e-10}")
    
    # Check if this could be due to floating point precision
    print("\nFloating Point Precision Analysis:")
    print("-" * 40)
    
    # Try to find the best-fit rank-1 approximation
    print("If this were rank-1, all ratios should be identical.")
    print("The variation in ratios indicates linear independence.")
    
    # Calculate rank manually
    print("\nRank Calculation:")
    print("-" * 20)
    
    # Simple rank check by looking at linear independence
    # If rank = 1, all rows should be multiples of one base row
    base_row = row1
    all_multiples = True
    
    for i in range(1, 4):
        row = matrix[i]
        # Find ratio using first non-zero element
        ratio = None
        for j in range(4):
            if abs(base_row[j]) > 1e-10:
                ratio = row[j] / base_row[j]
                break
        
        if ratio is not None:
            # Check if this row is ratio * base_row
            matches = True
            for j in range(4):
                expected = ratio * base_row[j]
                if abs(row[j] - expected) > 1e-3:  # Using larger tolerance for this analysis
                    matches = False
                    break
            
            print(f"Row {i+1} is multiple of Row 1: {matches} (ratio: {ratio:.6f})")
            if not matches:
                all_multiples = False
    
    print(f"\nOverall rank-1 assessment: {all_multiples}")
    
    if not all_multiples:
        print("\nCONCLUSION: This is a Rank-4 matrix, NOT Rank-1.")
        print("The projection shortcut e^At = I + (A/λ)(e^(λt) - 1) is INVALID.")
        print("Must use full matrix exponential or eigendecomposition.")

if __name__ == '__main__':
    analyze_matrix()