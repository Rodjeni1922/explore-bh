import os
import unicodedata
import re

folder = "location_images"   # change path if needed

def normalize_filename(name):
    # Remove extension
    base, ext = os.path.splitext(name)

    # Normalize accented characters → ASCII
    base = unicodedata.normalize('NFKD', base).encode('ascii', 'ignore').decode()

    # Replace anything not a-z, A-Z, 0-9 with underscore
    base = re.sub(r'[^a-zA-Z0-9]+', '_', base)

    # Lowercase
    base = base.lower()

    # Remove double underscores
    base = re.sub(r'_+', '_', base)

    # Strip edges
    base = base.strip('_')

    return base + ext.lower()

for file in os.listdir(folder):
    old_path = os.path.join(folder, file)
    if not os.path.isfile(old_path):
        continue

    new_name = normalize_filename(file)
    new_path = os.path.join(folder, new_name)

    if old_path != new_path:
        print(f"Renaming: {file} → {new_name}")
        os.rename(old_path, new_path)

print("Done!")
