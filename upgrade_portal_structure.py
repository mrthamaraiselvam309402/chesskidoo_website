import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Admin Portal Structure Upgrade
admin_old = '<div id="admin-dashboard-content"></div>'
admin_new = """<div class="dashboard-shell">
        <main class="dashboard-main" id="admin-dashboard-content"></main>
      </div>"""

# Student Portal Structure Upgrade
student_old = '<div id="student-dashboard-content"></div>'
student_new = """<div class="dashboard-shell">
        <main class="dashboard-main" id="student-dashboard-content"></main>
      </div>"""

html = html.replace(admin_old, admin_new)
html = html.replace(student_old, student_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
