/* assets/js/admin.js ----------------------------------------------------
   Handles the admin dashboard: fetches data, fills tables, shows stats.
   --------------------------------------------------------------- */
(() => {
  const token = `Bearer ${localStorage.getItem('ck_token')}`;
  const headers = { Authorization: token, 'Content-Type': 'application/json' };

  // Helper – generic fetch with auth
  const _fetch = (url, opts = {}) => fetch(url, { headers, ...opts })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).catch(err => {
      console.log('API not available, using mock data');
      // Return mock data for demo
      if (url.includes('/students')) {
        return Promise.resolve([
          { id: 1, name: "Riya", age: 10, level: "Beginner", coach_name: "Vishnu" },
          { id: 2, name: "Adhavan", age: 13, level: "Intermediate", coach_name: "Ranjith" },
          { id: 3, name: "Saran", age: 16, level: "Advanced", coach_name: "Gyansurya" }
        ]);
      } else if (url.includes('/coaches')) {
        return Promise.resolve([
          { id: 1, name: "Ranjith", fide_rating: "2200+", email: "ranjith@chesskidoo.com" },
          { id: 2, name: "Vishnu", fide_rating: "1800", email: "vishnu@chesskidoo.com" },
          { id: 3, name: "Gyansurya", fide_rating: "1600", email: "gyan@chesskidoo.com" }
        ]);
      } else if (url.includes('/classes')) {
        return Promise.resolve([
          { id: 1, title: "Beginner Basics", level: "Beginner", day: "Mon", time: "17:00", coach: "Vishnu" },
          { id: 2, title: "Intermediate Strategies", level: "Intermediate", day: "Tue", time: "16:00", coach: "Ranjith" },
          { id: 3, title: "Advanced Tactics", level: "Advanced", day: "Fri", time: "18:00", coach: "Gyansurya" }
        ]);
      }
      return Promise.resolve([]);
    });

  /* -----------------------------------------------------------------
     1️⃣ STATISTICS
     ----------------------------------------------------------------- */
  async function loadStats() {
    const [students, coaches, classes] = await Promise.all([
      _fetch('/api/students'),
      _fetch('/api/coaches'),
      _fetch('/api/classes')
    ]);
    document.getElementById('statStudents').textContent = students.length;
    document.getElementById('statCoaches').textContent = coaches.length;
    document.getElementById('statClasses').textContent = classes.length;
    // Demo requests = random small number
    document.getElementById('statDemos').textContent = Math.floor(Math.random() * 5) + 1;
  }

  /* -----------------------------------------------------------------
     2️⃣ STUDENTS TABLE
     ----------------------------------------------------------------- */
  async function renderStudents() {
    const students = await _fetch('/api/students');
    const tbody = document.querySelector('#adminStudentsTable tbody');
    tbody.innerHTML = '';
    students.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.age}</td>
        <td>${s.level}</td>
        <td>${s.coach_name || s.coach || 'N/A'}</td>
        <td>
          <button class="btn btn-outline btn-sm edit-student" data-id="${s.id}">✏️ Edit</button>
          <button class="btn btn-outline btn-sm delete-student" data-id="${s.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.edit-student').forEach(btn => {
      btn.addEventListener('click', () => editStudent(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-student').forEach(btn => {
      btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
    });
  }

  function editStudent(id) {
    CK.showToast(`Edit student ${id} (demo)`, 'info');
  }
  function deleteStudent(id) {
    if (!confirm('Delete this student?')) return;
    CK.showToast(`Student ${id} deleted (demo)`, 'success');
    renderStudents();
  }

  /* -----------------------------------------------------------------
     3️⃣ COACHES TABLE
     ----------------------------------------------------------------- */
  async function renderCoaches() {
    const coaches = await _fetch('/api/coaches');
    const tbody = document.querySelector('#adminCoachesTable tbody');
    tbody.innerHTML = '';
    coaches.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.fide_rating}</td>
        <td>${c.email}</td>
        <td>
          <button class="btn btn-outline btn-sm edit-coach" data-id="${c.id}">✏️ Edit</button>
          <button class="btn btn-outline btn-sm delete-coach" data-id="${c.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.edit-coach').forEach(btn => {
      btn.addEventListener('click', () => editCoach(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-coach').forEach(btn => {
      btn.addEventListener('click', () => deleteCoach(btn.dataset.id));
    });
  }

  function editCoach(id) {
    CK.showToast(`Edit coach ${id} (demo)`, 'info');
  }
  function deleteCoach(id) {
    if (!confirm('Delete this coach?')) return;
    CK.showToast(`Coach ${id} deleted (demo)`, 'success');
    renderCoaches();
  }

  /* -----------------------------------------------------------------
     4️⃣ CLASSES TABLE
     ----------------------------------------------------------------- */
  async function renderClasses() {
    const classes = await _fetch('/api/classes');
    const tbody = document.querySelector('#adminClassesTable tbody');
    tbody.innerHTML = '';
    classes.forEach(cls => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cls.id}</td>
        <td>${cls.title}</td>
        <td>${cls.level}</td>
        <td>${cls.day} ${cls.time}</td>
        <td>${cls.coach || cls.coach_id}</td>
        <td>
          <button class="btn btn-outline btn-sm edit-class" data-id="${cls.id}">✏️ Edit</button>
          <button class="btn btn-outline btn-sm delete-class" data-id="${cls.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.edit-class').forEach(btn => {
      btn.addEventListener('click', () => editClass(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-class').forEach(btn => {
      btn.addEventListener('click', () => deleteClass(btn.dataset.id));
    });
  }

  function editClass(id) {
    CK.showToast(`Edit class ${id} (demo)`, 'info');
  }
  function deleteClass(id) {
    if (!confirm('Delete this class?')) return;
    CK.showToast(`Class ${id} deleted (demo)`, 'success');
    renderClasses();
  }

  /* -----------------------------------------------------------------
     5️⃣ QUICK "Add" simulators (just toast)
     ----------------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-student-btn')) {
      CK.showToast('Add Student – open modal (demo)', 'info');
    } else if (e.target.classList.contains('add-coach-btn')) {
      CK.showToast('Add Coach – open modal (demo)', 'info');
    } else if (e.target.classList.contains('add-class-btn')) {
      CK.showToast('Add Class – open modal (demo)', 'info');
    }
  });

  /* -----------------------------------------------------------------
     6️⃣ Load Data Function (called by router)
     ----------------------------------------------------------------- */
  window.loadAdminData = () => {
    const user = Auth.currentUser();
    if (user && user.role === 'admin') {
      document.getElementById('adminName').textContent = user.name;
      loadStats();
      renderStudents();
      renderCoaches();
      renderClasses();
    }
  };

  /* -----------------------------------------------------------------
     7️⃣ Init (only load if on admin page)
     ----------------------------------------------------------------- */
  window.addEventListener('DOMContentLoaded', () => {
    // Router will call loadAdminData when needed
  });
})();