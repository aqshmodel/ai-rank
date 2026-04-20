import os
import sys
from PIL import Image

def process_image(input_path, output_path):
    with Image.open(input_path) as img:
        img = img.convert("RGB")
        width, height = img.size
        # target slightly wider than 16:9 (1.904)
        target_ratio = 1200 / 630
        current_ratio = width / height
        
        if current_ratio > target_ratio:
            new_width = int(target_ratio * height)
            left = (width - new_width) / 2
            right = left + new_width
            img = img.crop((left, 0, right, height))
        else:
            new_height = int(width / target_ratio)
            top = (height - new_height) / 2
            bottom = top + new_height
            img = img.crop((0, top, width, bottom))
            
        img = img.resize((1200, 630), Image.Resampling.LANCZOS)
        
        # Save as WEBP under 100KB
        q = 90
        while True:
            img.save(output_path, "WEBP", quality=q, method=6)
            size_kb = os.path.getsize(output_path) / 1024
            if size_kb <= 100 or q <= 10:
                break
            q -= 5
            
        print(f"Saved {output_path}. Size: {size_kb:.1f}KB, Quality: {q}")

if __name__ == "__main__":
    process_image(sys.argv[1], sys.argv[2])
