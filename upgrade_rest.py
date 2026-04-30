import re

# Update coach.js
with open('assets/js/coach.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('<h3 style="margin:0;">My Roster', '<h3 style="margin:0; font-family:var(--font-display); font-size:2rem; color:var(--ink);">My Roster')
c = c.replace('<h3 style="margin:0;">Mark Attendance</h3>', '<h3 style="margin:0; font-family:var(--font-display); font-size:2.5rem; color:var(--ink);">Attendance Tracker</h3>')
c = c.replace('<h3 style="margin:0;">My Shared Resources', '<h3 style="margin:0; font-family:var(--font-display); font-size:2rem; color:var(--ink);">My Shared Resources')
with open('assets/js/coach.js', 'w', encoding='utf-8') as f:
    f.write(c)

# Update student.js
with open('assets/js/student.js', 'r', encoding='utf-8') as f:
    s = f.read()
s = s.replace('<h3 style="margin-bottom:20px;">Study Materials</h3>', '<h3 style="margin-bottom:20px; font-family:var(--font-display); font-size:2rem; color:var(--ink);">Study Materials</h3>')
with open('assets/js/student.js', 'w', encoding='utf-8') as f:
    f.write(s)
