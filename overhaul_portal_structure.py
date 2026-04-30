import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Completely new Sidebar-based layout for Admin Portal
admin_portal_new = """
    <div id="admin-page" class="page">
      <div class="portal-container">
        <aside class="portal-sidebar">
          <div class="sidebar-brand">
            <div class="brand-icon">♛</div>
            <span>Admin Center</span>
          </div>
          <nav class="sidebar-nav">
            <button class="nav-item active" onclick="CK.switchAdminTab('files', this)">
              <span class="nav-icon">📁</span> Document Library
            </button>
            <button class="nav-item" onclick="CK.switchAdminTab('meetings', this)">
              <span class="nav-icon">📅</span> Meetings
            </button>
            <button class="nav-item" onclick="CK.switchAdminTab('attendance', this)">
              <span class="nav-icon">✅</span> Attendance
            </button>
            <button class="nav-item" onclick="CK.switchAdminTab('users', this)">
              <span class="nav-icon">👥</span> Student Roster
            </button>
            <button class="nav-item" onclick="CK.switchAdminTab('tournaments', this)">
              <span class="nav-icon">🏆</span> Tournaments
            </button>
            <button class="nav-item" onclick="CK.switchAdminTab('achievements', this)">
              <span class="nav-icon">🎖</span> Achievements
            </button>
          </nav>
          <div class="sidebar-footer">
            <button class="btn btn-outline" style="width:100%; border-color:rgba(255,255,255,0.2); color:white;" onclick="CK.logout()">🚪 Logout</button>
          </div>
        </aside>
        <main class="portal-main">
          <header class="portal-header">
            <div id="admin-tab-title">Document Library</div>
            <div class="portal-user">
              <span>Academy Admin</span>
              <div class="user-avatar">AD</div>
            </div>
          </header>
          <div class="portal-content" id="admin-tab-content">
            <!-- Content injected here -->
          </div>
        </main>
      </div>
    </div>
"""

# Completely new Sidebar-based layout for Student Portal
student_portal_new = """
    <div id="student-page" class="page">
      <div class="portal-container">
        <aside class="portal-sidebar student-sidebar">
          <div class="sidebar-brand">
            <div class="brand-icon">♟</div>
            <span>Player Portal</span>
          </div>
          <nav class="sidebar-nav">
            <button class="nav-item active" onclick="CK.loadStudentDashboard()">
              <span class="nav-icon">📊</span> Dashboard
            </button>
            <button class="nav-item" onclick="CK.showToast('My Lessons coming soon!', 'info')">
              <span class="nav-icon">📚</span> My Lessons
            </button>
            <button class="nav-item" onclick="CK.showToast('My Progress coming soon!', 'info')">
              <span class="nav-icon">📈</span> Growth Map
            </button>
          </nav>
          <div class="sidebar-footer">
            <button class="btn btn-outline" style="width:100%; border-color:rgba(255,255,255,0.2); color:white;" onclick="CK.logout()">🚪 Logout</button>
          </div>
        </aside>
        <main class="portal-main">
          <header class="portal-header">
            <div>My Learning Dashboard</div>
            <div class="portal-user">
              <span id="student-name-display">Student</span>
              <div class="user-avatar" id="student-avatar-display">ST</div>
            </div>
          </header>
          <div class="portal-content" id="student-dashboard-content">
            <!-- Content injected here -->
          </div>
        </main>
      </div>
    </div>
"""

# Replace the old portal structures
html = re.sub(r'<div id="admin-page"[\s\S]*?</div>\s*</div>\s*</div>\s*</div>\s*</div>', admin_portal_new, html)
html = re.sub(r'<div id="student-page"[\s\S]*?</div>\s*</div>\s*</div>\s*</div>\s*</div>', student_portal_new, html)

# Actually, the regex above is tricky. Let's find simpler markers.
# I'll replace from <div id="admin-page" to the start of the next page or script.
html = re.sub(r'<div id="admin-page"[\s\S]*?<div id="student-page"', admin_portal_new + '\n    <div id="student-page"', html)
html = re.sub(r'<div id="student-page"[\s\S]*?<!-- Modals -->', student_portal_new + '\n    <!-- Modals -->', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
