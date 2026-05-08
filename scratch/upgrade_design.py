import re

def update_index_html():
    with open('d:/MY/chessk/index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Add WhatsApp Floating Widget
    whatsapp_widget = """
  <!-- WhatsApp Floating Widget -->
  <a href="https://wa.me/1234567890" target="_blank" class="whatsapp-widget" style="position:fixed; bottom:20px; left:20px; background:#25D366; color:white; width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; box-shadow:0 4px 15px rgba(37,211,102,0.4); z-index:9999; text-decoration:none; transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
    <span style="transform: translateY(-2px);">💬</span>
  </a>
"""
    if 'whatsapp-widget' not in html:
        html = html.replace('</body>', whatsapp_widget + '\n</body>')

    # 2. Add Tournaments and Achievements Tabs to Admin
    if 'CK.admin.showPanel(\'tournaments\')' not in html:
        html = html.replace(
            '<button class="p-nav-item" onclick="CK.admin.showPanel(\'files\')">',
            '<button class="p-nav-item" onclick="CK.admin.showPanel(\'tournaments\')">\n              <span class="icon">🏆</span><span>Tournaments</span>\n            </button>\n            <button class="p-nav-item" onclick="CK.admin.showPanel(\'achievements\')">\n              <span class="icon">⭐</span><span>Achievements</span>\n            </button>\n            <button class="p-nav-item" onclick="CK.admin.showPanel(\'files\')">'
        )

    # 3. Add Tournaments Tab to Student
    if 'CK.student.nav(\'tournaments\')' not in html:
        html = html.replace(
            '<button class="p-nav-item" onclick="CK.student.nav(\'achievements\')">',
            '<button class="p-nav-item" onclick="CK.student.nav(\'tournaments\')"><span class="icon">🏅</span><span>Tournaments</span></button>\n            <button class="p-nav-item" onclick="CK.student.nav(\'achievements\')">'
        )

    # 4. Implement Tournaments & Achievements UI in Admin
    admin_panels = """
            <!-- ══ TOURNAMENTS PANEL ══ -->
            <div class="p-panel" id="p-panel-tournaments">
              <div class="p-card">
                <div class="p-card-header">
                  <div class="p-card-title">🏆 Tournament Management</div>
                  <button class="p-btn p-btn-gold p-btn-sm">+ Create Tournament</button>
                </div>
                <div class="p-card-body">
                  <table class="p-table">
                    <thead><tr><th>Name</th><th>Date</th><th>Format</th><th>Participants</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>Summer Open 2026</td><td>Aug 15, 2026</td><td>Swiss</td><td>42</td><td><span class="p-badge p-badge-blue">Upcoming</span></td></tr>
                      <tr><td>Weekly Blitz Arena</td><td>Every Friday</td><td>Arena</td><td>150+</td><td><span class="p-badge p-badge-green">Active</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <!-- ══ ACHIEVEMENTS PANEL ══ -->
            <div class="p-panel" id="p-panel-achievements">
              <div class="p-card">
                <div class="p-card-header">
                  <div class="p-card-title">⭐ Awards & Certificates</div>
                  <button class="p-btn p-btn-blue p-btn-sm">+ Issue Certificate</button>
                </div>
                <div class="p-card-body" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:20px;">
                  <div style="background:var(--p-surface3); padding:20px; border-radius:12px; text-align:center; border:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:3rem; margin-bottom:10px;">🎓</div>
                    <h3 style="font-family:var(--font-display); color:var(--p-gold); margin-bottom:5px;">Graduation Processing</h3>
                    <p style="font-size:0.85rem; color:var(--p-text-muted); margin-bottom:15px;">2 Students reached 5 stars this week.</p>
                    <button class="p-btn p-btn-ghost p-btn-sm" style="width:100%">Review Candidates</button>
                  </div>
                  <div style="background:var(--p-surface3); padding:20px; border-radius:12px; text-align:center; border:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:3rem; margin-bottom:10px;">🏅</div>
                    <h3 style="font-family:var(--font-display); color:var(--p-gold); margin-bottom:5px;">Trophy Distribution</h3>
                    <p style="font-size:0.85rem; color:var(--p-text-muted); margin-bottom:15px;">Manage automated ELO milestone awards.</p>
                    <button class="p-btn p-btn-ghost p-btn-sm" style="width:100%">View Milestones</button>
                  </div>
                </div>
              </div>
            </div>
"""
    if 'id="p-panel-tournaments"' not in html:
        html = html.replace(
            '<!-- ══ REPORTS PANEL ══ -->',
            admin_panels + '\n            <!-- ══ REPORTS PANEL ══ -->'
        )

    # 5. Implement Tournaments UI in Student Portal
    student_tournaments = """
            <!-- TOURNAMENTS -->
            <div class="p-panel" id="student-panel-tournaments">
              <div class="p-card">
                <div class="p-card-header"><div class="p-card-title">🏅 Upcoming Tournaments</div></div>
                <div class="p-card-body" style="display:grid; gap:15px;">
                  
                  <div style="background:linear-gradient(135deg, rgba(212,175,55,0.1), rgba(0,0,0,0)); border:1px solid rgba(212,175,55,0.3); padding:20px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <div class="p-badge p-badge-gold" style="margin-bottom:8px;">Major Event</div>
                      <h3 style="font-family:var(--font-display); font-size:1.4rem; margin-bottom:5px;">Summer Open 2026</h3>
                      <div style="color:var(--p-text-muted); font-size:0.9rem; display:flex; gap:15px;">
                        <span>📅 Aug 15, 2026</span>
                        <span>⏱️ 10+0 Rapid</span>
                        <span>👥 42 Registered</span>
                      </div>
                    </div>
                    <button class="p-btn p-btn-gold">Register Now</button>
                  </div>
                  
                  <div style="background:var(--p-surface3); border:1px solid rgba(255,255,255,0.05); padding:20px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <div class="p-badge p-badge-blue" style="margin-bottom:8px;">Weekly Arena</div>
                      <h3 style="font-family:var(--font-display); font-size:1.4rem; margin-bottom:5px;">Friday Night Blitz</h3>
                      <div style="color:var(--p-text-muted); font-size:0.9rem; display:flex; gap:15px;">
                        <span>📅 Every Friday</span>
                        <span>⏱️ 3+2 Blitz</span>
                        <span>👥 150+ Average</span>
                      </div>
                    </div>
                    <button class="p-btn p-btn-ghost">View Details</button>
                  </div>

                </div>
              </div>
            </div>
"""
    if 'id="student-panel-tournaments"' not in html:
        html = html.replace(
            '<!-- PROGRESS -->',
            student_tournaments + '\n            <!-- PROGRESS -->'
        )

    # Modify Student Home to include Vision/Mission if it doesn't already have it
    if 'Inspire a global community' not in html:
        vision_mission = """
              <div class="p-card" style="margin-bottom: 20px; background: linear-gradient(135deg, rgba(212,175,55,0.05), rgba(91,156,246,0.05)); border-color: rgba(212,175,55,0.2);">
                <div class="p-card-body" style="text-align:center; padding: 30px 20px;">
                  <h2 style="font-family:var(--font-display); color:var(--p-gold); font-size:2rem; margin-bottom:10px;">Chess Kidoo Academy</h2>
                  <p style="font-size:1.1rem; color:var(--p-text); max-width:600px; margin:0 auto 15px auto; line-height:1.6;">
                    <strong>Vision:</strong> "Inspire a global community of learners..."<br>
                    <strong>Mission:</strong> "Create a supportive environment for mastering chess strategy and critical thinking."
                  </p>
                </div>
              </div>
"""
        html = html.replace(
            '<!-- HOME -->\n            <div class="p-panel active" id="student-panel-home">',
            '<!-- HOME -->\n            <div class="p-panel active" id="student-panel-home">\n' + vision_mission
        )

    with open('d:/MY/chessk/index.html', 'w', encoding='utf-8') as f:
        f.write(html)

def update_admin_js():
    with open('d:/MY/chessk/assets/js/admin.js', 'r', encoding='utf-8') as f:
        js = f.read()

    if 'tournaments: \'Tournaments\'' not in js:
        js = js.replace(
            "files: 'File Management',",
            "tournaments: 'Tournaments',\n      achievements: 'Achievements',\n      files: 'File Management',"
        )

    with open('d:/MY/chessk/assets/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(js)

def update_student_js():
    with open('d:/MY/chessk/assets/js/student.js', 'r', encoding='utf-8') as f:
        js = f.read()

    if 'tournaments: \'Upcoming Tournaments\'' not in js:
        js = js.replace(
            "resources: 'Learning Resources',",
            "tournaments: 'Upcoming Tournaments',\n      resources: 'Learning Resources',"
        )

    with open('d:/MY/chessk/assets/js/student.js', 'w', encoding='utf-8') as f:
        f.write(js)

update_index_html()
update_admin_js()
update_student_js()
print("Designed all missing modules successfully.")
