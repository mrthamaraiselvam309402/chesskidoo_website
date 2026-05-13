with open('d:/MY/chessk/index.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'id="login-page"' in line or 'login-box' in line:
            print(f"Line {i}: {line.strip()[:100]}")
