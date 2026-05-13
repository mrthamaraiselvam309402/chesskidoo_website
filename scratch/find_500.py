import sys
with open('d:/MY/chessk/index.html', 'r', encoding='utf-8') as f:
    results = []
    for i, line in enumerate(f, 1):
        if '500+' in line or '500' in line:
            results.append(f"Line {i}: {line.strip()}")
            
with open('d:/MY/chessk/scratch/find_500_results.txt', 'w', encoding='utf-8') as out:
    out.write('\n'.join(results))
print("Done")
