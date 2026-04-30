import re
with open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Upgrade User Rows (Avatars, Badges)
user_rows_code = """
  function renderUserRows(users) {
    if (!users?.length) return `<tr><td colspan="8" class="ck-empty">No students found.</td></tr>`;
    return users.filter(u => u.role !== 'admin').map((u,i) => {
      const initials = (u.full_name || 'S').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
      const levelClass = (u.level||'').toLowerCase().includes('inter') ? 'status-paid' : (u.level||'').toLowerCase().includes('adv') ? 'status-paid' : 'status-pending';
      const payStatus = (u.payment_status||'Pending').toLowerCase();
      const payClass = payStatus === 'paid' ? 'status-paid' : payStatus === 'pending' ? 'status-pending' : 'status-overdue';

      return `
        <tr>
          <td><span class="ck-badge ck-badge-amber">ID-${1000 + i}</span></td>
          <td>
            <div class="student-name-cell">
              <div class="student-avatar">${initials}</div>
              <div>
                <div style="font-weight:700; color:var(--ink);">${u.full_name || '-'}</div>
                <div style="font-size:0.75rem; opacity:0.5;">Joined: ${new Date(u.created_at || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
          </td>
          <td style="opacity:0.7; font-size:0.85rem;">${u.email || '-'}</td>
          <td><span class="status-pill ${levelClass}" style="background:#f1f5f9; color:#475569;">${u.level || 'Beginner'}</span></td>
          <td><div style="font-weight:600; font-size:0.85rem;">${u.coach || 'Unassigned'}</div></td>
          <td style="font-weight:700; color:var(--ink);">${u.fee || '-'}</td>
          <td><span class="status-pill ${payClass}">${u.payment_status || 'Pending'}</span></td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="dash-btn" title="Edit" onclick="CK.editUser('${u.id}')">✏️</button>
              <button class="dash-btn" style="color:#ef4444;" title="Delete" onclick="CK.deleteUser('${u.id}')">🗑</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
"""

# 2. Upgrade Meeting Form (Icons, Pretty Inputs)
meeting_form_code = """
  function tabMeetings(el) {
    el.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:flex-start; padding:40px 0;">
        <div class="dash-card" style="width:100%; max-width:540px; padding:48px; border-radius:32px;">
          <h2 style="text-align:center; font-family:var(--font-display); font-size:2rem; margin-bottom:10px;">📅 Schedule Session</h2>
          <p style="text-align:center; opacity:0.5; margin-bottom:32px; font-size:0.95rem;">Send a meeting reminder to your students.</p>
          <form onsubmit="CK.scheduleMeeting(event)">
            <div class="ck-input-group">
              <span class="ck-input-icon">🔗</span>
              <input class="ck-input-pretty" type="url" id="meet-url" placeholder="Meeting URL (Zoom/GMeet)" required>
            </div>
            <div class="ck-input-group">
              <span class="ck-input-icon">🕒</span>
              <input class="ck-input-pretty" type="datetime-local" id="meet-dt" required>
            </div>
            <div class="ck-input-group">
              <span class="ck-input-icon">👥</span>
              <input class="ck-input-pretty" type="text" id="meet-batch" placeholder="Target Batch Number (e.g. 1)" required>
            </div>
            <button type="submit" class="dash-btn dash-btn-primary" style="width:100%; padding:18px; font-size:1rem; border-radius:15px; margin-top:10px;">
              CONFIRM & SCHEDULE
            </button>
          </form>
          <div id="meetings-list" style="margin-top:40px;"></div>
        </div>
      </div>
    `;
    loadMeetingsList();
  }
"""

# Apply the replacements
js = re.sub(r'function renderUserRows\(users\) \{[\s\S]*?\}', user_rows_code, js)
js = re.sub(r'function tabMeetings\(el\) \{[\s\S]*?loadMeetingsList\(\);[\s\S]*?\}', meeting_form_code, js)

with open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
