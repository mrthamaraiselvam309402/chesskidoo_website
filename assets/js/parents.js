/* assets/js/parents.js
   ChessKidoo — Parents Portal
   Parents log in with their own email/password, see their child's progress,
   attendance, upcoming schedule, reports, and submit feedback. */

window.CK = window.CK || {};

CK.parents = (() => {
  const FEEDBACK_KEY = 'ck_feedback';
  const getFeedback  = () => JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
  const saveFeedback = d  => localStorage.setItem(FEEDBACK_KEY, JSON.stringify(d));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const today = () => new Date().toISOString().split('T')[0];

  let _parentProfile = null;
  let _childProfile  = null;

  /* ─── Resolve child from parent profile ─── */
  async function _resolveChild(parentProfile) {
    if (!parentProfile) return null;
    // Method 1: childEmail stored on parent
    if (parentProfile.childEmail || parentProfile.child_email) {
      const users = JSON.parse(localStorage.getItem('ck_db_users') || '[]');
      return users.find(u => u.email === (parentProfile.childEmail || parentProfile.child_email)) || null;
    }
    // Method 2: parentEmail stored on student
    if (parentProfile.email) {
      const users = JSON.parse(localStorage.getItem('ck_db_users') || '[]');
      return users.find(u => u.parentEmail === parentProfile.email || u.parent_email === parentProfile.email) || null;
    }
    // Method 3: childId stored on parent
    if (parentProfile.childId || parentProfile.child_id) {
      const users = JSON.parse(localStorage.getItem('ck_db_users') || '[]');
      return users.find(u => u.id === (parentProfile.childId || parentProfile.child_id)) || null;
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════
     INIT
  ═════════════════════════════════════════════════════════ */

  async function init() {
    const currentUser = CK.currentUser || JSON.parse(localStorage.getItem('ck_user') || 'null');
    if (!currentUser || currentUser.role !== 'parent') {
      CK.showPage('login-page');
      return;
    }
    _parentProfile = currentUser;
    _childProfile  = await _resolveChild(currentUser);

    updateParentHeader();
    if (_childProfile) {
      renderChildProfile();
      renderAttendance();
      renderProgress();
      renderSchedule();
      renderReports();
      renderFeedbackForm();
    } else {
      const content = document.getElementById('parentMainContent');
      if (content) content.innerHTML = `
        <div class="par-no-child">
          <div style="font-size:3rem">👶</div>
          <h3>Child Account Not Linked</h3>
          <p>Please contact the academy to link your child's account to this parent profile.</p>
          <p style="color:var(--p-text-muted)">Academy: <a href="mailto:chesskidoo37@gmail.com">chesskidoo37@gmail.com</a></p>
        </div>`;
    }
  }

  function updateParentHeader() {
    const el = document.getElementById('parentWelcomeName');
    if (el) el.textContent = _parentProfile?.full_name?.split(' ')[0] || 'Parent';
    const sub = document.getElementById('parentWelcomeSub');
    if (sub && _childProfile) sub.textContent = `Tracking progress for ${_childProfile.full_name}`;
  }

  function nav(panelId) {
    document.querySelectorAll('#parent-page .par-panel').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`par-panel-${panelId}`);
    if (target) target.classList.add('active');
    document.querySelectorAll('#parent-page .par-nav-btn').forEach(b => {
      b.classList.remove('active');
      if (b.dataset.panel === panelId) b.classList.add('active');
    });
    if (panelId === 'attendance') renderAttendance();
    if (panelId === 'progress')   renderProgress();
    if (panelId === 'schedule')   renderSchedule();
    if (panelId === 'reports')    renderReports();
    if (panelId === 'feedback')   renderFeedbackForm();
  }

  /* ═══════════════════════════════════════════════════════
     CHILD PROFILE CARD
  ═════════════════════════════════════════════════════════ */

  function renderChildProfile() {
    const el = document.getElementById('parChildCard');
    if (!el || !_childProfile) return;
    const c = _childProfile;
    const initial = c.full_name?.[0]?.toUpperCase() || '♟';
    const puzzlesSolved = (CK.puzzlesPro?.getLeaderboard() || []).find(u => u.userId === c.id)?.solved || 0;
    const attnSummary = CK.classSystem?.getStudentAttendanceSummary(c.id) || { pct: 100, present: 0, total: 0 };
    el.innerHTML = `
      <div class="par-child-avatar">${initial}</div>
      <div class="par-child-info">
        <div class="par-child-name">${c.full_name}</div>
        <div class="par-child-meta">${c.level || 'Beginner'} · Coach: ${c.coach || '—'} · ${c.batch || 'Group'}</div>
        <div class="par-child-stats">
          <div class="par-stat"><span class="par-stat-val">${c.rating || 800}</span><span class="par-stat-lbl">ELO Rating</span></div>
          <div class="par-stat"><span class="par-stat-val">${attnSummary.pct}%</span><span class="par-stat-lbl">Attendance</span></div>
          <div class="par-stat"><span class="par-stat-val">${puzzlesSolved}</span><span class="par-stat-lbl">Puzzles Solved</span></div>
          <div class="par-stat"><span class="par-stat-val">${c.game || 0}</span><span class="par-stat-lbl">Games Played</span></div>
        </div>
      </div>`;
  }

  /* ═══════════════════════════════════════════════════════
     ATTENDANCE VIEW
  ═════════════════════════════════════════════════════════ */

  function renderAttendance() {
    const el = document.getElementById('parAttendanceContent');
    if (!el || !_childProfile) return;
    const records = JSON.parse(localStorage.getItem('ck_db_attendance') || '[]')
      .filter(r => r.userid === _childProfile.id);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const map = {};
    records.forEach(r => {
      const d = new Date(r.date);
      if (d.getFullYear() === year && d.getMonth() === month) map[d.getDate()] = r.status;
    });
    const presentCount = Object.values(map).filter(s => s === 'present').length;
    const absentCount  = Object.values(map).filter(s => s === 'absent').length;
    const pct = records.length ? Math.round(records.filter(r=>r.status==='present').length / records.length * 100) : 100;
    const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    let cal = `<div class="par-cal-month">${monthName}</div><div class="par-cal-grid">`;
    cal += days.map(d => `<div class="par-cal-head">${d}</div>`).join('');
    for (let i=0; i<firstDay; i++) cal += '<div></div>';
    for (let d=1; d<=totalDays; d++) {
      const s = map[d];
      cal += `<div class="par-cal-cell ${s==='present'?'par-cal-present':s==='absent'?'par-cal-absent':''}">${d}${s==='present'?'<div class="par-cal-dot par-dot-green"></div>':s==='absent'?'<div class="par-cal-dot par-dot-red"></div>':''}</div>`;
    }
    cal += '</div>';
    el.innerHTML = `
      <div class="par-attn-summary">
        <div class="par-attn-stat par-attn-ok"><div class="par-attn-num">${pct}%</div><div>Attendance Rate</div></div>
        <div class="par-attn-stat par-attn-ok"><div class="par-attn-num">${presentCount}</div><div>Days Present</div></div>
        <div class="par-attn-stat par-attn-warn"><div class="par-attn-num">${absentCount}</div><div>Days Absent</div></div>
        <div class="par-attn-stat"><div class="par-attn-num">${records.length}</div><div>Total Recorded</div></div>
      </div>
      ${cal}
      ${pct < 75 ? `<div class="par-attn-alert">⚠️ Attendance is below 75%. Please ensure regular attendance for optimal progress.</div>` : ''}`;
  }

  /* ═══════════════════════════════════════════════════════
     PROGRESS VIEW
  ═════════════════════════════════════════════════════════ */

  function renderProgress() {
    const el = document.getElementById('parProgressContent');
    if (!el || !_childProfile) return;
    const c = _childProfile;
    const ratings = JSON.parse(localStorage.getItem('ck_db_ratings') || '[]').filter(r => r.user_id === c.userid);
    const puzzlesSolved = (CK.puzzlesPro?.getLeaderboard() || []).find(u => u.userId === c.id)?.solved || 0;
    const attnSummary = CK.classSystem?.getStudentAttendanceSummary(c.id) || { pct: 100 };
    const hw = JSON.parse(localStorage.getItem('ck_hw_submissions') || '[]').filter(s => s.studentId === c.id);
    const hwDone = hw.filter(s => s.completed).length;
    const hwTotal = (JSON.parse(localStorage.getItem('ck_assignments') || '[]')).length;
    const progress = Math.round(
      attnSummary.pct * 0.30 +
      Math.min(100, puzzlesSolved * 2.5) * 0.25 +
      Math.min(100, (c.rating - 800) / 4) * 0.25 +
      Math.min(100, (c.game || 0) * 5) * 0.10 +
      (hwTotal > 0 ? (hwDone / hwTotal * 100) : 100) * 0.10
    );
    const ratingHistory = ratings.map(r => ({ date: r.date?.slice(0,7), rating: r.online }));
    el.innerHTML = `
      <div class="par-progress-header">
        <div class="par-progress-score">
          <div class="par-score-ring" style="--score: ${progress}">
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10"/><circle cx="50" cy="50" r="42" fill="none" stroke="var(--p-gold)" stroke-width="10" stroke-dasharray="${progress * 2.639} 263.9" stroke-dashoffset="0" transform="rotate(-90 50 50)"/></svg>
            <div class="par-score-val">${progress}%</div>
          </div>
          <div class="par-score-label">Overall Progress</div>
        </div>
        <div class="par-progress-breakdown">
          ${[
            { label: 'Attendance', val: Math.round(attnSummary.pct), color: 'var(--p-teal)' },
            { label: 'Puzzles', val: Math.min(100, puzzlesSolved * 2.5), color: 'var(--p-blue)' },
            { label: 'Rating Gain', val: Math.min(100, (c.rating - 800) / 4), color: 'var(--p-gold)' },
            { label: 'Games Played', val: Math.min(100, (c.game||0)*5), color: 'var(--p-green)' },
            { label: 'Homework', val: hwTotal > 0 ? Math.round(hwDone/hwTotal*100) : 100, color: '#a78bfa' }
          ].map(item => `
            <div class="par-breakdown-row">
              <span class="par-breakdown-label">${item.label}</span>
              <div class="par-breakdown-bar"><div style="width:${Math.round(item.val)}%;background:${item.color}"></div></div>
              <span class="par-breakdown-pct">${Math.round(item.val)}%</span>
            </div>`).join('')}
        </div>
      </div>
      ${ratingHistory.length ? `
        <div class="par-rating-history">
          <div class="par-section-title">📈 Rating History</div>
          <div class="par-rating-table">
            ${ratingHistory.map(r => `<div class="par-rating-row"><span>${r.date}</span><span style="color:var(--p-gold);font-weight:700">${r.rating} ELO</span></div>`).join('')}
          </div>
        </div>` : ''}`;
  }

  /* ═══════════════════════════════════════════════════════
     SCHEDULE VIEW
  ═════════════════════════════════════════════════════════ */

  function renderSchedule() {
    const el = document.getElementById('parScheduleContent');
    if (!el) return;
    if (CK.schedulePro && _childProfile) {
      CK.schedulePro.renderStudentSchedule('parScheduleContent', _childProfile);
    } else {
      el.innerHTML = '<div class="cls-empty">📅 No upcoming sessions found.</div>';
    }
  }

  /* ═══════════════════════════════════════════════════════
     MONTHLY REPORTS VIEW
  ═════════════════════════════════════════════════════════ */

  function renderReports() {
    const el = document.getElementById('parReportsContent');
    if (!el || !_childProfile) return;
    const reports = JSON.parse(localStorage.getItem('ck_monthly_reports') || '[]')
      .filter(r => r.studentId === _childProfile.id)
      .sort((a,b) => b.year - a.year || b.month - a.month);
    if (!reports.length) {
      el.innerHTML = '<div class="cls-empty">📋 No reports available yet. Reports will appear here when your coach submits them.</div>'; return;
    }
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    el.innerHTML = reports.map(r => `
      <div class="par-report-card">
        <div class="par-report-header">
          <span class="par-report-month">${monthNames[r.month - 1]} ${r.year}</span>
          <span class="p-badge p-badge-${r.rating >= 4 ? 'green' : r.rating >= 3 ? 'yellow' : 'red'}">
            ${'⭐'.repeat(r.rating || 3)} (${r.rating || 3}/5)
          </span>
        </div>
        <div class="par-report-body">
          <div class="par-report-stats">
            <span>📅 Attendance: <b>${r.attendance}%</b></span>
            <span>🧩 Puzzles: <b>${r.puzzles}</b></span>
          </div>
          ${r.notes ? `<div class="par-report-notes"><strong>Coach Notes:</strong> ${r.notes}</div>` : ''}
          ${r.recommendation ? `<div class="par-report-rec">💡 <strong>Recommendation:</strong> ${r.recommendation}</div>` : ''}
        </div>
      </div>`).join('');
  }

  /* ═══════════════════════════════════════════════════════
     FEEDBACK FORM
  ═════════════════════════════════════════════════════════ */

  function renderFeedbackForm() {
    const el = document.getElementById('parFeedbackContent');
    if (!el) return;
    const existing = getFeedback().filter(f => f.fromId === _parentProfile?.id)
      .sort((a,b) => b.date.localeCompare(a.date));
    el.innerHTML = `
      <div class="par-feedback-form">
        <div class="par-section-title">✍️ Submit Feedback</div>
        <div class="cls-form-row">
          <label>Category</label>
          <select class="p-input" id="fbCategory">
            <option value="coach">Coach Performance</option>
            <option value="curriculum">Curriculum & Content</option>
            <option value="platform">Platform & App</option>
            <option value="progress">Child's Progress</option>
            <option value="general">General Feedback</option>
          </select>
        </div>
        <div class="cls-form-row">
          <label>Rating</label>
          <div class="fb-star-row" id="fbStarRow">
            ${[1,2,3,4,5].map(n => `<span class="fb-star" data-val="${n}" onclick="CK.parents._setRating(${n})">☆</span>`).join('')}
          </div>
        </div>
        <div class="cls-form-row">
          <label>Your Message</label>
          <textarea class="p-input" id="fbMessage" rows="4" placeholder="Share your thoughts about the academy, coach, or your child's progress..."></textarea>
        </div>
        <button class="p-btn p-btn-blue" onclick="CK.parents.submitFeedback()">📤 Submit Feedback</button>
      </div>
      ${existing.length ? `
        <div style="margin-top:24px;">
          <div class="par-section-title">📬 My Previous Feedback</div>
          ${existing.slice(0,5).map(f => `
            <div class="par-fb-card">
              <div class="par-fb-header">
                <span class="par-fb-cat">${f.category}</span>
                <span class="par-fb-date">${new Date(f.date).toLocaleDateString('en-IN')}</span>
                <span>${'⭐'.repeat(f.rating)}</span>
              </div>
              <div class="par-fb-msg">${f.message}</div>
              ${f.reply ? `<div class="par-fb-reply">💬 Academy reply: ${f.reply}</div>` : ''}
            </div>`).join('')}
        </div>` : ''}`;
    _feedbackRating = 0;
  }

  let _feedbackRating = 0;
  function _setRating(val) {
    _feedbackRating = val;
    document.querySelectorAll('#fbStarRow .fb-star').forEach((s, i) => {
      s.textContent = i < val ? '⭐' : '☆';
    });
  }

  function submitFeedback() {
    const msg = document.getElementById('fbMessage')?.value.trim();
    const cat = document.getElementById('fbCategory')?.value || 'general';
    if (!msg) { CK.showToast('Please write a message', 'warning'); return; }
    if (!_feedbackRating) { CK.showToast('Please select a star rating', 'warning'); return; }
    const feedback = {
      id: uid(),
      fromId: _parentProfile?.id,
      fromName: _parentProfile?.full_name || 'Parent',
      fromRole: 'parent',
      childId: _childProfile?.id,
      childName: _childProfile?.full_name || '',
      toId: 'academy',
      toName: 'ChessKidoo Academy',
      message: msg,
      rating: _feedbackRating,
      category: cat,
      date: new Date().toISOString(),
      replied: false,
      reply: ''
    };
    const all = getFeedback();
    all.push(feedback);
    saveFeedback(all);
    CK.showToast('Thank you for your feedback! 🙏', 'success');
    renderFeedbackForm();
  }

  /* ─── Admin/Coach: view all feedback ─── */
  function renderAllFeedback(containerId, filterRole = null) {
    const el = document.getElementById(containerId);
    if (!el) return;
    let all = getFeedback().sort((a,b) => b.date.localeCompare(a.date));
    if (filterRole) all = all.filter(f => f.fromRole === filterRole);
    if (!all.length) {
      el.innerHTML = '<div class="cls-empty">No feedback received yet.</div>'; return;
    }
    el.innerHTML = all.map(f => `
      <div class="par-fb-card" style="margin-bottom:12px;">
        <div class="par-fb-header">
          <span style="font-weight:700">${f.fromName}</span>
          <span class="p-badge p-badge-blue">${f.fromRole}</span>
          <span class="par-fb-cat">${f.category}</span>
          <span>${'⭐'.repeat(f.rating)}</span>
          <span class="par-fb-date">${new Date(f.date).toLocaleDateString('en-IN')}</span>
        </div>
        ${f.childName ? `<div style="font-size:0.8rem;color:var(--p-text-muted)">About: ${f.childName}</div>` : ''}
        <div class="par-fb-msg">${f.message}</div>
        ${f.reply
          ? `<div class="par-fb-reply">💬 Replied: ${f.reply}</div>`
          : `<div style="display:flex;gap:8px;margin-top:8px;">
               <input class="p-input" id="reply_${f.id}" placeholder="Type a reply..." style="flex:1;font-size:0.85rem;">
               <button class="p-btn p-btn-blue p-btn-sm" onclick="CK.parents.replyFeedback('${f.id}')">Reply</button>
             </div>`}
      </div>`).join('');
  }

  function replyFeedback(id) {
    const replyEl = document.getElementById(`reply_${id}`);
    const reply = replyEl?.value.trim();
    if (!reply) return;
    const all = getFeedback();
    const f = all.find(x => x.id === id);
    if (f) { f.reply = reply; f.replied = true; saveFeedback(all); }
    CK.showToast('Reply sent!', 'success');
    renderAllFeedback('adminFeedbackList');
  }

  return {
    init, nav, renderChildProfile, renderAttendance, renderProgress,
    renderSchedule, renderReports, renderFeedbackForm, submitFeedback,
    renderAllFeedback, replyFeedback, _setRating,
    getFeedback
  };
})();
