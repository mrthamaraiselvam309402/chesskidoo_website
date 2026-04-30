/* assets/js/coach.js ---------------------------------------------------
   Loads the coach's profile, chart, schedule, etc.
   --------------------------------------------------------------- */
(() => {
  const token = `Bearer ${localStorage.getItem('ck_token')}`;
  const headers = { Authorization: token, 'Content-Type': 'application/json' };

  const _fetch = (url, opts = {}) => fetch(url, { headers, ...opts })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).catch(err => {
      console.log('API not available, using mock data');
      // Return mock data for demo
      if (url.includes('/classes')) {
        return Promise.resolve([
          { id: 1, title: "Beginner Basics", level: "Beginner", day: "Mon", time: "17:00", coach_id: 3 },
          { id: 2, title: "Intermediate Strategies", level: "Intermediate", day: "Tue", time: "16:00", coach_id: 3 }
        ]);
      }
      return Promise.resolve([]);
    });

  /* -----------------------------------------------------------------
     1️⃣ PROFILE & basic info
     ----------------------------------------------------------------- */
  async function loadProfile() {
    const user = Auth.currentUser();
    document.getElementById('coachName').textContent = user.name;
    document.getElementById('currSpecialty').textContent = 'Tactics & Strategy';
    document.getElementById('currRating').textContent = '2200+';
    document.getElementById('studentCount').textContent = '10';
    document.getElementById('nextClass').textContent = 'Tue 16:00 – Intermediate';
  }

  /* -----------------------------------------------------------------
     2️⃣ COACH CHART (Chart.js)
     ----------------------------------------------------------------- */
  async function renderChart() {
    // Dummy data for coaching impact
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Student Ratings',
        data: [850, 900, 950, 1000, 1050, 1100],
        borderColor: 'var(--gold)',
        backgroundColor: 'rgba(200,134,10,.15)',
        tension: .3,
        fill: true,
        pointRadius: 4
      }]
    };

    const ctx = document.getElementById('coachChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        scales: {
          y: { beginAtZero: false, suggestedMin: 800, suggestedMax: 1200 }
        },
        plugins: { legend: { display:false } }
      }
    });
  }

  /* -----------------------------------------------------------------
     3️⃣ CLASS SCHEDULE (coach-only classes)
     ----------------------------------------------------------------- */
  async function renderSchedule() {
    const allClasses = await _fetch('/api/classes');
    const user = Auth.currentUser();
    const filtered = allClasses.filter(c => c.coach_id == user.sub);
    const tbody = document.querySelector('#coachScheduleTable tbody');
    tbody.innerHTML = '';
    filtered.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.id}</td><td>${c.title}</td><td>${c.day} ${c.time}</td><td>${c.level}</td>`;
      tbody.appendChild(tr);
    });
  }

  /* -----------------------------------------------------------------
     4️⃣ GAME REVIEW LIST (static demo data)
     ----------------------------------------------------------------- */
  function renderGames() {
    const list = document.getElementById('coachGameList');
    const videos = [
      { title: 'Advanced Tactics Review', url: 'https://www.youtube.com/watch?v=_demo4' },
      { title: 'Student Game Analysis', url: 'https://www.youtube.com/watch?v=_demo5' }
    ];
    videos.forEach(v => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${v.url}" target="_blank" rel="noopener">▶️ ${v.title}</a>`;
      list.appendChild(li);
    });
  }

  /* -----------------------------------------------------------------
     5️⃣ Load Data Function (called by router)
     ----------------------------------------------------------------- */
  window.loadCoachData = () => {
    const user = Auth.currentUser();
    if (user && user.role === 'coach') {
      loadProfile();
      renderChart();
      renderSchedule();
      renderGames();
    }
  };

  /* -----------------------------------------------------------------
     6️⃣ Init (only load if on coach page)
     ----------------------------------------------------------------- */
  window.addEventListener('DOMContentLoaded', () => {
    // Router will call loadCoachData when needed
  });
})();