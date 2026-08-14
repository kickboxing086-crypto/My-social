import os
import sys

# Try to import PIL. If not installed, install it.
try:
    from PIL import Image
except ImportError:
    print("PIL not found. Installing pillow...")
    os.system("pip install pillow")
    from PIL import Image

source_image = "/src/assets/images/hud_devs_official_logo_1786552223631.jpg"
public_dir = "/public"

if not os.path.exists(source_image):
    # Try finding the latest image in the folder
    import glob
    files = glob.glob("/src/assets/images/hud_devs_official_logo_*.jpg")
    if files:
        source_image = sorted(files)[-1]
        print(f"Using found image: {source_image}")
    else:
        print("Source image not found.")
        sys.exit(1)

# Ensure public dir exists
os.makedirs(public_dir, exist_ok=True)

try:
    img = Image.open(source_image)
    
    # Save 512x512 png
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(os.path.join(public_dir, "icon-512.png"), "PNG")
    print("Saved icon-512.png")
    
    # Save 192x192 png
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(public_dir, "icon-192.png"), "PNG")
    print("Saved icon-192.png")
    
    # Save general icon.png
    img.save(os.path.join(public_dir, "icon.png"), "PNG")
    print("Saved icon.png")
    
    print("All icons successfully created in PNG format!")
except Exception as e:
    print(f"Error converting image: {e}")
    sys.exit(1)
