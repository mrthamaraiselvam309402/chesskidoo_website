import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('d:/MY/chessk/assets/css/style.css', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'login' in line.lower():
            clean_line = line.strip().encode('ascii', 'replace').decode('ascii')
            print(f"Line {i}: {clean_line[:120]}")
