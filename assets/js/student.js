/* assets/js/student.js ---------------------------------------------------
   Loads the student's profile, rating chart, schedule, and video list.
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
      const user = Auth.currentUser();
      if (url.includes('/students/') && url.includes('/ratings')) {
        return Promise.resolve([
          { date: 'Mon', rating: 800 },
          { date: 'Tue', rating: 850 },
          { date: 'Wed', rating: 900 },
          { date: 'Thu', rating: 950 },
          { date: 'Fri', rating: 1000 },
          { date: 'Sat', rating: 1050 },
          { date: 'Sun', rating: 1100 }
        ]);
      } else if (url.includes('/students/')) {
        return Promise.resolve({
          id: user.sub,
          name: user.name,
          age: 10,
          level: 'Beginner',
          coach: 'Vishnu',
          rating: 850,
          nextLesson: 'Mon 17:00 – Beginner Level'
        });
      } else if (url.includes('/classes')) {
        return Promise.resolve([
          { id: 1, title: "Beginner Basics", level: "Beginner", day: "Mon", time: "17:00", coach: "Vishnu" }
        ]);
      }
      return Promise.resolve([]);
    });

  /* -----------------------------------------------------------------
     1️⃣ PROFILE & basic info
     ----------------------------------------------------------------- */
  async function loadProfile() {
    const user = Auth.currentUser();
    const student = await _fetch(`/api/students/${user.sub}`);

    document.getElementById('studentName').textContent = student.name;
    document.getElementById('currLevel').textContent = student.level;
    document.getElementById('currRating').textContent = student.rating || '—';
    document.getElementById('coachName').textContent = student.coach;
    document.getElementById('nextLesson').textContent = student.nextLesson || 'No upcoming lesson';
  }

  /* -----------------------------------------------------------------
     2️⃣ RATING CHART (Chart.js)
     ----------------------------------------------------------------- */
  async function renderChart() {
    const user = Auth.currentUser();
    const history = await _fetch(`/api/students/${user.sub}/ratings`);

    const ctx = document.getElementById('studentRatingChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map(p => p.date),
        datasets: [{
          label: 'Rating',
          data: history.map(p => p.rating),
          borderColor: 'var(--gold)',
          backgroundColor: 'rgba(200,134,10,.15)',
          tension: .3,
          fill: true,
          pointRadius: 4
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: false, suggestedMin: 600, suggestedMax: 2000 }
        },
        plugins: { legend: { display:false } }
      }
    });
  }

  /* -----------------------------------------------------------------
     3️⃣ CLASS SCHEDULE (student-only classes)
     ----------------------------------------------------------------- */
  async function renderSchedule() {
    const user = Auth.currentUser();
    const allClasses = await _fetch('/api/classes');
    const student = await _fetch(`/api/students/${user.sub}`);

    const filtered = allClasses.filter(c => c.level === student.level);
    const tbody = document.querySelector('#studentScheduleTable tbody');
    tbody.innerHTML = '';
    filtered.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.id}</td><td>${c.title}</td><td>${c.day} ${c.time}</td><td>${c.coach}</td>`;
      tbody.appendChild(tr);
    });
  }

  /* -----------------------------------------------------------------
     4️⃣ GAME REVIEW LIST (static demo data)
     ----------------------------------------------------------------- */
  function renderGames() {
    const list = document.getElementById('studentGameList');
    const videos = [
      { title: 'Riya vs. Vishnu – 2025 U‑12 Championship', url: 'https://www.youtube.com/watch?v=_demo1' },
      { title: 'Lesson: Fork Tactics (Level 1)', url: 'https://www.youtube.com/watch?v=_demo2' },
      { title: 'Coach analysis: Indian Junior Open 2024', url: 'https://www.youtube.com/watch?v=_demo3' }
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
  window.loadStudentData = () => {
    const user = Auth.currentUser();
    if (user && user.role === 'student') {
      loadProfile();
      renderChart();
      renderSchedule();
      renderGames();
    }
  };

  /* -----------------------------------------------------------------
     6️⃣ Init (only load if on student page)
     ----------------------------------------------------------------- */
  window.addEventListener('DOMContentLoaded', () => {
    // Router will call loadStudentData when needed
  });
})();