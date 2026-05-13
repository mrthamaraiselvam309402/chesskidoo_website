import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('d:/MY/chessk/assets/css/style.css', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if '--cream' in line or 'background' in line or 'background-color' in line:
            if i < 150: # Check variables and top section
                print(f"Line {i}: {line.strip()[:120]}")
