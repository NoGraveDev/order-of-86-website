#!/usr/bin/env python3
"""
Remove solid color backgrounds from wizard dog images and make them transparent.
Samples corner pixel (5,5) to detect background color and replaces all similar pixels.
"""

import os
from PIL import Image
import numpy as np
from pathlib import Path

def rgb_distance(color1, color2):
    """Calculate Euclidean distance between two RGB colors."""
    # Convert to float to avoid overflow
    c1 = np.array(color1, dtype=np.float32)
    c2 = np.array(color2, dtype=np.float32)
    return np.sqrt(np.sum((c1 - c2) ** 2))

def remove_background(input_path, output_path, threshold=40):
    """
    Remove solid background from image by sampling corner pixel.
    
    Args:
        input_path: Path to input PNG image
        output_path: Path to save transparent PNG
        threshold: RGB distance threshold for background detection
    """
    # Open image and convert to RGBA
    img = Image.open(input_path).convert('RGBA')
    data = np.array(img)
    
    # Sample background color from corner pixel (5,5)
    bg_color = tuple(data[5, 5, :3])  # RGB only, ignore alpha
    print(f"  Background color detected: {bg_color}")
    
    # Create mask for pixels similar to background color
    height, width = data.shape[:2]
    
    for y in range(height):
        for x in range(width):
            pixel_color = tuple(data[y, x, :3])
            if rgb_distance(pixel_color, bg_color) <= threshold:
                data[y, x, 3] = 0  # Set alpha to 0 (transparent)
    
    # Create new image and save
    result_img = Image.fromarray(data, 'RGBA')
    result_img.save(output_path, 'PNG')
    print(f"  Saved: {output_path}")

def main():
    # Paths
    input_dir = Path("/Users/vexornex28/.openclaw/workspace/order-of-86-website/wizard-images")
    output_dir = Path("/Users/vexornex28/.openclaw/workspace/order-of-86-website/wizard-images-transparent")
    
    # Create output directory
    output_dir.mkdir(exist_ok=True)
    
    # Process all PNG files
    png_files = list(input_dir.glob("*.png"))
    print(f"Processing {len(png_files)} wizard images...")
    
    for i, png_file in enumerate(sorted(png_files), 1):
        print(f"\n[{i}/{len(png_files)}] Processing: {png_file.name}")
        
        output_path = output_dir / png_file.name
        
        try:
            remove_background(png_file, output_path)
        except Exception as e:
            print(f"  Error processing {png_file.name}: {e}")
    
    print(f"\n✅ Processing complete! {len(png_files)} images saved to {output_dir}")

if __name__ == "__main__":
    main()