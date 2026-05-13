with open('d:/MY/chessk/index.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'id="achievements"' in line or 'class="achievements"' in line:
            print(f"Line {i}: {line.strip()[:100]}")
