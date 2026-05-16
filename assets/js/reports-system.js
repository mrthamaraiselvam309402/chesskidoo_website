/* assets/js/reports-system.js
   ChessKidoo — Monthly Reports System
   Coaches write monthly reports per student, admin sees all,
   students/parents can view their own reports. */

window.CK = window.CK || {};

CK.reportSystem = (() => {
  const KEY = 'ck_monthly_reports';
  const get  = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const save = d  => localStorage.setItem(KEY, JSON.stringify(d));
  const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  /* ═══════════════════════════════════════════════════════
     COACH — WRITE / EDIT MONTHLY REPORTS
  ═════════════════════════════════════════════════════════ */

  function renderCoachReports(containerId, coachId, coachName) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const allStudents = JSON.parse(localStorage.getItem('ck_db_users') || '[]')
      .filter(u => u.role === 'student' && u.coach === coachName);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear  = now.getFullYear();
    const reports = get();

    el.innerHTML = `
      <div class="rpt-coach-header">
        <div class="rpt-coach-title">Monthly Reports — ${MONTH_NAMES[now.getMonth()]} ${currentYear}</div>
        <div class="rpt-coach-subtitle">Write individual performance reports for each of your ${allStudents.length} student${allStudents.length === 1 ? '' : 's'}.</div>
      </div>
      <div class="rpt-student-list">
        ${allStudents.map(s => {
          const existing = reports.find(r => r.studentId === s.id && r.month === currentMonth && r.year === currentYear);
          const attnSummary = CK.classSystem?.getStudentAttendanceSummary(s.id) || { pct: 0, present: 0, total: 0 };
          const puzzlesSolved = (CK.puzzlesPro?.getLeaderboard() || []).find(u => u.userId === s.id)?.solved || 0;
          return `
            <div class="rpt-student-card ${existing ? 'rpt-done' : ''}">
              <div class="rpt-student-info">
                <div class="rpt-student-name">${s.full_name}</div>
                <div class="rpt-student-meta">
                  <span class="p-badge p-badge-${s.level==='Beginner'?'green':s.level==='Intermediate'?'blue':'gold'}">${s.level||'Beginner'}</span>
                  <span>Attendance: ${attnSummary.pct}%</span>
                  <span>Puzzles: ${puzzlesSolved}</span>
                  <span>Rating: ${s.rating || 800}</span>
                </div>
              </div>
              <div class="rpt-student-actions">
                ${existing ? '<span class="p-badge p-badge-green">✓ Report Filed</span>' : ''}
                <button class="p-btn p-btn-${existing?'ghost':'blue'} p-btn-sm" onclick="CK.reportSystem.openReportEditor('${s.id}','${s.full_name}','${coachId}','${coachName}')">
                  ${existing ? '✏️ Edit Report' : '📝 Write Report'}
                </button>
              </div>
            </div>`;
        }).join('')}
        ${!allStudents.length ? '<div class="cls-empty">No students assigned to you yet.</div>' : ''}
      </div>`;
  }

  function openReportEditor(studentId, studentName, coachId, coachName) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const all = get();
    const existing = all.find(r => r.studentId === studentId && r.month === month && r.year === year);
    const attnSummary = CK.classSystem?.getStudentAttendanceSummary(studentId) || { pct: 0 };
    const puzzlesSolved = (CK.puzzlesPro?.getLeaderboard() || []).find(u => u.userId === studentId)?.solved || 0;

    const modal = document.createElement('div');
    modal.className = 'cls-modal-overlay';
    modal.innerHTML = `
      <div class="cls-modal rpt-modal">
        <div class="cls-modal-header">
          <div>
            <h3>📋 Monthly Report — ${studentName}</h3>
            <div style="font-size:0.8rem;color:var(--p-text-muted)">${MONTH_NAMES[month-1]} ${year}</div>
          </div>
          <button class="cls-modal-close" onclick="this.closest('.cls-modal-overlay').remove()">✕</button>
        </div>
        <div class="cls-modal-body">
          <div class="rpt-auto-stats">
            <div class="rpt-auto-stat"><span>Attendance</span><strong>${Math.round(attnSummary.pct)}%</strong></div>
            <div class="rpt-auto-stat"><span>Puzzles Solved</span><strong>${puzzlesSolved}</strong></div>
          </div>
          <div class="cls-form-row">
            <label>Performance Rating (1–5 stars)</label>
            <div class="fb-star-row" id="rptStarRow">
              ${[1,2,3,4,5].map(n => `<span class="fb-star${existing && existing.rating >= n ? '' : ''}" data-val="${n}" onclick="document.querySelectorAll('#rptStarRow .fb-star').forEach((s,i)=>s.textContent=i<${n}?'⭐':'☆'); document.getElementById('rptRatingVal').value=${n}">${existing && existing.rating >= n ? '⭐' : '☆'}</span>`).join('')}
            </div>
            <input type="hidden" id="rptRatingVal" value="${existing?.rating || 3}">
          </div>
          <div class="cls-form-row">
            <label>Coach Notes</label>
            <textarea class="p-input" id="rptNotes" rows="3" placeholder="Describe the student's strengths, areas of improvement, and key observations...">${existing?.notes || ''}</textarea>
          </div>
          <div class="cls-form-row">
            <label>Recommendation for Next Month</label>
            <textarea class="p-input" id="rptRec" rows="2" placeholder="What should the student focus on next month?">${existing?.recommendation || ''}</textarea>
          </div>
          <div class="cls-form-row">
            <label>Areas Covered This Month</label>
            <input class="p-input" id="rptTopics" value="${existing?.topics || ''}" placeholder="e.g. Openings, Tactical patterns, Endgames">
          </div>
        </div>
        <div class="cls-modal-footer">
          <button class="p-btn p-btn-ghost" onclick="this.closest('.cls-modal-overlay').remove()">Cancel</button>
          <button class="p-btn p-btn-blue" onclick="CK.reportSystem.saveReport('${studentId}','${studentName}','${coachId}','${coachName}',${month},${year})">💾 Save Report</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  function saveReport(studentId, studentName, coachId, coachName, month, year) {
    const notes   = document.getElementById('rptNotes')?.value.trim();
    const rec     = document.getElementById('rptRec')?.value.trim();
    const topics  = document.getElementById('rptTopics')?.value.trim();
    const rating  = parseInt(document.getElementById('rptRatingVal')?.value) || 3;
    const attnSummary = CK.classSystem?.getStudentAttendanceSummary(studentId) || { pct: 0 };
    const puzzlesSolved = (CK.puzzlesPro?.getLeaderboard() || []).find(u => u.userId === studentId)?.solved || 0;
    const all = get();
    const idx = all.findIndex(r => r.studentId === studentId && r.month === month && r.year === year);
    const report = {
      id: idx !== -1 ? all[idx].id : uid(),
      studentId, studentName, coachId, coachName, month, year,
      attendance: Math.round(attnSummary.pct), puzzles: puzzlesSolved,
      notes, recommendation: rec, topics, rating,
      createdAt: new Date().toISOString()
    };
    if (idx !== -1) all[idx] = report; else all.push(report);
    save(all);
    CK.showToast(`Report for ${studentName} saved!`, 'success');
    document.querySelector('.cls-modal-overlay')?.remove();
    if (CK.coach) CK.coach.renderReportsPanel();
  }

  /* ═══════════════════════════════════════════════════════
     STUDENT — VIEW OWN REPORTS
  ═════════════════════════════════════════════════════════ */

  function renderStudentReports(containerId, studentId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const reports = get().filter(r => r.studentId === studentId).sort((a,b) => b.year - a.year || b.month - a.month);
    if (!reports.length) {
      el.innerHTML = '<div class="cls-empty">📋 No monthly reports yet. Your coach will add them here.</div>'; return;
    }
    el.innerHTML = reports.map(r => `
      <div class="rpt-view-card">
        <div class="rpt-view-header">
          <span class="rpt-view-month">${MONTH_NAMES[r.month-1]} ${r.year}</span>
          <span class="rpt-view-coach">by ${r.coachName}</span>
          <span>${'⭐'.repeat(r.rating || 3)}</span>
        </div>
        <div class="rpt-view-stats">
          <span>📅 Attendance: <b>${r.attendance}%</b></span>
          <span>🧩 Puzzles: <b>${r.puzzles}</b></span>
        </div>
        ${r.topics ? `<div class="rpt-view-topics">📚 Topics: ${r.topics}</div>` : ''}
        ${r.notes ? `<div class="rpt-view-notes"><strong>Coach Notes:</strong> ${r.notes}</div>` : ''}
        ${r.recommendation ? `<div class="rpt-view-rec">💡 Next Month: ${r.recommendation}</div>` : ''}
      </div>`).join('');
  }

  /* ═══════════════════════════════════════════════════════
     ADMIN — ALL REPORTS
  ═════════════════════════════════════════════════════════ */

  function renderAdminReports(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const reports = get().sort((a,b) => b.year - a.year || b.month - a.month);
    if (!reports.length) {
      el.innerHTML = '<div class="cls-empty">No reports submitted yet.</div>'; return;
    }
    el.innerHTML = `
      <table class="p-table" style="width:100%">
        <thead><tr><th>Student</th><th>Coach</th><th>Month</th><th>Attendance</th><th>Puzzles</th><th>Rating</th></tr></thead>
        <tbody>
          ${reports.map(r => `<tr>
            <td style="font-weight:600">${r.studentName}</td>
            <td>${r.coachName}</td>
            <td>${MONTH_NAMES[r.month-1]} ${r.year}</td>
            <td>${r.attendance}%</td>
            <td>${r.puzzles}</td>
            <td>${'⭐'.repeat(r.rating || 3)}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  return {
    get, renderCoachReports, openReportEditor, saveReport,
    renderStudentReports, renderAdminReports
  };
})();
