import re
with open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Improved Dashboard Layout with Stats Cards
stats_html = """
    container.innerHTML = `
      <div class="admin-stats-grid">
        <div class="stat-card">
          <span class="label">Total Students</span>
          <span class="value">524</span>
          <span class="trend">↑ 12% this month</span>
        </div>
        <div class="stat-card">
          <span class="label">Active Classes</span>
          <span class="value">42</span>
          <span class="trend">↑ 4 today</span>
        </div>
        <div class="stat-card">
          <span class="label">Monthly Revenue</span>
          <span class="value">₹4,82,500</span>
          <span class="trend">↑ 8% vs last month</span>
        </div>
        <div class="stat-card">
          <span class="label">Pending Leads</span>
          <span class="value">18</span>
          <span class="trend" style="color:#f59e0b">Action needed</span>
        </div>
      </div>
      <div class="admin-tabs">
        <button class="tab-btn active" onclick="CK.switchAdminTab('files', this)">File Management</button>
        <button class="tab-btn" onclick="CK.switchAdminTab('meetings', this)">Meetings</button>
        <button class="tab-btn" onclick="CK.switchAdminTab('attendance', this)">Attendance</button>
        <button class="tab-btn" onclick="CK.switchAdminTab('users', this)">User Management</button>
        <button class="tab-btn" onclick="CK.switchAdminTab('tournaments', this)">Tournaments</button>
        <button class="tab-btn" onclick="CK.switchAdminTab('achievements', this)">Achievements</button>
      </div>
      <div id="admin-tab-content"></div>
    `;
"""

# Find the part where container.innerHTML is set in loadAdminDashboard
js = re.sub(r'container\.innerHTML = `[\s\S]*?`;', stats_html, js)

with open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
