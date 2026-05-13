import os
for root, dirs, files in os.walk('d:/MY/chessk/assets/js'):
    for file in files:
        if file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                for i, line in enumerate(f, 1):
                    if 'scroll' in line.lower():
                        print(f"{file} L{i}: {line.strip()}")
