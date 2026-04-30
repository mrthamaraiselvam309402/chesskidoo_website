import re

with open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace file management
js = js.replace('      <div class="ck-filter-bar">', '''      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0; font-family:var(--font-display); font-size:2.5rem; color:var(--ink);">Document Library</h3>
      </div>
      <div class="ck-filter-bar">''')

# Replace meetings
js = js.replace('<div class="ck-card" style="width:100%; max-width:480px; padding:40px;">', '<div class="ck-card" style="width:100%; max-width:540px; padding:40px;">')
js = js.replace('Schedule Meeting Reminder', '📅 Schedule a Session')

# Replace attendance
js = js.replace('<h2 style="text-align:center; font-family:var(--font-display); margin-bottom:24px;">User Attendance</h2>', '<h2 style="text-align:center; font-family:var(--font-display); font-size:2.5rem; margin-bottom:24px; color:var(--ink);">Attendance Tracker</h2>')

# Replace users
js = js.replace('      <div class="ck-filter-bar" style="margin-bottom:24px;">', '''      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0; font-family:var(--font-display); font-size:2.5rem; color:var(--ink);">Student Roster</h3>
      </div>
      <div class="ck-filter-bar" style="margin-bottom:24px;">''')

# Replace tournaments
js = js.replace('<h3 style="margin:0;">Tournament Results</h3>', '<h3 style="margin:0; font-family:var(--font-display); font-size:2.5rem; color:var(--ink);">🏆 Tournament Results</h3>')

# Replace achievements
js = js.replace('<h3 style="margin:0;">Student Achievements</h3>', '<h3 style="margin:0; font-family:var(--font-display); font-size:2.5rem; color:var(--ink);">🎖 Student Achievements</h3>')

with open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
