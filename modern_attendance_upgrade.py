import re
with open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the attendance calendar icons with beautiful status dots
js = js.replace('<div class="ck-cal-check">✓</div>', '<div class="ck-status-dot" style="width:8px; height:8px; background:white; border-radius:50%;"></div>')
js = js.replace('<div class="ck-cal-cross">✗</div>', '<div class="ck-status-dot" style="width:8px; height:8px; background:rgba(255,255,255,0.3); border-radius:50%;"></div>')

# Update the coach tab style in tabAttendance to use the new pill-style buttons
js = js.replace('ck-coach-tab', 'tab-btn')

with open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
