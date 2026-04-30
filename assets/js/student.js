/* assets/js/student.js -------------------------------------------------------
   Student Dashboard logic for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.loadStudentDashboard = async () => {
    const user = CK.currentUser;
    const container = document.getElementById('student-dashboard-content');
    container.innerHTML = '<div class="loading-wrap">♛ Loading Student Portal...</div>';

    try {
      // 1. Fetch Stats
      const { count: presentCount } = await window.supabaseClient
        .from('attendance')
        .select('*', { count: 'exact' })
        .eq('userid', user.userid)
        .eq('status', 'present');

      // 2. Fetch Ratings for Chart
      const { data: ratings } = await window.supabaseClient
        .from('ratings')
        .select('*')
        .eq('user_id', user.userid)
        .order('date', { ascending: true });

      // 3. Fetch Resources
      const { data: files } = await window.supabaseClient
        .from('document')
        .select('*')
        .or(`level.eq.${user.level},coach.eq.${user.full_name}`)
        .order('created_at', { ascending: false });

      container.innerHTML = `
        <div class="stats-grid">
          <!-- Profile Sidebar -->
          <div class="feat-card" style="padding:2rem;">
            <div style="display:flex; align-items:center; gap:20px; margin-bottom:24px;">
              <div class="logo-icon" style="width:60px; height:60px; font-size:24px;">${user.full_name[0]}</div>
              <div>
                <h3 style="margin:0;">${user.full_name}</h3>
                <span class="hero-badge" style="font-size:0.7rem; margin:5px 0 0;">${user.level}</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:0.9rem; opacity:0.8;">
              <div>📧 ${user.email}</div>
              <div>📍 ${user.city || 'Not set'}</div>
              <div>🎂 Age: ${user.age || '-'}</div>
              <div>🎓 Grade: ${user.grade || '-'}</div>
            </div>
          </div>

          <!-- Progress Overview -->
          <div class="feat-card" style="padding:2rem;">
            <h4 style="margin-bottom:20px;">Learning Journey</h4>
            <div class="level-indicator" style="display:flex; justify-content:space-between; margin-bottom:20px; position:relative;">
              <div style="text-align:center; opacity:${user.level === 'Beginner' ? '1' : '0.4'}">
                <div style="font-size:2rem;">♟</div>
                <div style="font-size:0.7rem; font-weight:700;">Beginner</div>
              </div>
              <div style="text-align:center; opacity:${user.level === 'Intermediate' ? '1' : '0.4'}">
                <div style="font-size:2rem;">♗</div>
                <div style="font-size:0.7rem; font-weight:700;">Intermediate</div>
              </div>
              <div style="text-align:center; opacity:${user.level === 'Advanced' ? '1' : '0.4'}">
                <div style="font-size:2rem;">♛</div>
                <div style="font-size:0.7rem; font-weight:700;">Advanced</div>
              </div>
              <div style="position:absolute; top:20px; left:10%; right:10%; height:2px; background:var(--border-light); z-index:-1;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding-top:15px; border-top:1px solid var(--border-light);">
              <span>Attendance</span>
              <strong>${presentCount || 0} Sessions</strong>
            </div>
          </div>

          <!-- Rating Chart -->
          <div class="feat-card" style="padding:2rem;">
            <h4 style="margin-bottom:20px;">Rating Progress</h4>
            <div style="height: 200px;">
              <canvas id="studentRatingChart"></canvas>
            </div>
          </div>
        </div>

        <div style="margin-top:40px;">
          <h3>My Learning Resources</h3>
          <div class="table-wrapper" style="margin-top:20px;">
            <table class="table">
              <thead>
                <tr><th>Date</th><th>Document</th><th>Notes</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${files.map(f => `
                  <tr>
                    <td>${new Date(f.created_at).toLocaleDateString()}</td>
                    <td style="font-weight:600;">${f.name || f.file_name.split('/').pop()}</td>
                    <td style="opacity:0.6;">${f.link ? 'Recording Available' : '-'}</td>
                    <td>
                      <button class="btn btn-primary btn-sm" onclick="CK.downloadFile('${f.file_name}')">Download</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Grandmaster Slider -->
        <div style="margin-top:60px; text-align:center;">
          <h5 style="text-transform:uppercase; letter-spacing:2px; opacity:0.5; margin-bottom:30px;">Inspiration from Masters</h5>
          <div class="gm-slider" style="display:flex; gap:30px; overflow-x:auto; padding-bottom:20px; justify-content:center;">
            <div class="gm-card">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Viswanathan_Anand_%282016%29_%28cropped%29.jpeg" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--amber);">
              <p style="font-size:0.8rem; font-weight:700; margin-top:10px;">V. Anand</p>
            </div>
            <div class="gm-card">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/85/Praggnanandhaa_in_2025.jpg" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--amber);">
              <p style="font-size:0.8rem; font-weight:700; margin-top:10px;">Pragg</p>
            </div>
            <div class="gm-card">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Magnus_Carlsen_in_2023_%2852638329349%29.jpg" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--amber);">
              <p style="font-size:0.8rem; font-weight:700; margin-top:10px;">Magnus</p>
            </div>
            <div class="gm-card">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/54/Gukesh_in_2025.jpg" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--amber);">
              <p style="font-size:0.8rem; font-weight:700; margin-top:10px;">Gukesh</p>
            </div>
          </div>
        </div>
      `;

      // 4. Render Chart
      if (ratings.length > 0) {
        const ctx = document.getElementById('studentRatingChart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ratings.map(r => new Date(r.date).toLocaleDateString()),
            datasets: [{
              label: 'Rating',
              data: ratings.map(r => r.online),
              borderColor: '#D97706',
              tension: 0.4,
              fill: true,
              backgroundColor: 'rgba(217,119,6,0.1)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
          }
        });
      }

    } catch (err) {
      console.error("Student Dashboard Error:", err);
      container.innerHTML = `<div class="error-wrap">❌ Error loading dashboard: ${err.message}</div>`;
    }
  };

})();