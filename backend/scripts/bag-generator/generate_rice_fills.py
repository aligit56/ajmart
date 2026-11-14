import os
from PIL import Image

rice_slugs = [
    'seela-supreme',
    'seela-vip',
    'kainaat-1121-special',
    'kainaat-1121-basmati',
    'kainaat',
    'daghi-kainaat-1121',
    'short-grain-poona',
    'b-1-tota',
    'b-2-tota'
]

patches_dir = os.path.abspath('backend/scripts/bag-generator/guaranteed_pure_rice')
fills_dir = os.path.abspath('backend/scripts/bag-generator/rice_fills')
os.makedirs(fills_dir, exist_ok=True)

step_x = 145
step_y = 145
overlap = 35

for slug in rice_slugs:
    patch_path = os.path.join(patches_dir, f"{slug}.jpg")
    out_path = os.path.join(fills_dir, f"{slug}_fill.jpg")
    
    patch = Image.open(patch_path)
    pw, ph = patch.size
    
    # Calculate average color for background
    r_val = int(sum(patch.getchannel(0).getdata()) / (pw * ph))
    g_val = int(sum(patch.getchannel(1).getdata()) / (pw * ph))
    b_val = int(sum(patch.getchannel(2).getdata()) / (pw * ph))
    canvas = Image.new('RGB', (1000, 1000), (r_val, g_val, b_val))
    
    mask = Image.new('L', (pw, ph), 255)
    for x in range(pw):
        for y in range(ph):
            dx = min(x, pw - 1 - x)
            dy = min(y, ph - 1 - y)
            d = min(dx, dy)
            if d < overlap:
                alpha = int(255 * (d / overlap))
                mask.putpixel((x, y), alpha)
                
    tile_rgba = patch.convert('RGBA')
    
    for y in range(-20, 1000, step_y):
        for x in range(-20, 1000, step_x):
            t = tile_rgba.copy()
            if ((x // step_x) + (y // step_y)) % 2 == 1:
                t = t.transpose(Image.FLIP_LEFT_RIGHT)
            if (x // step_x) % 3 == 0:
                t = t.transpose(Image.FLIP_TOP_BOTTOM)
            t.putalpha(mask)
            canvas.paste(t, (x, y), t)
            
    canvas.save(out_path, quality=95)
    print(f"[OK] Created seamless fill for {slug}")

print("All rice fills created successfully.")
