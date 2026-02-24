#!/usr/bin/env python3
"""
Generate 8 themed background images for the Content Generator.
Each background is 1200x1200 with premium gradients, patterns, and effects.
"""

import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from pathlib import Path
import random
import math

def create_radial_gradient(size, center, colors, radius_factor=1.0):
    """Create a radial gradient."""
    width, height = size
    cx, cy = center
    max_radius = max(width, height) * radius_factor
    
    img = Image.new('RGB', size)
    draw = ImageDraw.Draw(img)
    
    steps = 256
    for i in range(steps):
        progress = i / (steps - 1)
        radius = max_radius * progress
        
        # Interpolate between colors
        if len(colors) == 2:
            r = int(colors[0][0] * (1-progress) + colors[1][0] * progress)
            g = int(colors[0][1] * (1-progress) + colors[1][1] * progress)
            b = int(colors[0][2] * (1-progress) + colors[1][2] * progress)
        else:
            # Multi-color gradient
            segment = progress * (len(colors) - 1)
            idx = int(segment)
            t = segment - idx
            if idx >= len(colors) - 1:
                r, g, b = colors[-1]
            else:
                c1, c2 = colors[idx], colors[idx + 1]
                r = int(c1[0] * (1-t) + c2[0] * t)
                g = int(c1[1] * (1-t) + c2[1] * t)
                b = int(c1[2] * (1-t) + c2[2] * t)
        
        color = (r, g, b)
        bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
        draw.ellipse(bbox, fill=color)
    
    return img

def add_noise_texture(img, intensity=0.15):
    """Add subtle noise texture overlay."""
    width, height = img.size
    noise = np.random.random((height, width, 3)) * intensity
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array += noise - intensity/2
    img_array = np.clip(img_array, 0, 1)
    return Image.fromarray((img_array * 255).astype(np.uint8))

def create_star_field(size, star_count=100):
    """Create a starry overlay."""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    for _ in range(star_count):
        x = random.randint(0, size[0])
        y = random.randint(0, size[1])
        brightness = random.randint(50, 255)
        size_var = random.choice([1, 1, 1, 2, 2, 3])  # Most stars are small
        
        color = (brightness, brightness, brightness, 200)
        if size_var == 1:
            draw.point((x, y), fill=color)
        else:
            draw.ellipse([x-size_var//2, y-size_var//2, x+size_var//2, y+size_var//2], fill=color)
    
    return img

def create_forge_spire(size=(1200, 1200)):
    """Deep orange/red gradient with ember particle effects, volcanic feel."""
    print("Creating Forge Spire background...")
    
    # Base radial gradient
    colors = [(80, 20, 0), (255, 100, 0), (255, 180, 50), (255, 220, 100)]
    base = create_radial_gradient(size, (size[0]//2, size[1]//2), colors, 0.8)
    
    # Add ember particles
    particles = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(particles)
    
    for _ in range(200):
        x = random.randint(0, size[0])
        y = random.randint(0, size[1])
        particle_size = random.choice([1, 2, 3, 4])
        brightness = random.randint(150, 255)
        
        color = (brightness, brightness//2, 0, 180)
        draw.ellipse([x-particle_size//2, y-particle_size//2, 
                     x+particle_size//2, y+particle_size//2], fill=color)
    
    # Composite
    base = base.convert('RGBA')
    base = Image.alpha_composite(base, particles)
    base = add_noise_texture(base.convert('RGB'), 0.1)
    
    return base

def create_violet_citadel(size=(1200, 1200)):
    """Purple/indigo gradient with arcane rune patterns, mystical."""
    print("Creating Violet Citadel background...")
    
    # Base gradient
    colors = [(20, 0, 40), (80, 20, 120), (140, 60, 200), (180, 120, 255)]
    base = create_radial_gradient(size, (size[0]//2, size[1]//2), colors, 0.9)
    
    # Add mystical glow spots
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    for _ in range(8):
        x = random.randint(100, size[0]-100)
        y = random.randint(100, size[1]-100)
        glow_size = random.randint(80, 150)
        
        for r in range(glow_size, 0, -5):
            alpha = max(0, 30 - r//3)
            color = (150, 100, 255, alpha)
            draw.ellipse([x-r//2, y-r//2, x+r//2, y+r//2], fill=color)
    
    base = base.convert('RGBA')
    base = Image.alpha_composite(base, overlay)
    base = add_noise_texture(base.convert('RGB'), 0.08)
    
    return base

def create_tidewatch(size=(1200, 1200)):
    """Deep blue/teal gradient with water ripple effects, oceanic depths."""
    print("Creating Tidewatch background...")
    
    # Base gradient
    colors = [(0, 20, 40), (0, 60, 100), (20, 120, 160), (40, 180, 220)]
    base = create_radial_gradient(size, (size[0]//2, size[1]//3), colors, 1.2)
    
    # Add ripple patterns
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Concentric ripples
    center_x, center_y = size[0]//2, size[1]//2
    for radius in range(50, max(size), 60):
        alpha = max(0, 40 - radius//50)
        color = (100, 200, 255, alpha)
        draw.ellipse([center_x-radius, center_y-radius, 
                     center_x+radius, center_y+radius], outline=color, width=2)
    
    base = base.convert('RGBA')
    base = Image.alpha_composite(base, overlay)
    base = add_noise_texture(base.convert('RGB'), 0.06)
    
    return base

def create_everhollow(size=(1200, 1200)):
    """Forest green gradient with leaf/vine patterns, nature magic."""
    print("Creating Everhollow background...")
    
    # Base gradient
    colors = [(10, 30, 10), (20, 80, 30), (40, 120, 50), (80, 160, 80)]
    base = create_radial_gradient(size, (size[0]//2, size[1]//2), colors, 0.9)
    
    # Add organic glow spots
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    for _ in range(12):
        x = random.randint(0, size[0])
        y = random.randint(0, size[1])
        glow_size = random.randint(60, 120)
        
        for r in range(glow_size, 0, -8):
            alpha = max(0, 25 - r//8)
            color = (100, 255, 150, alpha)
            draw.ellipse([x-r//2, y-r//2, x+r//2, y+r//2], fill=color)
    
    base = base.convert('RGBA')
    base = Image.alpha_composite(base, overlay)
    base = add_noise_texture(base.convert('RGB'), 0.07)
    
    return base

def create_solar_spire(size=(1200, 1200)):
    """Golden yellow/white gradient with radiant sun rays."""
    print("Creating Solar Spire background...")
    
    # Base radial gradient
    colors = [(60, 40, 0), (200, 150, 20), (255, 220, 80), (255, 250, 200)]
    base = create_radial_gradient(size, (size[0]//2, size[1]//2), colors, 0.7)
    
    # Add radiant rays
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    center_x, center_y = size[0]//2, size[1]//2
    for angle in range(0, 360, 15):  # Every 15 degrees
        end_x = center_x + math.cos(math.radians(angle)) * size[0]
        end_y = center_y + math.sin(math.radians(angle)) * size[1]
        
        color = (255, 255, 150, 30)
        draw.line([(center_x, center_y), (end_x, end_y)], fill=color, width=3)
    
    base = base.convert('RGBA')
    base = Image.alpha_composite(base, overlay)
    base = add_noise_texture(base.convert('RGB'), 0.05)
    
    return base

def create_heartstring_tower(size=(1200, 1200)):
    """Pink/rose gradient with flowing heart energy lines."""
    print("Creating Heartstring Tower background...")
    
    # Base gradient
    colors = [(40, 10, 30), (120, 40, 80), (200, 80, 140), (255, 150, 200)]
    base = create_radial_gradient(size, (size[0]//2, size[1]//2), colors, 0.8)
    
    # Add flowing energy lines
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Curved flowing lines
    for i in range(20):
        start_x = random.randint(0, size[0]//4)
        start_y = random.randint(0, size[1])
        
        points = []
        for t in range(0, 100, 5):
            x = start_x + t * 8 + 50 * math.sin(t * 0.1 + i)
            y = start_y + t * 2 + 30 * math.cos(t * 0.15 + i)
            if 0 <= x <= size[0] and 0 <= y <= size[1]:
                points.append((int(x), int(y)))
        
        if len(points) > 1:
            for j in range(len(points)-1):
                alpha = max(0, 60 - j * 2)
                color = (255, 150, 200, alpha)
                if j < len(points)-1:
                    draw.line([points[j], points[j+1]], fill=color, width=2)
    
    base = base.convert('RGBA')
    base = Image.alpha_composite(base, overlay)
    base = add_noise_texture(base.convert('RGB'), 0.06)
    
    return base

def create_palehowl_night(size=(1200, 1200)):
    """Dark navy/black gradient with tiny stars and a pale moon."""
    print("Creating Palehowl Night background...")
    
    # Base gradient
    colors = [(0, 0, 10), (10, 10, 30), (20, 20, 60), (40, 40, 80)]
    base = create_radial_gradient(size, (size[0]//3, size[1]//4), colors, 1.5)
    
    # Add stars
    stars = create_star_field(size, 150)
    base = base.convert('RGBA')
    base = Image.alpha_composite(base, stars)
    
    # Add pale moon
    moon_overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(moon_overlay)
    
    moon_x, moon_y = size[0] * 3//4, size[1] * 1//4
    moon_radius = 80
    
    # Moon glow
    for r in range(moon_radius + 40, moon_radius, -3):
        alpha = max(0, 15 - (r - moon_radius))
        color = (200, 200, 220, alpha)
        draw.ellipse([moon_x-r, moon_y-r, moon_x+r, moon_y+r], fill=color)
    
    # Moon body
    draw.ellipse([moon_x-moon_radius, moon_y-moon_radius, 
                 moon_x+moon_radius, moon_y+moon_radius], fill=(220, 220, 240, 200))
    
    base = Image.alpha_composite(base, moon_overlay)
    base = add_noise_texture(base.convert('RGB'), 0.04)
    
    return base

def create_caninosphere(size=(1200, 1200)):
    """Epic cosmic gradient, deep space purples/blues with nebula swirls."""
    print("Creating The Caninosphere background...")
    
    # Base cosmic gradient
    colors = [(5, 0, 15), (30, 10, 60), (80, 40, 120), (150, 80, 200), (100, 150, 255)]
    base = create_radial_gradient(size, (size[0]//3, size[1]//2), colors, 1.3)
    
    # Add nebula swirls
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Multiple nebula clouds
    for cloud in range(6):
        center_x = random.randint(100, size[0]-100)
        center_y = random.randint(100, size[1]-100)
        
        for layer in range(3):
            radius = random.randint(80, 200) + layer * 30
            color_variations = [
                (150, 100, 255, 20),  # Purple
                (100, 200, 255, 15),  # Blue
                (255, 150, 200, 10)   # Pink
            ]
            color = color_variations[layer % len(color_variations)]
            
            # Create organic cloud shape
            for angle in range(0, 360, 10):
                noise_factor = random.uniform(0.7, 1.3)
                point_radius = radius * noise_factor
                x = center_x + math.cos(math.radians(angle)) * point_radius
                y = center_y + math.sin(math.radians(angle)) * point_radius
                
                if 0 <= x <= size[0] and 0 <= y <= size[1]:
                    glow_size = 20 + layer * 10
                    draw.ellipse([x-glow_size, y-glow_size, x+glow_size, y+glow_size], fill=color)
    
    # Add distant stars
    stars = create_star_field(size, 200)
    
    base = base.convert('RGBA')
    base = Image.alpha_composite(base, overlay)
    base = Image.alpha_composite(base, stars)
    base = add_noise_texture(base.convert('RGB'), 0.08)
    
    return base

def main():
    """Generate all 8 background images."""
    output_dir = Path("/Users/vexornex28/.openclaw/workspace/order-of-86-website/content-bg")
    output_dir.mkdir(exist_ok=True)
    
    backgrounds = [
        ("forge-spire.png", create_forge_spire),
        ("violet-citadel.png", create_violet_citadel),
        ("tidewatch.png", create_tidewatch),
        ("everhollow.png", create_everhollow),
        ("solar-spire.png", create_solar_spire),
        ("heartstring-tower.png", create_heartstring_tower),
        ("palehowl-night.png", create_palehowl_night),
        ("caninosphere.png", create_caninosphere),
    ]
    
    print("🎨 Generating 8 wizardly background images...")
    print(f"Output directory: {output_dir}")
    
    for filename, create_func in backgrounds:
        print(f"\n🖼️  {filename}")
        bg_image = create_func()
        output_path = output_dir / filename
        bg_image.save(output_path, 'PNG')
        print(f"   ✅ Saved: {output_path}")
    
    print(f"\n🌟 All 8 backgrounds generated successfully!")
    print(f"   📁 Location: {output_dir}")

if __name__ == "__main__":
    main()