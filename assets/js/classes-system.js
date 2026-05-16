/* assets/js/classes-system.js
   ChessKidoo — Class Management System
   Coach creates/edits/deletes classes, marks own attendance by clicking class link,
   marks student attendance per session, admin sees all class data. */

window.CK = window.CK || {};

CK.classSystem = (() => {
  const CLASSES_KEY  = 'ck_classes';
  const CATTN_KEY    = 'ck_coach_attendance';  // coach's own attendance
  const SATTN_KEY    = 'ck_student_attendance'; // student attendance per class

  /* ─── Storage helpers ─── */
  const getClasses     = () => JSON.parse(localStorage.getItem(CLASSES_KEY) || '[]');
  const saveClasses    = d  => localStorage.setItem(CLASSES_KEY, JSON.stringify(d));
  const getCoachAttn   = () => JSON.parse(localStorage.getItem(CATTN_KEY) || '[]');
  const saveCoachAttn  = d  => localStorage.setItem(CATTN_KEY, JSON.stringify(d));
  const getStudentAttn = () => JSON.parse(localStorage.getItem(SATTN_KEY) || '[]');
  const saveStudentAttn= d  => localStorage.setItem(SATTN_KEY, JSON.stringify(d));
  const uid            = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const today          = () => new Date().toISOString().split('T')[0];

  /* ─── seed default classes so coaches see something on first load ─── */
  function _seed() {
    if (getClasses().length) return;
    saveClasses([
      { id:'cls1', coachId:'c1', coachName:'ARIVUSELVAM', title:'Beginner Fundamentals', level:'Beginner', batch:'Group', days:['Mon','Thu'], time:'17:00', duration:60, zoomLink:'https://meet.google.com/beg-ari-abc', studentIds:['s1','s8','s27'], maxStudents:10, active:true, createdAt: today() },
      { id:'cls2', coachId:'c2', coachName:'GYANASURYA',  title:'Weekend Tactics',        level:'Beginner', batch:'WEEKEND', days:['Sat','Sun'], time:'10:00', duration:90, zoomLink:'https://meet.google.com/gya-wk-xyz', studentIds:['s2','s9','s21'], maxStudents:10, active:true, createdAt: today() },
      { id:'cls3', coachId:'c3', coachName:'VISHNU',      title:'Intermediate Strategy',  level:'Intermediate', batch:'FRI&SAT', days:['Fri','Sat'], time:'16:00', duration:75, zoomLink:'https://meet.google.com/vis-int-str', studentIds:['s3','s14','s19'], maxStudents:8, active:true, createdAt: today() },
      { id:'cls4', coachId:'c7', coachName:'RANJITH',     title:'Advanced Openings',      level:'Advanced', batch:'Weekend', days:['Sat'], time:'09:00', duration:90, zoomLink:'https://meet.google.com/raj-adv-opn', studentIds:['s26','s35','s36'], maxStudents:6, active:true, createdAt: today() }
    ]);
  }
  _seed();

  /* ═══════════════════════════════════════════════════════════
     COACH — CLASS MANAGEMENT
  ══════════════════════════════════════════════════════════════ */

  function getCoachClasses(coachId) {
    return getClasses().filter(c => c.coachId === coachId);
  }

  function renderCoachClasses(containerId, coachId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const classes = getCoachClasses(coachId);
    if (!classes.length) {
      el.innerHTML = `<div class="cls-empty">📭 No classes yet. Create your first class above.</div>`;
      return;
    }
    const attnToday = getCoachAttn().filter(a => a.date === today());
    el.innerHTML = classes.map(c => {
      const attended = attnToday.find(a => a.classId === c.id);
      const days = (c.days || []).join(', ');
      const studCount = (c.studentIds || []).length;
      return `
        <div class="cls-class-card ${attended ? 'cls-class-attended' : ''}">
          <div class="cls-class-header">
            <div>
              <div class="cls-class-title">${c.title}</div>
              <div class="cls-class-meta">${days} · ${c.time} · ${c.duration}min · <span class="p-badge p-badge-${c.level==='Beginner'?'green':c.level==='Intermediate'?'blue':'gold'}">${c.level}</span></div>
            </div>
            <div class="cls-class-actions">
              <button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.classSystem.editClass('${c.id}')">✏️ Edit</button>
              <button class="p-btn p-btn-ghost p-btn-sm" style="color:var(--p-danger)" onclick="CK.classSystem.deleteClass('${c.id}')">🗑️</button>
            </div>
          </div>
          <div class="cls-class-body">
            <div class="cls-class-link">
              <span>🔗</span>
              <a href="${c.zoomLink}" target="_blank" class="cls-zoom-link" onclick="CK.classSystem.markCoachAttendance('${c.id}','${coachId}'); return true;">${c.zoomLink}</a>
            </div>
            <div class="cls-class-footer">
              <span>👥 ${studCount} / ${c.maxStudents} students</span>
              ${attended
                ? `<span class="p-badge p-badge-green">✅ Attended today ${new Date(attended.joinedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>`
                : `<button class="p-btn p-btn-teal p-btn-sm" onclick="CK.classSystem.markCoachAttendance('${c.id}','${coachId}')">▶ Mark My Attendance</button>`}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function createClass(data, coachId, coachName) {
    const cls = {
      id: uid(),
      coachId, coachName,
      title: data.title || 'New Class',
      level: data.level || 'Beginner',
      batch: data.batch || 'Group',
      days: data.days || [],
      time: data.time || '17:00',
      duration: parseInt(data.duration) || 60,
      zoomLink: data.zoomLink || '',
      maxStudents: parseInt(data.maxStudents) || 10,
      studentIds: [],
      active: true,
      createdAt: today()
    };
    const all = getClasses();
    all.push(cls);
    saveClasses(all);
    CK.showToast(`Class "${cls.title}" created!`, 'success');
    return cls;
  }

  function editClass(classId) {
    const all = getClasses();
    const cls = all.find(c => c.id === classId);
    if (!cls) return;
    openClassModal(cls, (updated) => {
      Object.assign(cls, updated);
      saveClasses(all);
      CK.showToast('Class updated!', 'success');
      if (window.CK && CK.coach) CK.coach.renderClassesPanel();
    });
  }

  function deleteClass(classId) {
    if (!confirm('Delete this class? This will also remove its attendance records.')) return;
    saveClasses(getClasses().filter(c => c.id !== classId));
    const cattn = getCoachAttn().filter(a => a.classId !== classId);
    saveCoachAttn(cattn);
    const sattn = getStudentAttn().filter(a => a.classId !== classId);
    saveStudentAttn(sattn);
    CK.showToast('Class deleted.', 'success');
    if (window.CK && CK.coach) CK.coach.renderClassesPanel();
  }

  function openClassModal(existing, onSave) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const sel = (d) => (existing && existing.days && existing.days.includes(d)) ? 'checked' : '';
    const modal = document.createElement('div');
    modal.className = 'cls-modal-overlay';
    modal.innerHTML = `
      <div class="cls-modal">
        <div class="cls-modal-header">
          <h3>${existing ? '✏️ Edit Class' : '➕ Create New Class'}</h3>
          <button class="cls-modal-close" onclick="this.closest('.cls-modal-overlay').remove()">✕</button>
        </div>
        <div class="cls-modal-body">
          <div class="cls-form-row">
            <label>Class Title</label>
            <input class="p-input" id="cmod_title" value="${existing?.title || ''}" placeholder="e.g. Beginner Fundamentals">
          </div>
          <div class="cls-form-row">
            <label>Level</label>
            <select class="p-input" id="cmod_level">
              ${['Beginner','Intermediate','Advanced'].map(l=>`<option ${existing?.level===l?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="cls-form-row">
            <label>Batch Name</label>
            <input class="p-input" id="cmod_batch" value="${existing?.batch || ''}" placeholder="e.g. Evening, Weekend">
          </div>
          <div class="cls-form-row">
            <label>Days</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              ${days.map(d=>`<label class="cls-day-check"><input type="checkbox" value="${d}" ${sel(d)}> ${d}</label>`).join('')}
            </div>
          </div>
          <div class="cls-form-2col">
            <div class="cls-form-row">
              <label>Start Time</label>
              <input class="p-input" type="time" id="cmod_time" value="${existing?.time || '17:00'}">
            </div>
            <div class="cls-form-row">
              <label>Duration (min)</label>
              <input class="p-input" type="number" id="cmod_duration" value="${existing?.duration || 60}" min="15" max="180">
            </div>
          </div>
          <div class="cls-form-row">
            <label>Max Students</label>
            <input class="p-input" type="number" id="cmod_max" value="${existing?.maxStudents || 10}" min="1" max="30">
          </div>
          <div class="cls-form-row">
            <label>Class Link (Zoom / Google Meet)</label>
            <input class="p-input" id="cmod_zoom" value="${existing?.zoomLink || ''}" placeholder="https://meet.google.com/xxx-yyy-zzz">
          </div>
        </div>
        <div class="cls-modal-footer">
          <button class="p-btn p-btn-ghost" onclick="this.closest('.cls-modal-overlay').remove()">Cancel</button>
          <button class="p-btn p-btn-blue" id="cmod_save">💾 Save Class</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#cmod_save').addEventListener('click', () => {
      const days = [...modal.querySelectorAll('input[type=checkbox]:checked')].map(cb => cb.value);
      onSave({
        title: modal.querySelector('#cmod_title').value.trim(),
        level: modal.querySelector('#cmod_level').value,
        batch: modal.querySelector('#cmod_batch').value.trim(),
        days,
        time: modal.querySelector('#cmod_time').value,
        duration: modal.querySelector('#cmod_duration').value,
        maxStudents: modal.querySelector('#cmod_max').value,
        zoomLink: modal.querySelector('#cmod_zoom').value.trim()
      });
      modal.remove();
    });
  }

  /* ─── Coach marks own attendance when joining a class ─── */
  function markCoachAttendance(classId, coachId) {
    const records = getCoachAttn();
    const existing = records.find(r => r.classId === classId && r.date === today());
    if (existing) {
      CK.showToast('Attendance already marked for today!', 'info'); return;
    }
    records.push({ id: uid(), coachId, classId, date: today(), joinedAt: new Date().toISOString() });
    saveCoachAttn(records);
    CK.showToast('✅ Your attendance has been marked for today!', 'success');
    if (window.CK && CK.coach) CK.coach.renderClassesPanel();
  }

  /* ═══════════════════════════════════════════════════════════
     COACH — MARK STUDENT ATTENDANCE
  ══════════════════════════════════════════════════════════════ */

  function renderAttendanceMarker(containerId, coachId, dateStr) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const date = dateStr || today();
    const classes = getCoachClasses(coachId);
    if (!classes.length) {
      el.innerHTML = `<div class="cls-empty">No classes to take attendance for.</div>`; return;
    }
    const allStudents = JSON.parse(localStorage.getItem('ck_db_users') || '[]').filter(u => u.role === 'student');
    const attnRecords = getStudentAttn().filter(a => a.date === date && a.coachId === coachId);

    el.innerHTML = `
      <div class="cls-attn-date-row">
        <label>Date:</label>
        <input class="p-input" type="date" id="attnDatePicker" value="${date}" onchange="CK.classSystem.renderAttendanceMarker('${containerId}','${coachId}',this.value)">
      </div>
      ${classes.map(cls => {
        const classStudents = allStudents.filter(s => (cls.studentIds||[]).includes(s.id));
        return `
          <div class="cls-attn-section">
            <div class="cls-attn-class-title">📋 ${cls.title} <span class="p-badge p-badge-blue">${cls.days?.join(', ')} ${cls.time}</span></div>
            <div class="cls-attn-grid">
              ${classStudents.length ? classStudents.map(s => {
                const rec = attnRecords.find(a => a.studentId === s.id && a.classId === cls.id);
                const status = rec?.status || '';
                return `
                  <div class="cls-attn-row">
                    <div class="cls-attn-name">${s.full_name}</div>
                    <div class="cls-attn-btns">
                      <button class="cls-attn-btn ${status==='present'?'active-present':''}" onclick="CK.classSystem.markStudentAttn('${s.id}','${s.full_name}','${cls.id}','${cls.title}','${coachId}','${date}','present','${containerId}')">✅ Present</button>
                      <button class="cls-attn-btn ${status==='absent'?'active-absent':''}" onclick="CK.classSystem.markStudentAttn('${s.id}','${s.full_name}','${cls.id}','${cls.title}','${coachId}','${date}','absent','${containerId}')">❌ Absent</button>
                      <button class="cls-attn-btn ${status==='late'?'active-late':''}" onclick="CK.classSystem.markStudentAttn('${s.id}','${s.full_name}','${cls.id}','${cls.title}','${coachId}','${date}','late','${containerId}')">⏰ Late</button>
                    </div>
                  </div>`;
              }).join('') : `<div class="cls-empty" style="padding:12px;">No students assigned to this class yet.</div>`}
            </div>
          </div>`;
      }).join('')}`;
  }

  function markStudentAttn(studentId, studentName, classId, className, coachId, date, status, containerId) {
    const records = getStudentAttn();
    const idx = records.findIndex(r => r.studentId === studentId && r.classId === classId && r.date === date);
    const entry = { id: uid(), studentId, studentName, classId, className, coachId, date, status, markedAt: new Date().toISOString() };
    if (idx !== -1) records[idx] = entry; else records.push(entry);
    saveStudentAttn(records);

    // Also sync into the main ck_db_attendance for student portal
    const main = JSON.parse(localStorage.getItem('ck_db_attendance') || '[]');
    const mi = main.findIndex(r => r.userid === studentId && r.date === date);
    const mEntry = { id: uid(), userid: studentId, date, status };
    if (mi !== -1) main[mi] = mEntry; else main.push(mEntry);
    localStorage.setItem('ck_db_attendance', JSON.stringify(main));

    CK.showToast(`${studentName}: ${status}`, status === 'present' ? 'success' : status === 'late' ? 'warning' : 'error');
    renderAttendanceMarker(containerId, coachId, date);
  }

  /* ═══════════════════════════════════════════════════════════
     COACH — ASSIGN STUDENTS TO CLASSES
  ══════════════════════════════════════════════════════════════ */

  function openAssignStudentsModal(classId) {
    const all = getClasses();
    const cls = all.find(c => c.id === classId);
    if (!cls) return;
    const allStudents = JSON.parse(localStorage.getItem('ck_db_users') || '[]').filter(u => u.role === 'student');
    const modal = document.createElement('div');
    modal.className = 'cls-modal-overlay';
    modal.innerHTML = `
      <div class="cls-modal">
        <div class="cls-modal-header"><h3>👥 Assign Students — ${cls.title}</h3><button class="cls-modal-close" onclick="this.closest('.cls-modal-overlay').remove()">✕</button></div>
        <div class="cls-modal-body" style="max-height:400px;overflow-y:auto;">
          ${allStudents.map(s => `
            <label class="cls-assign-student-row">
              <input type="checkbox" value="${s.id}" ${(cls.studentIds||[]).includes(s.id)?'checked':''}>
              <span>${s.full_name}</span>
              <span class="p-badge p-badge-${s.level==='Beginner'?'green':s.level==='Intermediate'?'blue':'gold'}">${s.level||'Beginner'}</span>
            </label>`).join('')}
        </div>
        <div class="cls-modal-footer">
          <button class="p-btn p-btn-ghost" onclick="this.closest('.cls-modal-overlay').remove()">Cancel</button>
          <button class="p-btn p-btn-blue" id="assignSaveBtn">💾 Save Assignments</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#assignSaveBtn').addEventListener('click', () => {
      cls.studentIds = [...modal.querySelectorAll('input[type=checkbox]:checked')].map(cb => cb.value);
      saveClasses(all);
      CK.showToast('Students assigned!', 'success');
      modal.remove();
      if (window.CK && CK.coach) CK.coach.renderClassesPanel();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     ADMIN — ALL CLASSES VIEW
  ══════════════════════════════════════════════════════════════ */

  function renderAdminClasses(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const classes = getClasses();
    const coachAttn = getCoachAttn();
    el.innerHTML = `
      <table class="p-table" style="width:100%">
        <thead><tr><th>Class</th><th>Coach</th><th>Level</th><th>Days/Time</th><th>Students</th><th>Coach Attendance (This Month)</th></tr></thead>
        <tbody>
          ${classes.map(c => {
            const thisMonth = new Date().toISOString().slice(0,7);
            const attended = coachAttn.filter(a => a.classId === c.id && a.date.startsWith(thisMonth)).length;
            return `<tr>
              <td style="font-weight:600">${c.title}</td>
              <td>${c.coachName}</td>
              <td><span class="p-badge p-badge-${c.level==='Beginner'?'green':c.level==='Intermediate'?'blue':'gold'}">${c.level}</span></td>
              <td>${(c.days||[]).join(', ')} ${c.time}</td>
              <td>${(c.studentIds||[]).length} / ${c.maxStudents}</td>
              <td><span class="p-badge p-badge-${attended>=4?'green':'yellow'}">${attended} sessions</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  }

  /* ─── Coach Attendance Report (admin) ─── */
  function renderCoachAttendanceReport(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const coachAttn = getCoachAttn();
    const classes   = getClasses();
    const coaches   = JSON.parse(localStorage.getItem('ck_db_users') || '[]').filter(u => u.role === 'coach');
    const thisMonth = new Date().toISOString().slice(0,7);

    el.innerHTML = `
      <div class="cls-report-header">Coach Attendance Report — ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
      <table class="p-table" style="width:100%;margin-top:12px;">
        <thead><tr><th>Coach</th><th>Sessions Taken</th><th>Unique Days</th><th>Last Session</th><th>Status</th></tr></thead>
        <tbody>
          ${coaches.map(coach => {
            const records = coachAttn.filter(a => a.date.startsWith(thisMonth) && classes.find(c => c.id === a.classId && c.coachId === coach.id));
            const uniqueDays = [...new Set(records.map(r => r.date))].length;
            const last = records.sort((a,b) => b.date.localeCompare(a.date))[0];
            return `<tr>
              <td style="font-weight:600">${coach.full_name}</td>
              <td>${records.length}</td>
              <td>${uniqueDays}</td>
              <td>${last ? last.date : '—'}</td>
              <td><span class="p-badge p-badge-${records.length >= 8 ? 'green' : records.length >= 4 ? 'yellow' : 'red'}">${records.length >= 8 ? 'Active' : records.length >= 4 ? 'Moderate' : 'Low'}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  }

  /* ═══════════════════════════════════════════════════════════
     STUDENT — GET MY CLASSES
  ══════════════════════════════════════════════════════════════ */

  function getStudentClasses(studentId) {
    return getClasses().filter(c => (c.studentIds || []).includes(studentId));
  }

  function getStudentAttendanceSummary(studentId) {
    const records = getStudentAttn().filter(r => r.studentId === studentId);
    const present = records.filter(r => r.status === 'present').length;
    const total   = records.length;
    return { present, absent: records.filter(r => r.status === 'absent').length, late: records.filter(r => r.status === 'late').length, total, pct: total ? Math.round(present / total * 100) : 100 };
  }

  return {
    getClasses, getCoachClasses, getStudentClasses,
    renderCoachClasses, createClass, editClass, deleteClass,
    markCoachAttendance, renderAttendanceMarker, markStudentAttn,
    openAssignStudentsModal, openClassModal,
    renderAdminClasses, renderCoachAttendanceReport,
    getStudentAttendanceSummary, getStudentAttn
  };
})();
