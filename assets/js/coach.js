/* assets/js/coach.js -------------------------------------------------------
   Coach Dashboard logic for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};
  const SB = () => window.supabaseClient;

  CK.switchCoachTab = (tab, btn) => {
    document.querySelectorAll('#coach-page .admin-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    CK.loadCoachTab(tab);
  };

  CK.loadCoachDashboard = () => {
    const first = document.querySelector('#coach-page .admin-tab');
    if (first) first.classList.add('active');
    CK.loadCoachTab('students');
  };

  CK.loadCoachTab = async (tab) => {
    const el = document.getElementById('coach-tab-content');
    if (!el) return;
    el.innerHTML = '<div class="loading-wrap">♛ Loading...</div>';

    try {
      const user = CK.currentUser;
      if (!user) throw new Error("Not logged in");

      if (tab === 'students')        await tabCoachStudents(el, user);
      else if (tab === 'attendance') await tabCoachAttendance(el, user);
      else if (tab === 'resources')  await tabCoachResources(el, user);
    } catch (err) {
      console.error("Coach Tab Error:", err);
      el.innerHTML = `<div class="error-wrap">❌ Error: ${err.message}</div>`;
    }
  };

  async function tabCoachStudents(el, coach) {
    const { data: students } = await SB().from('users')
      .select('*')
      .eq('coach', coach.full_name)
      .eq('role', 'student');

    const list = students || [];

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0;">My Roster (${list.length})</h3>
        <button class="ck-btn ck-btn-dark" onclick="CK.exportCoachCSV()">📥 Export Roster</button>
      </div>
      <div class="ck-table-wrap">
        <table class="ck-table">
          <thead>
            <tr><th>Student Name</th><th>Level</th><th>Batch</th><th>Rating</th></tr>
          </thead>
          <tbody>
            ${list.length ? list.map(s => `
              <tr>
                <td style="font-weight:600; color:var(--ink);">${s.full_name}</td>
                <td><span class="status-pill ${(s.level||'').toLowerCase().includes('inter')?'enrolled':'new'}">${s.level || 'Beginner'}</span></td>
                <td>${s.batch || '-'}</td>
                <td style="color:var(--amber); font-weight:700;">${s.star || 0} ★</td>
              </tr>
            `).join('') : `<tr><td colspan="4" class="ck-empty">No students assigned to you yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
    window._ckCoachStudents = list;
  }

  CK.exportCoachCSV = () => {
    const rows = (window._ckCoachStudents||[]).map(s=>[s.full_name, s.level, s.batch, s.star].map(v=>`"${v||''}"`));
    const csv = 'Student Name,Level,Batch,Rating\n' + rows.map(r=>r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], {type:'text/csv'})),
      download: 'my_students.csv', style: 'display:none'
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  async function tabCoachAttendance(el, coach) {
    const { data: students } = await SB().from('users')
      .select('id, full_name, batch')
      .eq('coach', coach.full_name)
      .eq('role', 'student')
      .order('full_name');
    
    const list = students || [];
    const today = new Date().toISOString().split('T')[0];

    // Fetch who is already marked today
    const { data: att } = await SB().from('attendance')
      .select('userid, status')
      .in('userid', list.map(s=>s.id))
      .eq('date', today);
    
    const attMap = {};
    (att||[]).forEach(a => attMap[a.userid] = a.status);

    el.innerHTML = `
      <div style="margin-bottom:24px;">
        <h3 style="margin:0;">Mark Attendance</h3>
        <p style="opacity:0.6; font-size:0.9rem;">Date: <strong style="color:var(--ink);">${new Date().toLocaleDateString('en-GB')}</strong></p>
      </div>
      <div class="ck-table-wrap">
        <table class="ck-table">
          <thead>
            <tr><th>Student</th><th>Batch</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${list.length ? list.map(s => {
              const status = attMap[s.id];
              let statusHTML = '-';
              if (status === 'present') statusHTML = '<span style="color:#166534; font-weight:700;">✅ Present</span>';
              if (status === 'absent')  statusHTML = '<span style="color:#dc2626; font-weight:700;">❌ Absent</span>';

              return `
              <tr>
                <td style="font-weight:600;">${s.full_name}</td>
                <td>${s.batch || '-'}</td>
                <td id="c-att-status-${s.id}">${statusHTML}</td>
                <td>
                  <div style="display:flex; gap:8px;">
                    <button class="ck-btn ck-btn-sm ck-btn-green" onclick="CK.markStudentAtt('${s.id}', 'present')">Present</button>
                    <button class="ck-btn ck-btn-sm ck-btn-red" onclick="CK.markStudentAtt('${s.id}', 'absent')">Absent</button>
                  </div>
                </td>
              </tr>
            `}).join('') : `<tr><td colspan="4" class="ck-empty">No students found.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  CK.markStudentAtt = async (id, status) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const { error } = await SB().from('attendance').upsert({
        userid: id, date: date, status: status
      });
      if (error) throw error;
      document.getElementById(`c-att-status-${id}`).innerHTML = status === 'present' 
        ? '<span style="color:#166534; font-weight:700;">✅ Present</span>'
        : '<span style="color:#dc2626; font-weight:700;">❌ Absent</span>';
      CK.showToast(`Marked ${status}!`, 'success');
    } catch(err) {
      CK.showToast('Failed to mark', 'error');
    }
  };

  async function tabCoachResources(el, coach) {
    const { data: files } = await SB().from('document')
      .select('*')
      .eq('coach', coach.full_name)
      .order('created_at', { ascending: false });

    const list = files || [];

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0;">My Shared Resources</h3>
        <button class="ck-btn ck-btn-dark" onclick="CK.openModal('uploadModal')">📤 Upload Resource</button>
      </div>
      <div class="ck-table-wrap">
        <table class="ck-table">
          <thead>
            <tr><th>Date</th><th>Document</th><th>Level</th><th>Links</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${list.length ? list.map(f => `
              <tr>
                <td>${new Date(f.created_at).toLocaleDateString('en-GB')}</td>
                <td style="font-weight:600;"><a href="#" onclick="CK.downloadFile('${f.file_name}')" style="color:#D97706; text-decoration:none;">${f.file_name?.split('/').pop() || f.name}</a></td>
                <td><span class="status-pill enrolled">${f.level}</span></td>
                <td>
                  ${f.link ? `<a href="${f.link}" target="_blank" style="color:var(--amber);">🔗 Link</a>` : '-'}
                </td>
                <td>
                  <button class="ck-btn ck-btn-sm ck-btn-red" onclick="CK.deleteFile('${f.file_name}')">🗑️</button>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="5" class="ck-empty">No resources uploaded yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

})();