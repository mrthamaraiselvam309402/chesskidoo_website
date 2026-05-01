
import os
import re

def check_links():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all src and href
    links = re.findall(r'(?:src|href)=["\'](.*?)["\']', content)
    
    for link in links:
        if link.startswith('http') or link.startswith('data:') or link.startswith('#'):
            continue
        
        # Check if file exists
        path = link.split('?')[0].split('#')[0]
        if not os.path.exists(path):
            print(f"MISSING: {path}")

if __name__ == "__main__":
    check_links()
