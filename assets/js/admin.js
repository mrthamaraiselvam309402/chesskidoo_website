/* assets/js/admin.js -------------------------------------------------------
   Full Admin Dashboard — ChessKidoo Academy
   Handles: Users, Files, Leads, Attendance, Tournaments, Achievements
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  const SUPABASE_IMG = 'https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/';

  /* ─── Tab Switching ─── */
  CK.switchAdminTab = (tab, btn) => {
    document.querySelectorAll('#admin-page .admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    CK.loadAdminTab(tab);
  };

  CK.loadAdminDashboard = () => {
    // Activate the first tab button
    const firstTab = document.querySelector('#admin-page .admin-tab');
    if (firstTab) firstTab.classList.add('active');
    CK.loadAdminTab('users');
  };

  CK.loadAdminTab = async (tab) => {
    const content = document.getElementById('admin-tab-content');
    if (!content) return;
    content.innerHTML = '<div class="loading-wrap">♛ Loading...</div>';
    try {
      switch (tab) {
        case 'users':        await loadUsersTab(content);        break;
        case 'files':        await loadFilesTab(content);        break;
        case 'leads':        await loadLeadsTab(content);        break;
        case 'attendance':   await loadAttendanceTab(content);   break;
        case 'tournaments':  await loadTournamentsTab(content);  break;
        case 'achievements': await loadAchievementsTab(content); break;
        case 'meetings':     await loadMeetingsTab(content);     break;
        default: content.innerHTML = '<p style="padding:40px">Section coming soon.</p>';
      }
    } catch (err) {
      console.error('Admin tab error:', err);
      content.innerHTML = `<div class="error-wrap">❌ Error loading data: ${err.message}</div>`;
    }
  };

  /* ─── USERS / ROSTER ─── */
  async function loadUsersTab(el) {
    const { data: users, error } = await window.supabaseClient
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('full_name', { ascending: true });

    if (error) throw error;
    CK.allUsers = users || [];

    const coaches = Array.from(new Set(CK.allUsers.map(u => u.coach).filter(Boolean)));

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap:wrap; gap:15px;">
        <div>
          <h3 style="margin:0;">Academy Roster</h3>
          <small style="opacity:0.6;">${CK.allUsers.length} students registered</small>
        </div>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <select class="btn btn-ghost" style="cursor:pointer;" onchange="CK.filterUsers('coach', this.value)">
            <option value="all">All Coaches</option>
            ${coaches.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <select class="btn btn-ghost" style="cursor:pointer;" onchange="CK.filterUsers('payment_status', this.value)">
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
          <button class="btn btn-ghost" onclick="CK.exportUsersCSV()">📥 Export CSV</button>
          <button class="btn btn-primary" onclick="CK.openModal('addUserModal')">+ New Student</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="table" id="users-table">
          <thead>
            <tr>
              <th>#</th><th>Student Name</th><th>Level / ELO</th><th>Coach</th>
              <th>Schedule</th><th>Session</th><th>Fee</th><th>Payment</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>${renderUserRows(CK.allUsers)}</tbody>
        </table>
      </div>
    `;
  }

  function renderUserRows(users) {
    if (!users || users.length === 0) {
      return '<tr><td colspan="9" style="text-align:center;padding:40px;opacity:0.5;">No students found.</td></tr>';
    }
    return users.map((u, i) => `
      <tr>
        <td style="opacity:0.5;">${i + 1}</td>
        <td style="font-weight:700; color:var(--ink);">${u.full_name || '-'}</td>
        <td>
          <span class="hero-badge" style="font-size:0.68rem; background:rgba(217,119,6,0.1); color:var(--amber);">
            ${u.level || 'Beginner'}
          </span>
        </td>
        <td>${u.coach || '-'}</td>
        <td><small>${u.schedule || '-'}</small></td>
        <td><small>${u.session_type || '-'}</small></td>
        <td style="font-weight:600;">${u.fee || '-'}</td>
        <td>
          <span class="status-pill ${(u.payment_status || 'Pending').toLowerCase()}">
            ${u.payment_status || 'Pending'}
          </span>
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="CK.editUser('${u.id}')" title="Edit">✏️</button>
          <button class="btn btn-ghost btn-sm" style="color:#dc2626;" onclick="CK.deleteUser('${u.id}')" title="Delete">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  CK.filterUsers = (col, val) => {
    const filtered = val === 'all' ? CK.allUsers : CK.allUsers.filter(u => u[col] === val);
    const tbody = document.querySelector('#users-table tbody');
    if (tbody) tbody.innerHTML = renderUserRows(filtered);
  };

  CK.exportUsersCSV = () => {
    const headers = ['#','Name','Level','Coach','Schedule','Session','Fee','Payment Status'];
    const rows = (CK.allUsers || []).map((u, i) => [
      i + 1, u.full_name, u.level, u.coach, u.schedule, u.session_type, u.fee, u.payment_status
    ].map(v => `"${v || ''}"`));
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob), download: 'chesskidoo_roster.csv', style: 'display:none'
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    CK.showToast('CSV exported!', 'success');
  };

  CK.deleteUser = async (id) => {
    if (!confirm('Permanently remove this student?')) return;
    const { error } = await window.supabaseClient.from('users').delete().eq('id', id);
    if (error) return CK.showToast('Delete failed: ' + error.message, 'error');
    CK.showToast('Student removed.', 'success');
    CK.loadAdminTab('users');
  };

  /* ─── FILES / RESOURCES ─── */
  async function loadFilesTab(el) {
    const { data: files, error } = await window.supabaseClient
      .from('document').select('*').order('created_at', { ascending: false });

    if (error) throw error;
    const items = files || [];

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
        <h3 style="margin:0;">Resource Library <small style="opacity:0.5; font-size:0.8rem;">(${items.length} files)</small></h3>
        <button class="btn btn-primary" onclick="CK.openModal('uploadModal')">+ Upload Resource</button>
      </div>
      <div class="table-wrapper"><table class="table">
        <thead><tr><th>Date</th><th>Name</th><th>Level</th><th>Links</th><th>Actions</th></tr></thead>
        <tbody>
          ${items.length ? items.map(f => `
            <tr>
              <td>${new Date(f.created_at).toLocaleDateString()}</td>
              <td style="font-weight:600;">${f.name || f.file_name?.split('/').pop() || '-'}</td>
              <td><span class="status-pill enrolled">${f.level || 'All'}</span></td>
              <td>
                ${f.class_link ? `<a href="${f.class_link}" target="_blank" style="color:var(--amber); margin-right:8px;">▶ Recording</a>` : ''}
                ${f.link ? `<a href="${f.link}" target="_blank" style="color:var(--amber);">🔗 Ref</a>` : ''}
              </td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="CK.downloadFile('${f.file_name}')">📥</button>
                <button class="btn btn-ghost btn-sm" style="color:#dc2626;" onclick="CK.deleteFile('${f.file_name}')">🗑️</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="5" style="text-align:center;padding:40px;opacity:0.5;">No resources uploaded yet.</td></tr>'}
        </tbody>
      </table></div>
    `;
  }

  /* ─── LEADS ─── */
  async function loadLeadsTab(el) {
    const { data: leads, error } = await window.supabaseClient
      .from('leads').select('*').order('created_at', { ascending: false });

    if (error) throw error;
    const items = leads || [];

    el.innerHTML = `
      <h3 style="margin-bottom:25px;">Demo Booking Inquiries <small style="opacity:0.5;">(${items.length})</small></h3>
      <div class="table-wrapper"><table class="table">
        <thead><tr><th>Date</th><th>Student/Parent</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${items.length ? items.map(l => `
            <tr>
              <td>${new Date(l.created_at).toLocaleDateString()}</td>
              <td style="font-weight:600;">${l.name || '-'}</td>
              <td>${l.phone || '-'}</td>
              <td><span class="status-pill ${l.status || 'new'}">${l.status || 'new'}</span></td>
              <td>
                <button class="btn btn-ghost btn-sm" title="Mark Called" onclick="CK.updateLeadStatus('${l.id}', 'called')">📞</button>
                <button class="btn btn-ghost btn-sm" title="Mark Enrolled" onclick="CK.updateLeadStatus('${l.id}', 'enrolled')">✅</button>
                <a href="https://wa.me/${(l.phone||'').replace(/\D/g,'')}" target="_blank" class="btn btn-ghost btn-sm" title="WhatsApp">💬</a>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="5" style="text-align:center;padding:40px;opacity:0.5;">No inquiries yet.</td></tr>'}
        </tbody>
      </table></div>
    `;
  }

  CK.updateLeadStatus = async (id, status) => {
    const { error } = await window.supabaseClient.from('leads').update({ status }).eq('id', id);
    if (error) return CK.showToast('Update failed.', 'error');
    CK.showToast(`Lead marked as ${status}`, 'success');
    CK.loadAdminTab('leads');
  };

  /* ─── ATTENDANCE ─── */
  async function loadAttendanceTab(el) {
    const { data: students } = await window.supabaseClient
      .from('users').select('id, full_name, coach').eq('role', 'student').order('full_name');

    el.innerHTML = `
      <h3 style="margin-bottom:20px;">Attendance Tracker</h3>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:25px;">
        ${(students || []).map(s => `
          <button class="btn btn-ghost btn-sm" onclick="CK.viewAttendance('${s.id}', '${s.full_name}')">
            ${s.full_name}
          </button>
        `).join('')}
      </div>
      <div id="attendance-detail" style="background:var(--cream); padding:40px; border-radius:16px; text-align:center; opacity:0.6;">
        ♟ Select a student above to view their attendance history.
      </div>
    `;
  }

  CK.viewAttendance = async (id, name) => {
    const box = document.getElementById('attendance-detail');
    box.innerHTML = '♛ Loading...';
    const { data: att } = await window.supabaseClient
      .from('attendance').select('*').eq('userid', id).order('date', { ascending: false });

    const records = att || [];
    box.innerHTML = `
      <h4 style="margin-bottom:20px;">${name} — Attendance Records (${records.length})</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px,1fr)); gap:12px; text-align:left;">
        ${records.length ? records.map(a => `
          <div style="background:#fff; padding:12px; border-radius:10px; border:1px solid var(--border-light);">
            <div style="font-size:0.72rem; opacity:0.5;">${new Date(a.date).toLocaleDateString()}</div>
            <div style="font-weight:700; color:${a.status==='present'?'#166534':'#991b1b'};">
              ${a.status === 'present' ? '✅ Present' : '❌ Absent'}
            </div>
          </div>
        `).join('') : '<p style="grid-column:1/-1; opacity:0.5;">No attendance records yet.</p>'}
      </div>
    `;
  };

  /* ─── TOURNAMENTS ─── */
  async function loadTournamentsTab(el) {
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
        <h3 style="margin:0;">Tournament Management</h3>
        <button class="btn btn-primary" onclick="CK.openModal('uploadTournModal')">+ Add Tournament</button>
      </div>
      <div class="feat-grid" style="grid-template-columns:repeat(auto-fill, minmax(280px,1fr));">
        <div class="feat-card" style="text-align:center; padding:40px; opacity:0.6;">
          <div style="font-size:3rem; margin-bottom:16px;">🏆</div>
          <h4>No tournaments yet</h4>
          <p>Add your first tournament to track student performance.</p>
        </div>
      </div>
    `;
  }

  /* ─── ACHIEVEMENTS ─── */
  async function loadAchievementsTab(el) {
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
        <h3 style="margin:0;">Student Achievements</h3>
        <button class="btn btn-primary" onclick="CK.openModal('addAchModal')">+ Add Achievement</button>
      </div>
      <div class="feat-grid" style="grid-template-columns:repeat(auto-fill, minmax(280px,1fr));">
        <div class="feat-card" style="text-align:center; padding:40px; opacity:0.6;">
          <div style="font-size:3rem; margin-bottom:16px;">🥇</div>
          <h4>No achievements yet</h4>
          <p>Add awards, medals, and tournament wins here.</p>
        </div>
      </div>
    `;
  }

  /* ─── MEETINGS ─── */
  async function loadMeetingsTab(el) {
    el.innerHTML = `
      <h3 style="margin-bottom:25px;">Meeting Schedules</h3>
      <div class="table-wrapper"><table class="table">
        <thead><tr><th>Date</th><th>Topic</th><th>Coach</th><th>Batch</th><th>Link</th></tr></thead>
        <tbody>
          <tr><td colspan="5" style="text-align:center;padding:40px;opacity:0.5;">No meetings scheduled yet.</td></tr>
        </tbody>
      </table></div>
    `;
  }

})();