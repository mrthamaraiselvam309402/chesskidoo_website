with open('d:/MY/chessk/index.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'level-card' in line or 'level-grid' in line or 'level-piece' in line or 'level-rank' in line:
            # Check if this line is outside the section id="levels"
            if i < 240 or i > 310:
                print(f"Line {i}: {line.strip()[:100]}")
