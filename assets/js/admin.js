/* assets/js/admin.js -------------------------------------------------------
   Dynamic Admin Dashboard for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.switchAdminTab = (tab, btn) => {
    // Update UI
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Load content
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
        case 'files':
          await loadFilesTab(content);
          break;
        case 'meetings':
          await loadMeetingsTab(content);
          break;
        case 'attendance':
          await loadAttendanceTab(content);
          break;
        case 'users':
          await loadUsersTab(content);
          break;
        case 'tournaments':
          await loadTournamentsTab(content);
          break;
        case 'achievements':
          await loadAchievementsTab(content);
          break;
        case 'leads':
          await loadLeadsTab(content);
          break;
      }
    } catch (err) {
      console.error("Admin Tab Error:", err);
      content.innerHTML = `<div class="error-wrap">❌ Error: ${err.message}</div>`;
    }
  };

  /* ─── Tab Loaders ─── */

  async function loadFilesTab(el) {
    const { data: files } = await window.supabaseClient.from('document').select('*').order('created_at', { ascending: false });
    
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>File Management</h3>
        <button class="btn btn-primary" onclick="CK.openModal('uploadModal')">+ Upload Files</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>Date</th><th>Document</th><th>Notes</th><th>Coach</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${files.map(f => `
              <tr>
                <td>${new Date(f.created_at).toLocaleDateString()}</td>
                <td style="font-weight:600;">${f.file_name.split('/').pop()}</td>
                <td>${f.name || '-'}</td>
                <td>${f.coach}</td>
                <td>
                  <button class="btn btn-ghost btn-sm" onclick="CK.deleteFile('${f.file_name}')">🗑️</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async function loadMeetingsTab(el) {
    el.innerHTML = `
      <div style="max-width: 500px; margin: 0 auto;" class="feat-card">
        <h3 style="text-align:center; margin-bottom:24px;">Schedule Meeting Reminder</h3>
        <form onsubmit="CK.handleMeetingSubmit(event)">
          <div class="form-group">
            <label>Meeting URL</label>
            <input type="url" name="meetingUrl" required placeholder="https://zoom.us/j/...">
          </div>
          <div class="form-group">
            <label>Date & Time</label>
            <input type="datetime-local" name="meetingTime" required>
          </div>
          <div class="form-group">
            <label>Batch</label>
            <input type="text" name="batch" required placeholder="e.g. Batch 1">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Schedule Reminder</button>
        </form>
      </div>
    `;
  }

  async function loadAttendanceTab(el) {
    const { data: users } = await window.supabaseClient.from('users').select('*').eq('role', 'student');
    
    el.innerHTML = `
      <h3>User Attendance</h3>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
        ${users.map(u => `
          <button class="btn btn-ghost btn-sm" onclick="CK.loadUserAttendance('${u.id}', '${u.full_name}')">${u.full_name}</button>
        `).join('')}
      </div>
      <div id="attendanceCalendar" class="feat-card" style="min-height: 300px; display:flex; align-items:center; justify-content:center; opacity:0.5;">
        Select a student to view attendance calendar
      </div>
    `;
  }

  async function loadUsersTab(el) {
    const { data: users } = await window.supabaseClient.from('users').select('*').order('userid', { ascending: true });
    
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>User Management</h3>
        <button class="btn btn-primary" onclick="CK.openModal('addUserModal')">+ Add New User</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>ID</th><th>Full Name</th><th>Email</th><th>Level</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.userid || '-'}</td>
                <td style="font-weight:600;">${u.full_name}</td>
                <td>${u.email}</td>
                <td><span class="hero-badge" style="font-size:0.7rem;">${u.level}</span></td>
                <td>${u.role}</td>
                <td>
                  <button class="btn btn-ghost btn-sm">Edit</button>
                  <button class="btn btn-ghost btn-sm" style="color:red;" onclick="CK.deleteUser('${u.id}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async function loadTournamentsTab(el) {
    const { data: tourns } = await window.supabaseClient.from('tourns').select('*').order('created_at', { ascending: false });
    
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>Tournament Archive</h3>
        <button class="btn btn-primary" onclick="CK.openModal('uploadTournModal')">+ Upload Tournament</button>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:20px;">
        ${tourns.map(t => `
          <div class="feat-card" style="padding:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h5 style="margin:0;">${t.name}</h5>
                <p style="font-size:0.8rem; opacity:0.6; margin-top:5px;">${new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <button class="btn btn-ghost btn-sm" style="color:red;" onclick="CK.deleteTourn('${t.id}', '${t.file_name}')">🗑️</button>
            </div>
            <button class="btn btn-outline btn-sm" style="width:100%; margin-top:15px;" onclick="CK.downloadFile('${t.file_name}')">Download 📥</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function loadAchievementsTab(el) {
    const { data: achs } = await window.supabaseClient.from('achievements').select('*').order('created_at', { ascending: false });
    
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>Academy Achievements</h3>
        <button class="btn btn-primary" onclick="CK.openModal('addAchModal')">+ Add Achievement</button>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
        ${achs.map(a => `
          <div class="feat-card" style="padding:0; overflow:hidden;">
            <img src="${window.APP_CONFIG.SUPABASE_URL}/storage/v1/object/public/pdfs/${a.image_path}" style="width:100%; height:180px; object-fit:cover;">
            <div style="padding:20px;">
              <h5 style="margin:0;">${a.title}</h5>
              <p style="font-size:0.85rem; opacity:0.7; margin-top:8px;">${a.description || '-'}</p>
              <button class="btn btn-ghost btn-sm" style="color:red; margin-top:15px;" onclick="CK.deleteAch('${a.id}', '${a.image_path}')">Delete 🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function loadLeadsTab(el) {
    const { data: leads } = await window.supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
    
    el.innerHTML = `
      <h3>Demo Class Requests</h3>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>Date</th><th>Name</th><th>Phone</th><th>Age</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${leads.map(l => `
              <tr>
                <td>${new Date(l.created_at).toLocaleDateString()}</td>
                <td style="font-weight:600;">${l.full_name}</td>
                <td><a href="tel:${l.phone}">${l.phone}</a></td>
                <td>${l.age}</td>
                <td>
                  <span class="hero-badge" style="background:${l.status === 'contacted' ? '#ECFDF5' : '#FEF3C7'}; color:${l.status === 'contacted' ? '#059669' : '#D97706'}; font-size:0.7rem;">
                    ${l.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm" onclick="CK.updateLeadStatus(${l.id}, 'contacted')">✅ Mark Contacted</button>
                  <button class="btn btn-ghost btn-sm" style="color:red;" onclick="CK.deleteLead(${l.id})">🗑️</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  CK.downloadFile = (path) => {
    const url = `${window.APP_CONFIG.SUPABASE_URL}/storage/v1/object/public/pdfs/${path}`;
    window.open(url, '_blank');
  };

  CK.deleteFile = async (path) => {
    if (!confirm("Delete this file?")) return;
    try {
      await window.supabaseClient.storage.from('pdfs').remove([path]);
      await window.supabaseClient.from('document').delete().eq('file_name', path);
      CK.showToast("File deleted", "success");
      CK.loadAdminTab('files');
    } catch (err) { CK.showToast("Delete failed", "error"); }
  };

  CK.deleteTourn = async (id, path) => {
    if (!confirm("Delete this tournament?")) return;
    try {
      await window.supabaseClient.storage.from('pdfs').remove([path]);
      await window.supabaseClient.from('tourns').delete().eq('id', id);
      CK.showToast("Tournament deleted", "success");
      CK.loadAdminTab('tournaments');
    } catch (err) { CK.showToast("Delete failed", "error"); }
  };

  CK.deleteAch = async (id, path) => {
    if (!confirm("Delete this achievement?")) return;
    try {
      await window.supabaseClient.storage.from('pdfs').remove([path]);
      await window.supabaseClient.from('achievements').delete().eq('id', id);
      CK.showToast("Achievement deleted", "success");
      CK.loadAdminTab('achievements');
    } catch (err) { CK.showToast("Delete failed", "error"); }
  };

  CK.updateLeadStatus = async (id, status) => {
    try {
      await window.supabaseClient.from('leads').update({ status }).eq('id', id);
      CK.showToast("Lead updated", "success");
      CK.loadAdminTab('leads');
    } catch (err) { CK.showToast("Update failed", "error"); }
  };

  CK.deleteLead = async (id) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await window.supabaseClient.from('leads').delete().eq('id', id);
      CK.showToast("Lead deleted", "success");
      CK.loadAdminTab('leads');
    } catch (err) { CK.showToast("Delete failed", "error"); }
  };

  CK.handleMeetingSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      meetingLink: form.meetingUrl.value,
      meetingTime: new Date(form.meetingTime.value).toISOString(),
      batch: form.batch.value
    };

    try {
      CK.showToast("Scheduling reminder...", "info");
      await fetch("https://xttxauuiucmoqedkxdoa.supabase.co/functions/v1/create-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      CK.showToast("Reminder scheduled successfully!", "success");
      form.reset();
    } catch (err) {
      CK.showToast("Failed to schedule reminder", "error");
    }
  };

  CK.handleResourceUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.file.files[0];
    const user = CK.currentUser;
    
    if (!file) return CK.showToast("Please select a file", "error");

    try {
      CK.showToast("Uploading...", "info");
      const filePath = `${form.level.value}/${Date.now()}_${file.name}`;
      
      const { error: storageErr } = await window.supabaseClient.storage.from('pdfs').upload(filePath, file);
      if (storageErr) throw storageErr;

      const { error: dbErr } = await window.supabaseClient.from('document').insert([{
        file_name: filePath,
        link: form.refUrl.value,
        level: form.level.value,
        name: form.fileName.value,
        coach: user.full_name,
        created_at: new Date()
      }]);
      if (dbErr) throw dbErr;

      CK.showToast("Resource uploaded successfully! ✅", "success");
      CK.closeModal();
      CK.loadAdminTab('files');
      if (user.role === 'coach') CK.loadCoachTab('resources');
    } catch (err) {
      console.error("Upload Error:", err);
      CK.showToast("Upload failed: " + err.message, "error");
    }
  };

  CK.handleTournUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.file.files[0];
    
    if (!file) return CK.showToast("Please select a file", "error");

    try {
      CK.showToast("Uploading tournament...", "info");
      const filePath = `tournaments/${Date.now()}_${file.name}`;
      
      const { error: storageErr } = await window.supabaseClient.storage.from('pdfs').upload(filePath, file);
      if (storageErr) throw storageErr;

      const { error: dbErr } = await window.supabaseClient.from('tourns').insert([{
        file_name: filePath,
        name: form.name.value,
        created_at: new Date()
      }]);
      if (dbErr) throw dbErr;

      CK.showToast("Tournament added! 🏆", "success");
      CK.closeModal();
      CK.loadAdminTab('tournaments');
    } catch (err) {
      CK.showToast("Upload failed", "error");
    }
  };

  CK.handleAchUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.file.files[0];
    
    if (!file) return CK.showToast("Please select an image", "error");

    try {
      CK.showToast("Saving achievement...", "info");
      const filePath = `achievements/${Date.now()}_${file.name}`;
      
      const { error: storageErr } = await window.supabaseClient.storage.from('pdfs').upload(filePath, file);
      if (storageErr) throw storageErr;

      const { error: dbErr } = await window.supabaseClient.from('achievements').insert([{
        image_path: filePath,
        title: form.title.value,
        description: form.description.value,
        created_at: new Date()
      }]);
      if (dbErr) throw dbErr;

      CK.showToast("Achievement saved! 🏅", "success");
      CK.closeModal();
      CK.loadAdminTab('achievements');
    } catch (err) {
      CK.showToast("Failed to save achievement", "error");
    }
  };

  CK.handleAddUser = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const role = form.role.value;
    const fullName = form.fullName.value;

    try {
      CK.showToast("Creating account...", "info");
      
      // 1. Create Supabase Auth User
      const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, role: role } }
      });
      if (authError) throw authError;

      // 2. Insert into 'users' table
      const userData = {
        userid: authData.user.id,
        email,
        full_name: fullName,
        role: role,
        created_at: new Date()
      };

      if (role === 'student') {
        userData.level = form.level.value;
        userData.coach = form.assignedCoach.value;
      }

      const { error: dbError } = await window.supabaseClient.from('users').insert([userData]);
      if (dbError) throw dbError;

      CK.showToast("User created successfully! ✅", "success");
      CK.closeModal();
      CK.loadAdminTab('users');
    } catch (err) {
      console.error("Add User Error:", err);
      CK.showToast("Failed to create user: " + err.message, "error");
    }
  };

  CK.toggleUserFields = (role) => {
    const studentFields = document.getElementById('student-only-fields');
    studentFields.style.display = (role === 'student') ? 'block' : 'none';
  };

  CK.loadUserAttendance = async (id, name) => {
    const calendarEl = document.getElementById('attendanceCalendar');
    calendarEl.innerHTML = '♛ Loading Calendar...';
    calendarEl.style.opacity = '1';

    const { data: attendance } = await window.supabaseClient.from('attendance').select('*').eq('userid', id);
    
    // Simple calendar render (simplified for Vanilla)
    calendarEl.innerHTML = `
      <div style="width:100%;">
        <h4 style="text-align:center; margin-bottom:20px;">Attendance: ${name}</h4>
        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:10px; text-align:center;">
          ${['S','M','T','W','T','F','S'].map(d => `<div style="font-weight:bold; opacity:0.5;">${d}</div>`).join('')}
          ${Array.from({length: 30}, (_, i) => {
            const date = `2026-04-${String(i+1).padStart(2, '0')}`;
            const record = attendance.find(a => a.date === date);
            const status = record ? (record.status === 'present' ? '✅' : '❌') : '';
            return `<div style="padding:15px; background:var(--cream); border-radius:8px; position:relative;">
              ${i+1} <span style="position:absolute; bottom:5px; right:5px; font-size:0.8rem;">${status}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  };

})();