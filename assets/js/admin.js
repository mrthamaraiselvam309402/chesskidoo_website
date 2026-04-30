/* assets/js/admin.js -------------------------------------------------------
   Admin Dashboard — Matches chesskidoo.com/admin reference
   Tabs: File Management | Meetings | Attendance | User Management | Tournaments | Achievements
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};
  const SB = () => window.supabaseClient;
  const COACHES = ['SARAN','HARIS','GYANASURYA','YOGESH','ARIVUSELVAM','VISHNU','ROHITH SELVARAJ','RANJITH','SUDHIN'];

  /* ─── Tab Switching ─── */
  CK.switchAdminTab = (tab, btn) => {
    document.querySelectorAll('#admin-page .admin-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    CK.loadAdminTab(tab);
  };

  CK.loadAdminDashboard = () => {
    const first = document.querySelector('#admin-page .admin-tab');
    if (first) first.classList.add('active');
    CK.loadAdminTab('files');
  };

  CK.loadAdminTab = async (tab) => {
    const el = document.getElementById('admin-tab-content');
    if (!el) return;
    el.innerHTML = '<div class="loading-wrap">♛ Loading...</div>';
    try {
      if (tab === 'files')        await tabFiles(el);
      else if (tab === 'meetings')     tabMeetings(el);
      else if (tab === 'attendance')   await tabAttendance(el);
      else if (tab === 'users')        await tabUsers(el);
      else if (tab === 'tournaments')  tabTournaments(el);
      else if (tab === 'achievements') tabAchievements(el);
    } catch (err) {
      console.error('Admin tab error:', err);
      el.innerHTML = `<div class="error-wrap">❌ ${err.message}</div>`;
    }
  };

  /* ══════════════════════════════════════════
     FILE MANAGEMENT
  ══════════════════════════════════════════ */
  async function tabFiles(el) {
    const { data: docs } = await SB().from('document').select('*').order('created_at', { ascending: false });
    const files = docs || [];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    el.innerHTML = `
      <div class="ck-filter-bar">
        <select id="f-level" class="ck-select" onchange="CK.filterFiles()">
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select id="f-month" class="ck-select" onchange="CK.filterFiles()">
          <option value="">All Months</option>
          ${months.map((m,i)=>`<option value="${i+1}" ${i===3?'selected':''}>${m}</option>`).join('')}
        </select>
        <select id="f-coach" class="ck-select" onchange="CK.filterFiles()">
          <option value="">All Coaches</option>
          ${COACHES.map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
        <select id="f-batch" class="ck-select" onchange="CK.filterFiles()">
          <option value="">All Batches</option>
          ${[1,2,3,4,5,6,7,8,9,10,11].map(n=>`<option value="${n}">Batch ${n}</option>`).join('')}
        </select>
        <div style="flex:1"></div>
        <button class="ck-btn ck-btn-green" onclick="CK.exportFilesExcel()">📊 Export To Excel</button>
        <button class="ck-btn ck-btn-dark" onclick="CK.openModal('uploadModal')">📤 Upload Files</button>
      </div>

      <div class="ck-table-wrap">
        <table class="ck-table" id="files-table">
          <thead><tr>
            <th>Date Uploaded</th><th>Document</th><th>Notes</th><th>Reference URL</th><th>Coach</th><th>Actions</th>
          </tr></thead>
          <tbody id="files-tbody">${renderFileRows(files)}</tbody>
        </table>
      </div>
    `;
    window._ckFiles = files;
  }

  function renderFileRows(files) {
    if (!files.length) return `<tr><td colspan="6" class="ck-empty">No files uploaded yet.</td></tr>`;
    return files.map(f => `
      <tr>
        <td>${new Date(f.created_at).toLocaleDateString('en-GB')}</td>
        <td><a href="#" onclick="CK.downloadFile('${f.file_name}')" style="color:#D97706; text-decoration:none; word-break:break-all;">${f.file_name?.split('/').pop() || f.name || '-'}</a></td>
        <td>${f.name || '-'}</td>
        <td>${f.link ? `<a href="${f.link}" target="_blank" style="color:#D97706;">🔗 Link</a>` : '-'}</td>
        <td>${f.coach || '-'}</td>
        <td>
          <button class="ck-btn ck-btn-sm ck-btn-red" onclick="CK.deleteFile('${f.file_name}')">🗑 Delete</button>
        </td>
      </tr>
    `).join('');
  }

  CK.filterFiles = () => {
    const level  = document.getElementById('f-level')?.value;
    const month  = document.getElementById('f-month')?.value;
    const coach  = document.getElementById('f-coach')?.value;
    const batch  = document.getElementById('f-batch')?.value;
    let filtered = (window._ckFiles || []);
    if (level) filtered = filtered.filter(f => f.level === level);
    if (coach) filtered = filtered.filter(f => f.coach === coach);
    if (batch) filtered = filtered.filter(f => String(f.batch) === batch);
    if (month) filtered = filtered.filter(f => new Date(f.created_at).getMonth() + 1 === parseInt(month));
    document.getElementById('files-tbody').innerHTML = renderFileRows(filtered);
  };

  CK.exportFilesExcel = () => {
    const rows = (window._ckFiles || []).map(f => [
      new Date(f.created_at).toLocaleDateString('en-GB'),
      f.file_name?.split('/').pop() || '', f.name || '', f.link || '', f.coach || ''
    ]);
    let csv = 'Date,Document,Notes,Reference URL,Coach\n' + rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], {type:'text/csv'})),
      download: 'files_export.csv', style:'display:none'
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    CK.showToast('Exported!', 'success');
  };

  /* ══════════════════════════════════════════
     MEETINGS
  ══════════════════════════════════════════ */
  function tabMeetings(el) {
    el.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:flex-start; padding:40px 0;">
        <div class="ck-card" style="width:100%; max-width:480px; padding:40px;">
          <h3 style="text-align:center; font-family:var(--font-display); margin-bottom:30px;">Schedule Meeting Reminder</h3>
          <form onsubmit="CK.scheduleMeeting(event)">
            <input class="ck-input" type="url" id="meet-url" placeholder="Meeting URL" required style="margin-bottom:16px;">
            <input class="ck-input" type="datetime-local" id="meet-dt" required style="margin-bottom:16px;">
            <input class="ck-input" type="text" id="meet-batch" placeholder="Batch (e.g. 1)" required style="margin-bottom:24px;">
            <button type="submit" class="ck-btn ck-btn-primary" style="width:100%; padding:14px; font-size:0.9rem; letter-spacing:0.1em;">
              SCHEDULE REMINDER
            </button>
          </form>
          <div id="meetings-list" style="margin-top:30px;"></div>
        </div>
      </div>
    `;
    loadMeetingsList();
  }

  async function loadMeetingsList() {
    const box = document.getElementById('meetings-list');
    if (!box) return;
    try {
      const { data } = await SB().from('meetings').select('*').order('meeting_time', { ascending: true }).limit(10);
      if (!data?.length) { box.innerHTML = '<p style="text-align:center;opacity:0.5;font-size:0.85rem;">No upcoming meetings.</p>'; return; }
      box.innerHTML = `<h5 style="margin-bottom:12px; opacity:0.6;">Upcoming</h5>` + data.map(m => `
        <div style="background:var(--cream); padding:12px 16px; border-radius:10px; margin-bottom:10px; font-size:0.85rem;">
          <div style="font-weight:700;">${new Date(m.meeting_time).toLocaleString()}</div>
          <div style="opacity:0.6;">Batch ${m.batch} — <a href="${m.url}" target="_blank" style="color:var(--amber);">Join Link</a></div>
        </div>
      `).join('');
    } catch(e) {}
  }

  CK.scheduleMeeting = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    btn.textContent = 'Scheduling...'; btn.disabled = true;
    try {
      await SB().from('meetings').insert({
        url: document.getElementById('meet-url').value,
        meeting_time: document.getElementById('meet-dt').value,
        batch: document.getElementById('meet-batch').value
      });
      CK.showToast('Meeting scheduled!', 'success');
      e.target.reset();
      loadMeetingsList();
    } catch(err) {
      CK.showToast('Failed: ' + err.message, 'error');
    } finally { btn.textContent = 'SCHEDULE REMINDER'; btn.disabled = false; }
  };

  /* ══════════════════════════════════════════
     ATTENDANCE — Calendar View per Coach
  ══════════════════════════════════════════ */
  let _attCoach = COACHES[0];
  let _attDate  = new Date();

  async function tabAttendance(el) {
    el.innerHTML = `
      <h2 style="text-align:center; font-family:var(--font-display); margin-bottom:24px;">User Attendance</h2>
      <div class="ck-coach-tabs" id="att-coach-tabs">
        ${COACHES.map((c,i) => `
          <button class="ck-coach-tab ${i===0?'active':''}" onclick="CK.switchAttCoach('${c}', this)">${c}</button>
        `).join('')}
      </div>
      <div id="att-calendar" style="margin-top:30px;"></div>
    `;
    renderAttCalendar();
  }

  CK.switchAttCoach = (coach, btn) => {
    document.querySelectorAll('.ck-coach-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _attCoach = coach;
    renderAttCalendar();
  };

  async function renderAttCalendar() {
    const box = document.getElementById('att-calendar');
    if (!box) return;
    const y = _attDate.getFullYear(), m = _attDate.getMonth();
    const monthName = _attDate.toLocaleString('default',{month:'long'});
    const firstDay  = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const today = new Date();

    // Fetch attendance records for this coach's students this month
    const start = `${y}-${String(m+1).padStart(2,'0')}-01`;
    const end   = `${y}-${String(m+1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`;

    let attMap = {};
    try {
      // Get students under this coach
      const { data: students } = await SB().from('users')
        .select('id').eq('coach', _attCoach).eq('role','student');
      const ids = (students||[]).map(s=>s.id);
      if (ids.length) {
        const { data: att } = await SB().from('attendance')
          .select('userid, date, status')
          .in('userid', ids)
          .gte('date', start).lte('date', end);
        // Aggregate: count present per day
        (att||[]).forEach(a => {
          const d = a.date; // yyyy-mm-dd
          if (!attMap[d]) attMap[d] = { present:0, total:0 };
          attMap[d].total++;
          if (a.status === 'present') attMap[d].present++;
        });
      }
    } catch(e) {}

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let cells = '';
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) cells += `<div class="ck-cal-cell ck-cal-empty"></div>`;
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isPast  = new Date(y, m, d) <= today;
      const rec = attMap[dateStr];
      let icon = '';
      if (isPast && rec) {
        icon = rec.present > 0
          ? `<div class="ck-cal-check">✓</div>`
          : `<div class="ck-cal-cross">✗</div>`;
      } else if (isPast) {
        icon = `<div class="ck-cal-cross">✗</div>`;
      }
      cells += `
        <div class="ck-cal-cell ${isPast && rec?.present ? 'ck-cal-present' : isPast ? 'ck-cal-absent' : ''}">
          <div class="ck-cal-num">${d}</div>
          ${icon}
        </div>`;
    }

    box.innerHTML = `
      <div class="ck-cal-nav">
        <button class="ck-btn ck-btn-sm" onclick="CK.prevMonth()">← Prev</button>
        <h3>${monthName} ${y}</h3>
        <button class="ck-btn ck-btn-sm" onclick="CK.nextMonth()">Next →</button>
      </div>
      <div class="ck-cal-grid">
        ${days.map(d=>`<div class="ck-cal-header">${d}</div>`).join('')}
        ${cells}
      </div>
    `;
  }

  CK.prevMonth = () => { _attDate.setMonth(_attDate.getMonth()-1); renderAttCalendar(); };
  CK.nextMonth = () => { _attDate.setMonth(_attDate.getMonth()+1); renderAttCalendar(); };

  /* ══════════════════════════════════════════
     USER MANAGEMENT
  ══════════════════════════════════════════ */
  async function tabUsers(el) {
    const { data: users } = await SB().from('users').select('*').order('full_name');
    window._ckUsers = users || [];

    el.innerHTML = `
      <div class="ck-filter-bar" style="margin-bottom:24px;">
        <select class="ck-select" onchange="CK.filterByCoach(this.value)">
          <option value="">Select Coach</option>
          ${COACHES.map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
        <div style="flex:1"></div>
        <button class="ck-btn ck-btn-dark" onclick="CK.openModal('addUserModal')">
          👤 Add Student
        </button>
      </div>
      <div class="ck-table-wrap">
        <table class="ck-table" id="users-table">
          <thead><tr>
            <th>UserId</th><th>Full Name</th><th>Email ID</th><th>Level</th><th>Coach</th><th>Fee</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody id="users-tbody">${renderUserRows(window._ckUsers)}</tbody>
        </table>
      </div>
    `;
  }

  function renderUserRows(users) {
    if (!users?.length) return `<tr><td colspan="8" class="ck-empty">No students found.</td></tr>`;
    return users.filter(u => u.role !== 'admin').map((u,i) => `
      <tr>
        <td style="color:var(--amber); font-weight:700;">${1000 + i}</td>
        <td style="font-weight:600;">${u.full_name || '-'}</td>
        <td style="opacity:0.7;">${u.email || '-'}</td>
        <td><span class="status-pill ${(u.level||'').toLowerCase().includes('inter') ? 'enrolled' : 'new'}">${(u.level||'beginner').split(' ')[0]}</span></td>
        <td>${u.coach || '-'}</td>
        <td style="font-weight:600;">${u.fee || '-'}</td>
        <td><span class="status-pill ${(u.payment_status||'').toLowerCase()}">${u.payment_status||'Pending'}</span></td>
        <td style="display:flex; gap:6px;">
          <button class="ck-btn ck-btn-sm ck-btn-outline" onclick="CK.editUser('${u.id}')">✏️ Edit</button>
          <button class="ck-btn ck-btn-sm ck-btn-red" onclick="CK.deleteUser('${u.id}')">🗑 Delete</button>
        </td>
      </tr>
    `).join('');
  }

  CK.filterByCoach = (coach) => {
    const filtered = coach ? (window._ckUsers||[]).filter(u=>u.coach===coach) : (window._ckUsers||[]);
    document.getElementById('users-tbody').innerHTML = renderUserRows(filtered);
  };

  CK.deleteUser = async (id) => {
    if (!confirm('Remove this student permanently?')) return;
    await SB().from('users').delete().eq('id', id);
    CK.showToast('Student removed.', 'success');
    CK.loadAdminTab('users');
  };

  CK.editUser = (id) => {
    const u = (window._ckUsers||[]).find(x=>x.id===id);
    if (!u) return;
    CK.showToast(`Edit for ${u.full_name} — form coming soon!`, 'info');
  };

  CK.exportUsersCSV = () => {
    const headers = ['Name','Email','Level','Coach','Schedule','Fee','Payment'];
    const rows = (window._ckUsers||[]).map(u=>[u.full_name,u.email,u.level,u.coach,u.schedule,u.fee,u.payment_status].map(v=>`"${v||''}"`));
    const csv = [headers, ...rows].map(r=>r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})),download:'roster.csv',style:'display:none'});
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  /* ══════════════════════════════════════════
     TOURNAMENTS & ACHIEVEMENTS (stubs)
  ══════════════════════════════════════════ */
  function tabTournaments(el) {
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0;">Tournament Results</h3>
        <button class="ck-btn ck-btn-dark" onclick="CK.openModal('uploadTournModal')">+ Add Tournament</button>
      </div>
      <div class="ck-empty-state">🏆<p>No tournament data yet. Add your first result!</p></div>
    `;
  }

  function tabAchievements(el) {
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0;">Student Achievements</h3>
        <button class="ck-btn ck-btn-dark" onclick="CK.openModal('addAchModal')">+ Add Achievement</button>
      </div>
      <div class="ck-empty-state">🥇<p>No achievements posted yet. Celebrate your champions!</p></div>
    `;
  }

})();