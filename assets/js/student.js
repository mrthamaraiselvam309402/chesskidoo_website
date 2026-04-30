/* assets/js/student.js -------------------------------------------------------
   Student Dashboard logic for ChessKidoo - Resilient Version
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.loadStudentDashboard = async () => {
    const user = CK.currentUser || {};
    const container = document.getElementById('student-dashboard-content');
    if (!container) return;

    container.innerHTML = '<div class="loading-wrap">♛ Loading Student Portal...</div>';

    try {
      // 1. Fetch Stats with safe defaults
      let presentCount = 0;
      try {
        const { count } = await window.supabaseClient
          .from('attendance')
          .select('*', { count: 'exact' })
          .eq('userid', user.userid)
          .eq('status', 'present');
        presentCount = count || 0;
      } catch (e) { console.warn("Attendance table not found or empty."); }

      // 2. Fetch Ratings
      let ratings = [];
      try {
        const { data } = await window.supabaseClient
          .from('ratings')
          .select('*')
          .eq('user_id', user.userid)
          .order('date', { ascending: true });
        ratings = data || [];
      } catch (e) { console.warn("Ratings table not found or empty."); }

      // 3. Fetch Resources (Refactored to be more resilient)
      let files = [];
      try {
        const userLevel = user.level || 'Beginner';
        const { data } = await window.supabaseClient
          .from('document')
          .select('*')
          .or(`level.eq.${userLevel}`)
          .order('created_at', { ascending: false });
        files = data || [];
      } catch (e) { console.warn("Document table error, checking structure."); }

      const fullName = user.full_name || 'Chess Student';
      const initial = fullName.charAt(0).toUpperCase();
      const level = user.level || 'Beginner';
      const isBeginner = level === 'Beginner';
      const isIntermediate = level === 'Intermediate';
      const isAdvanced = level === 'Advanced';

      container.innerHTML = `
        <div class="stats-grid" style="display:grid; grid-template-columns: 1fr 1.5fr 1fr; gap:25px;">
          <!-- Profile -->
          <div class="feat-card" style="padding:2rem; border-left: 4px solid var(--amber);">
            <div style="display:flex; align-items:center; gap:20px; margin-bottom:24px;">
              <div class="logo-icon" style="width:60px; height:60px; font-size:24px;">${initial}</div>
              <div>
                <h3 style="margin:0;">${fullName}</h3>
                <span class="hero-badge" style="font-size:0.7rem; margin:5px 0 0;">${level}</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:0.85rem; opacity:0.8;">
              <div>📧 ${user.email || '-'}</div>
              <div>📍 ${user.city || 'India'}</div>
              <div>👨🏫 Coach: ${user.coach || 'Assigning...'}</div>
              <div>📊 Games: <strong>${user.game || 0}</strong> | Puzzles: <strong>${user.puzzle || '0%'}</strong></div>
            </div>
          </div>

          <!-- Progress Journey -->
          <div class="feat-card" style="padding:2rem;">
            <h4 style="margin-bottom:25px;">Level Progress Roadmap</h4>
            <div class="level-steps" style="display:flex; justify-content:space-between; align-items:center; position:relative; padding:0 10px;">
              <div class="step-item active" style="text-align:center;">
                <div class="step-icon">♟</div><div class="step-label">Beginner</div>
              </div>
              <div class="step-line ${isIntermediate||isAdvanced ? 'active':''}"></div>
              <div class="step-item ${isIntermediate||isAdvanced ? 'active':''}" style="text-align:center;">
                <div class="step-icon">♗</div><div class="step-label">Intermediate</div>
              </div>
              <div class="step-line ${isAdvanced ? 'active':''}"></div>
              <div class="step-item ${isAdvanced ? 'active':''}" style="text-align:center;">
                <div class="step-icon">♛</div><div class="step-label">Advanced</div>
              </div>
            </div>
            <div style="margin-top:30px; background:var(--cream); padding:15px; border-radius:12px; font-size:0.85rem;">
              <p>Current Standing: <strong>${level}</strong></p>
              <div style="background:var(--border-light); height:6px; border-radius:3px; margin-top:8px;">
                <div style="background:var(--amber); width:${isBeginner?'33%':isIntermediate?'66%':'100%'}; height:100%; border-radius:3px;"></div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%; margin-top:20px;" onclick="CK.startGMGame()">🎮 Play 'Guess GM' Game</button>
          </div>

          <!-- Performance -->
          <div class="feat-card" style="padding:2rem;">
            <h4 style="margin-bottom:20px;">Performance</h4>
            <div style="height:150px;"><canvas id="studentRatingChart"></canvas></div>
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px; font-size:0.85rem;">
              <div style="display:flex; justify-content:space-between;"><span>Attendance</span><strong>${presentCount}</strong></div>
              <div style="display:flex; justify-content:space-between;"><span>Stars</span><strong style="color:var(--amber);">${user.star || 0} ★</strong></div>
            </div>
          </div>
        </div>

        <div style="margin-top:40px;">
          <h3 style="font-family:var(--font-display); margin-bottom:20px;">Study Materials</h3>
          <div class="ck-table-wrap">
            <table class="ck-table">
              <thead><tr><th>Date</th><th>Material</th><th>Level</th><th>Action</th></tr></thead>
              <tbody>
                ${files.length ? files.map(f => `
                  <tr>
                    <td>${new Date(f.created_at).toLocaleDateString()}</td>
                    <td style="font-weight:600;">${f.name || 'Resource'}</td>
                    <td><span class="hero-badge" style="font-size:0.6rem;">${f.level}</span></td>
                    <td><button class="ck-btn ck-btn-sm ck-btn-outline" onclick="CK.downloadFile('${f.file_name}')">📥 Get File</button></td>
                  </tr>
                `).join('') : '<tr><td colspan="4" class="ck-empty">No materials assigned to your level yet. Check back soon!</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;

      if (ratings.length > 0) {
        const ctx = document.getElementById('studentRatingChart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ratings.map(r => new Date(r.date).toLocaleDateString()),
            datasets: [{ label: 'Rating', data: ratings.map(r => r.online), borderColor: '#D97706', tension: 0.4, fill: true, backgroundColor: 'rgba(217,119,6,0.1)' }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { beginAtZero: false } } }
        });
      }

    } catch (err) {
      console.error("Dashboard Error:", err);
      container.innerHTML = `<div class="error-wrap" style="padding:60px; text-align:center;">
        <h2 style="font-family:var(--font-display); margin-bottom:15px;">Welcome to your Portal</h2>
        <p style="opacity:0.6; margin-bottom:25px;">Your dashboard is being initialized. Check back in a few moments!</p>
        <button class="btn btn-primary" onclick="CK.loadStudentDashboard()">🔄 Retry Loading</button>
      </div>`;
    }
  };

})();