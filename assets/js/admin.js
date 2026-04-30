/* assets/js/admin.js -------------------------------------------------------
   Dynamic Admin Dashboard for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  const SHEET_URLS = [
    { id: "936ed8f3-fb3a-4944-845f-a8f965fe4a69", url: "https://docs.google.com/spreadsheets/d/1BkaOqV73EpOiMQo3Mk58c5y3dC8KPwhaCC5EHNqcG8E/edit?usp=sharing" },
    { id: "4b56fae6-b058-4183-ab86-6d3b05d6e089", url: "https://docs.google.com/spreadsheets/d/1WecftQwhnQIEufLNE309i9k-GSSl5EZrnsf4C_fw1bg/edit?usp=sharing" },
    { id: "e5820534-4065-4d69-a63e-2c80ce1a0beb", url: "https://docs.google.com/spreadsheets/d/1dKgL_OefFrH2GuU2aYZ7hG_9wB30DVEynvlDmyO4M94/edit?usp=sharing" },
    { id: "beba4945-9c27-40f3-bb98-aafad482f12b", url: "https://docs.google.com/spreadsheets/d/1phS3psK2nOXOzkqbNHgJPQN8ihqenWZCA3kYCi-pHs8/edit?usp=sharing" },
    { id: "af19e779-409d-43bb-b337-c8db8d50514b", url: "https://docs.google.com/spreadsheets/d/1bBvrJra_yduWlOprL1BdhSAoOtvaFjrHuowW3dAO60w/edit?usp=sharing" }
  ];

  CK.switchAdminTab = (tab, btn) => {
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    CK.loadAdminTab(tab);
  };

  CK.loadAdminDashboard = () => {
    CK.loadAdminTab('files');
  };

  CK.loadAdminTab = async (tab) => {
    const content = document.getElementById('admin-tab-content');
    content.innerHTML = '<div class="loading-wrap">♛ Loading...</div>';

    try {
      switch (tab) {
        case 'files': await loadFilesTab(content); break;
        case 'meetings': await loadMeetingsTab(content); break;
        case 'attendance': await loadAttendanceTab(content); break;
        case 'users': await loadUsersTab(content); break;
        case 'tournaments': await loadTournamentsTab(content); break;
        case 'achievements': await loadAchievementsTab(content); break;
        case 'leads': await loadLeadsTab(content); break;
      }
    } catch (err) {
      console.error("Admin Tab Error:", err);
      content.innerHTML = `<div class="error-wrap">❌ Error: ${err.message}</div>`;
    }
  };

  async function loadFilesTab(el) {
    const { data: files } = await window.supabaseClient.from('document').select('*').order('created_at', { ascending: false });
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>File Management</h3>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-ghost" onclick="CK.exportFiles()">📊 Export Excel</button>
          <button class="btn btn-primary" onclick="CK.openModal('uploadModal')">+ Upload Files</button>
        </div>
      </div>
      <div class="table-wrapper"><table class="table">
        <thead><tr><th>Date</th><th>Document</th><th>Notes</th><th>Coach</th><th>Batch</th><th>Actions</th></tr></thead>
        <tbody>${files.map(f => `
          <tr>
            <td>${new Date(f.created_at).toLocaleDateString()}</td>
            <td style="font-weight:600;">${f.file_name.split('/').pop()}</td>
            <td>${f.name || '-'}</td>
            <td>${f.coach}</td>
            <td>${f.batch || '-'}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="CK.deleteFile('${f.file_name}')">🗑️</button></td>
          </tr>
        `).join('')}</tbody>
      </table></div>
    `;
    CK.currentFiles = files;
  }

  async function loadUsersTab(el) {
    const { data: users } = await window.supabaseClient.from('users').select('*').order('userid', { ascending: true });
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>User Management</h3>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-ghost" onclick="CK.exportUsers()">📊 Export CSV</button>
          <button class="btn btn-primary" onclick="CK.openModal('addUserModal')">+ Add New User</button>
        </div>
      </div>
      <div class="table-wrapper"><table class="table">
        <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Level</th><th>Coach</th><th>Stars</th><th>Actions</th></tr></thead>
        <tbody>${users.map(u => `
          <tr>
            <td>${u.userid || '-'}</td>
            <td style="font-weight:600;">${u.full_name}</td>
            <td>${u.role}</td>
            <td><span class="hero-badge" style="font-size:0.7rem;">${u.level}</span></td>
            <td>${u.coach || '-'}</td>
            <td>${u.star || 0} ★</td>
            <td>
              <button class="btn btn-ghost btn-sm" style="color:red;" onclick="CK.deleteUser('${u.id}')">🗑️</button>
            </td>
          </tr>
        `).join('')}</tbody>
      </table></div>
    `;
    CK.currentUsers = users;
  }

  async function loadLeadsTab(el) {
    const { data: leads } = await window.supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
    el.innerHTML = `
      <h3>Demo Class Requests</h3>
      <div class="table-wrapper"><table class="table">
        <thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Age</th><th>City</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${leads.map(l => `
          <tr>
            <td>${new Date(l.created_at).toLocaleDateString()}</td>
            <td style="font-weight:600;">${l.full_name}</td>
            <td>${l.phone}</td>
            <td>${l.age}</td>
            <td>${l.city || '-'}</td>
            <td><span class="hero-badge" style="background:${l.status==='contacted'?'#ECFDF5':'#FEF3C7'}; color:${l.status==='contacted'?'#059669':'#D97706'}">${l.status.toUpperCase()}</span></td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="CK.updateLeadStatus(${l.id}, 'contacted')">✅ Contacted</button>
              <button class="btn btn-ghost btn-sm" style="color:red;" onclick="CK.deleteLead(${l.id})">🗑️</button>
            </td>
          </tr>
        `).join('')}</tbody>
      </table></div>
    `;
  }

  async function loadAttendanceTab(el) {
    const { data: users } = await window.supabaseClient.from('users').select('*').eq('role', 'student');
    el.innerHTML = `
      <h3>Attendance Tracker</h3>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
        ${users.map(u => `<button class="btn btn-ghost btn-sm" onclick="CK.loadUserAttendance('${u.userid}', '${u.full_name}')">${u.full_name}</button>`).join('')}
      </div>
      <div id="attendanceCalendar" class="feat-card" style="padding:2rem;">Select a student to view history.</div>
    `;
  }

  CK.loadUserAttendance = async (id, name) => {
    const cal = document.getElementById('attendanceCalendar');
    cal.innerHTML = '♛ Loading...';
    const { data: att } = await window.supabaseClient.from('attendance').select('*').eq('userid', id);
    const sheet = SHEET_URLS.find(s => s.id === id);

    cal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h4>${name}'s History</h4>
        ${sheet ? `<a href="${sheet.url}" target="_blank" class="btn btn-ghost btn-sm">🔗 Open Sheet</a>` : ''}
      </div>
      <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:10px;">
        ${['S','M','T','W','T','F','S'].map(d => `<div style="opacity:0.5; font-weight:700;">${d}</div>`).join('')}
        ${Array.from({length:31}, (_, i) => {
          const date = `2026-04-${String(i+1).padStart(2, '0')}`;
          const rec = att.find(a => a.date === date);
          return `<div style="padding:10px; background:var(--cream); border-radius:8px; position:relative; min-height:50px;">
            ${i+1} <span style="position:absolute; bottom:5px; right:5px;">${rec ? (rec.status==='present'?'✅':'❌') : ''}</span>
          </div>`;
        }).join('')}
      </div>
    `;
  };

  /* ─── Actions ─── */
  CK.handleAddUser = async (e) => {
    e.preventDefault();
    const f = e.target;
    const data = {
      email: f.email.value,
      password: f.password.value,
      full_name: f.fullName.value,
      role: f.role.value,
      userid: f.userId.value,
      phone_number: f.phone.value,
      age: f.age.value,
      city: f.city.value,
      grade: f.grade.value,
      level: f.level?.value,
      coach: f.assignedCoach?.value,
      batch: f.batch?.value,
      puzzle: f.puzzle?.value,
      game: f.game?.value,
      star: f.star?.value || 0
    };

    try {
      CK.showToast("Creating user...", "info");
      const { data: auth, error: authErr } = await window.supabaseClient.auth.signUp({ email: data.email, password: data.password });
      if (authErr) throw authErr;

      const { error: dbErr } = await window.supabaseClient.from('users').insert([{ ...data, id: auth.user.id }]);
      if (dbErr) throw dbErr;

      // Initial Rating
      if (f.rating?.value || f.intRating?.value) {
        await window.supabaseClient.from('ratings').insert([{ user_id: data.userid, online: f.rating.value, international: f.intRating.value }]);
      }

      CK.showToast("User created! ✅", "success");
      CK.closeModal();
      CK.loadAdminTab('users');
    } catch (err) { CK.showToast(err.message, "error"); }
  };

  CK.handleResourceUpload = async (e) => {
    e.preventDefault();
    const f = e.target;
    const file = f.file.files[0];
    if (!file) return;

    try {
      CK.showToast("Uploading...", "info");
      const path = `${f.level.value}/${Date.now()}_${file.name}`;
      await window.supabaseClient.storage.from('pdfs').upload(path, file);

      await window.supabaseClient.from('document').insert([{
        file_name: path,
        name: f.fileName.value,
        level: f.level.value,
        link: f.refUrl.value,
        class_link: f.classLink.value,
        batch: f.batch.value,
        user_ids: f.userIds.value,
        coach: CK.currentUser.full_name
      }]);

      CK.showToast("Resource uploaded! 📄", "success");
      CK.closeModal();
      CK.loadAdminTab('files');
    } catch (err) { CK.showToast(err.message, "error"); }
  };

  CK.exportFiles = () => {
    const csv = "Date,Document,Notes,Coach,Batch\n" + CK.currentFiles.map(f => `"${new Date(f.created_at).toLocaleDateString()}","${f.file_name.split('/').pop()}","${f.name}","${f.coach}","${f.batch}"`).join("\n");
    downloadCSV(csv, "chesskidoo_files.csv");
  };

  CK.exportUsers = () => {
    const csv = "ID,Name,Email,Role,Level,Coach,Stars\n" + CK.currentUsers.map(u => `"${u.userid}","${u.full_name}","${u.email}","${u.role}","${u.level}","${u.coach}","${u.star}"`).join("\n");
    downloadCSV(csv, "chesskidoo_users.csv");
  };

  function downloadCSV(csv, name) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
  }

})();