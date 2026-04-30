/* assets/js/admin.js -------------------------------------------------------
   Professional Admin Dashboard for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  const SHEET_URLS = [
    { id: "936ed8f3-fb3a-4944-845f-a8f965fe4a69", url: "https://docs.google.com/spreadsheets/d/1BkaOqV73EpOiMQo3Mk58c5y3dC8KPwhaCC5EHNqcG8E/edit?usp=sharing" },
    { id: "4b56fae6-b058-4183-ab86-6d3b05d6e089", url: "https://docs.google.com/spreadsheets/d/1WecftQwhnQIEufLNE309i9k-GSSl5EZrnsf4C_fw1bg/edit?usp=sharing" }
  ];

  CK.switchAdminTab = (tab, btn) => {
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    CK.loadAdminTab(tab);
  };

  CK.loadAdminDashboard = () => CK.loadAdminTab('users');

  CK.loadAdminTab = async (tab) => {
    const content = document.getElementById('admin-tab-content');
    content.innerHTML = '<div class="loading-wrap">♛ Loading...</div>';

    try {
      switch (tab) {
        case 'users': await loadUsersTab(content); break;
        case 'files': await loadFilesTab(content); break;
        case 'leads': await loadLeadsTab(content); break;
        case 'tournaments': await loadTournamentsTab(content); break;
        case 'achievements': await loadAchievementsTab(content); break;
        case 'attendance': await loadAttendanceTab(content); break;
      }
    } catch (err) {
      console.error("Admin Error:", err);
      content.innerHTML = `<div class="error-wrap">❌ Error loading ${tab}.</div>`;
    }
  };

  async function loadUsersTab(el) {
    const { data: users } = await window.supabaseClient.from('users').select('*').order('userid', { ascending: true });
    CK.allUsers = users;

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
        <h3>Academy Roster</h3>
        <div style="display:flex; gap:12px;">
          <select id="filter-batch" class="btn btn-ghost" style="padding:10px 20px;" onchange="CK.filterUsersByBatch(this.value)">
            <option value="all">All Batches</option>
            <option value="1">Batch 1</option>
            <option value="11">Batch 11</option>
          </select>
          <button class="btn btn-primary" onclick="CK.openModal('addUserModal')">+ New User</button>
        </div>
      </div>
      <div class="table-wrapper"><table class="table" id="users-table">
        <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Batch</th><th>Coach</th><th>Actions</th></tr></thead>
        <tbody>${renderUserRows(users)}</tbody>
      </table></div>
    `;
  }

  function renderUserRows(users) {
    return users.map(u => `
      <tr>
        <td>${u.userid || '-'}</td>
        <td style="font-weight:600;">${u.full_name}</td>
        <td><span class="hero-badge" style="font-size:0.65rem;">${u.role.toUpperCase()}</span></td>
        <td>${u.batch || '-'}</td>
        <td>${u.coach || 'Unassigned'}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="CK.editUser('${u.id}')">✏️</button>
          <button class="btn btn-ghost btn-sm" style="color:red;" onclick="CK.deleteUser('${u.id}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  CK.filterUsersByBatch = (batch) => {
    const filtered = batch === 'all' ? CK.allUsers : CK.allUsers.filter(u => u.batch === batch);
    document.querySelector('#users-table tbody').innerHTML = renderUserRows(filtered);
  };

  async function loadFilesTab(el) {
    const { data: files } = await window.supabaseClient.from('document').select('*').order('created_at', { ascending: false });
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
        <h3>Resource Library</h3>
        <button class="btn btn-primary" onclick="CK.openModal('uploadModal')">+ Upload Material</button>
      </div>
      <div class="table-wrapper"><table class="table">
        <thead><tr><th>Date</th><th>Material</th><th>Level</th><th>Batch</th><th>Actions</th></tr></thead>
        <tbody>${files.map(f => `
          <tr>
            <td>${new Date(f.created_at).toLocaleDateString()}</td>
            <td style="font-weight:600;">${f.name}</td>
            <td>${f.level}</td>
            <td>${f.batch || '-'}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="CK.deleteFile('${f.file_name}')">🗑️</button></td>
          </tr>
        `).join('')}</tbody>
      </table></div>
    `;
  }

  // Attendance history logic synced with original repo's AttendanceCalendar
  async function loadAttendanceTab(el) {
    const { data: students } = await window.supabaseClient.from('users').select('*').eq('role', 'student');
    el.innerHTML = `
      <h3>Attendance Verification</h3>
      <div style="display:flex; gap:10px; margin-bottom:25px; overflow-x:auto; padding:10px 0;">
        ${students.map(s => `
          <button class="btn btn-ghost btn-sm" onclick="CK.viewAttendanceHistory('${s.userid}', '${s.full_name}')">
            ${s.full_name}
          </button>
        `).join('')}
      </div>
      <div id="attendance-detail" class="feat-card" style="padding:40px; text-align:center; opacity:0.5;">
        Select a student to view their attendance history.
      </div>
    `;
  }

  CK.viewAttendanceHistory = async (id, name) => {
    const box = document.getElementById('attendance-detail');
    box.innerHTML = '♛ Fetching records...';
    const { data: att } = await window.supabaseClient.from('attendance').select('*').eq('userid', id).order('date', { ascending: false });
    const sheet = SHEET_URLS.find(s => s.id === id);

    box.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
        <h4 style="margin:0;">${name}'s History</h4>
        ${sheet ? `<a href="${sheet.url}" target="_blank" class="btn btn-ghost btn-sm">🔗 Open Google Sheet</a>` : ''}
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:15px; text-align:left;">
        ${att.length ? att.map(a => `
          <div style="background:var(--cream); padding:12px; border-radius:10px; border:1px solid var(--border-light);">
            <div style="font-size:0.75rem; opacity:0.6;">${new Date(a.date).toLocaleDateString()}</div>
            <div style="font-weight:700; color:var(--green);">${a.status.toUpperCase()} ✅</div>
          </div>
        `).join('') : '<p>No records found for this student.</p>'}
      </div>
    `;
  };

  /* ─── CRUD Helpers ─── */
  CK.deleteUser = async (id) => {
    if (!confirm("Remove this user? This action is permanent.")) return;
    try {
      await window.supabaseClient.from('users').delete().eq('id', id);
      CK.showToast("User removed.", "success");
      CK.loadAdminTab('users');
    } catch (err) { CK.showToast("Failed to remove user.", "error"); }
  };

  CK.updateLeadStatus = async (id, status) => {
    await window.supabaseClient.from('leads').update({ status }).eq('id', id);
    CK.loadAdminTab('leads');
  };

})();