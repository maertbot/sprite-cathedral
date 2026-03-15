"""
Remove sage-green backgrounds from Gemini-generated tile PNGs.
Samples the top-left corner pixel as background color, then removes
all pixels within tolerance, with edge feathering for clean compositing.
"""
import sys, os, glob
from PIL import Image, ImageFilter
import numpy as np

TOLERANCE = 45  # color distance threshold
FEATHER_RADIUS = 2  # edge softening

def remove_bg(input_path, output_path, tolerance=TOLERANCE):
    img = Image.open(input_path).convert('RGBA')
    data = np.array(img, dtype=np.float32)
    
    # Sample background color from corners (average of 4 corners, 5x5 patches)
    h, w = data.shape[:2]
    corners = [
        data[0:5, 0:5, :3],
        data[0:5, w-5:w, :3],
        data[h-5:h, 0:5, :3],
        data[h-5:h, w-5:w, :3],
    ]
    bg_color = np.mean(np.concatenate([c.reshape(-1, 3) for c in corners], axis=0), axis=0)
    
    # Calculate color distance from background for each pixel
    diff = np.sqrt(np.sum((data[:, :, :3] - bg_color) ** 2, axis=2))
    
    # Create alpha mask: 0 where bg, 255 where content, gradient at edges
    alpha = np.clip((diff - tolerance * 0.5) / (tolerance * 0.5) * 255, 0, 255).astype(np.uint8)
    
    # Apply the alpha
    data[:, :, 3] = np.minimum(data[:, :, 3].astype(np.uint8), alpha)
    
    result = Image.fromarray(data.astype(np.uint8))
    
    # Light feather on alpha channel for smoother edges
    r, g, b, a = result.split()
    a = a.filter(ImageFilter.GaussianBlur(radius=FEATHER_RADIUS))
    result = Image.merge('RGBA', (r, g, b, a))
    
    result.save(output_path, 'PNG')
    return True

def main():
    asset_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'assets')
    
    results = []
    for subdir in ['buildings', 'props']:
        pattern = os.path.join(asset_dir, subdir, '*.png')
        for path in sorted(glob.glob(pattern)):
            name = os.path.basename(path)
            print(f'Processing {subdir}/{name}...', end=' ')
            try:
                remove_bg(path, path, TOLERANCE)
                # Verify: check that corners are now transparent
                img = Image.open(path).convert('RGBA')
                corner_alpha = np.array(img)[0:3, 0:3, 3].mean()
                status = 'PASS' if corner_alpha < 10 else f'WARN (corner alpha={corner_alpha:.0f})'
                print(status)
                results.append((f'{subdir}/{name}', status))
            except Exception as e:
                print(f'FAIL: {e}')
                results.append((f'{subdir}/{name}', f'FAIL: {e}'))
    
    print(f'\n--- Results ---')
    passes = sum(1 for _, s in results if s == 'PASS')
    print(f'{passes}/{len(results)} tiles processed successfully')
    for name, status in results:
        if status != 'PASS':
            print(f'  ⚠ {name}: {status}')

if __name__ == '__main__':
    main()
