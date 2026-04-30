/* assets/js/student.js -----------------------------------------------------
   Dynamic Student Dashboard using Supabase data
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.loadStudentDashboard = async () => {
    const container = document.getElementById('student-page');
    const user = CK.getCurrentUser();
    if (!user) return;

    // Show loading state
    container.innerHTML = '<div class="loading-wrap">♛ Loading your portal...</div>';

    try {
      // 1. Fetch Attendance (Current Month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);

      const { count: presentCount } = await window.supabaseClient
        .from('attendance')
        .select('*', { count: 'exact' })
        .eq('userid', user.id)
        .eq('status', 'present')
        .gte('date', startOfMonth.toISOString());

      // 2. Fetch Rating Chart Data
      const { data: ratings } = await window.supabaseClient
        .from('ratings')
        .select('*')
        .eq('user_id', user.userid)
        .order('date', { ascending: true });

      // 3. Render Dashboard HTML
      container.innerHTML = `
        <div class="student-portal-bg">
          <header class="dashboard-header" style="background: var(--bg-dark); padding: 80px 0 40px; color: #fff;">
            <div class="container">
              <span class="eyebrow" style="color: var(--amber-pale)">Student Portal</span>
              <h1 style="font-family: var(--font-display); font-size: 3rem; margin-top: 10px;">Welcome back, ${user.full_name.split(' ')[0]}</h1>
            </div>
          </header>

          <div class="container" style="margin-top: -40px;">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
              
              <!-- Profile Card -->
              <div class="feat-card reveal visible">
                <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px;">
                  <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--amber-pale); display: flex; align-items: center; justify-content: center; font-size: 2rem;">👤</div>
                  <div>
                    <h3 style="margin: 0;">${user.full_name}</h3>
                    <span class="hero-badge" style="margin: 5px 0 0;">${user.level}</span>
                  </div>
                </div>
                <div style="opacity: 0.7; font-size: 0.9rem; display: flex; flex-direction: column; gap: 10px;">
                  <div>📧 ${user.email}</div>
                  <div>📍 ${user.city || 'India'}</div>
                  <div>🎓 Grade ${user.grade || 'N/A'}</div>
                </div>
                <button class="btn btn-ghost" style="width: 100%; margin-top: 24px;" onclick="CK.logout()">Log Out</button>
              </div>

              <!-- Performance Card -->
              <div class="feat-card reveal visible">
                <h3>Learning Progress</h3>
                <div style="margin: 24px 0;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Attendance</span>
                    <span>${Math.round((presentCount || 0) / 8 * 100)}%</span>
                  </div>
                  <div style="height: 8px; background: var(--cream-dark); border-radius: 4px;">
                    <div style="height: 100%; width: ${Math.round((presentCount || 0) / 8 * 100)}%; background: var(--amber); border-radius: 4px;"></div>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.9rem;">
                  <div style="display: flex; justify-content: space-between;"><span>Puzzles Solved</span> <strong>${user.puzzle || 0}</strong></div>
                  <div style="display: flex; justify-content: space-between;"><span>Games Analyzed</span> <strong>${user.game || 0}</strong></div>
                </div>
              </div>

              <!-- Rating Chart Card -->
              <div class="feat-card reveal visible">
                <h3>Rating Evolution</h3>
                <canvas id="ratingChart" style="margin-top: 20px; max-height: 200px;"></canvas>
              </div>

            </div>
          </div>
        </div>
      `;

      // 4. Initialize Chart
      if (ratings && ratings.length > 0) {
        const ctx = document.getElementById('ratingChart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ratings.map(r => new Date(r.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })),
            datasets: [
              {
                label: 'Online',
                data: ratings.map(r => r.online),
                borderColor: '#D97706',
                tension: 0.4
              },
              {
                label: 'International',
                data: ratings.map(r => r.international),
                borderColor: '#1F2937',
                tension: 0.4
              }
            ]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false }, x: { grid: { display: false } } }
          }
        });
      }

    } catch (err) {
      console.error("Dashboard error:", err);
      container.innerHTML = `<div class="error-wrap">❌ Error loading dashboard: ${err.message}</div>`;
    }
  };

})();