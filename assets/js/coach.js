/* assets/js/coach.js -------------------------------------------------------
   Coach Dashboard logic for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.switchCoachTab = (tab, btn) => {
    document.querySelectorAll('#coach-page .admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    CK.loadCoachTab(tab);
  };

  CK.loadCoachDashboard = () => {
    CK.loadCoachTab('students');
  };

  CK.loadCoachTab = async (tab) => {
    const content = document.getElementById('coach-tab-content');
    content.innerHTML = '<div class="loading-wrap">♛ Loading...</div>';

    try {
      const user = CK.currentUser;
      if (!user) throw new Error("Not logged in");

      switch (tab) {
        case 'students':
          await loadCoachStudents(content, user);
          break;
        case 'attendance':
          await loadCoachAttendance(content, user);
          break;
        case 'resources':
          await loadCoachResources(content, user);
          break;
      }
    } catch (err) {
      console.error("Coach Tab Error:", err);
      content.innerHTML = `<div class="error-wrap">❌ Error: ${err.message}</div>`;
    }
  };

  async function loadCoachStudents(el, coach) {
    const { data: students } = await window.supabaseClient
      .from('users')
      .select('*')
      .eq('coach', coach.full_name)
      .eq('role', 'student');

    el.innerHTML = `
      <h3>My Students (${students.length})</h3>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>Name</th><th>Level</th><th>Batch</th><th>Rating</th></tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td style="font-weight:600;">${s.full_name}</td>
                <td><span class="hero-badge" style="font-size:0.7rem;">${s.level}</span></td>
                <td>${s.batch || '-'}</td>
                <td>${s.star || 0} ★</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async function loadCoachAttendance(el, coach) {
    const { data: students } = await window.supabaseClient
      .from('users')
      .select('*')
      .eq('coach', coach.full_name)
      .eq('role', 'student');

    el.innerHTML = `
      <h3>Mark Attendance</h3>
      <p style="margin-bottom:20px; opacity:0.7;">Mark students present for today: ${new Date().toLocaleDateString()}</p>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>Student</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td>${s.full_name}</td>
                <td id="att-status-${s.id}">-</td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="CK.markStudentPresent('${s.id}')">Present ✅</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async function loadCoachResources(el, coach) {
    const { data: files } = await window.supabaseClient
      .from('document')
      .select('*')
      .eq('coach', coach.full_name)
      .order('created_at', { ascending: false });

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>My Resources</h3>
        <button class="btn btn-primary" onclick="CK.openModal('uploadModal')">+ Upload Resource</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>Date</th><th>Document</th><th>Level</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${files.map(f => `
              <tr>
                <td>${new Date(f.created_at).toLocaleDateString()}</td>
                <td style="font-weight:600;">${f.file_name.split('/').pop()}</td>
                <td>${f.level}</td>
                <td>
                  <button class="btn btn-ghost btn-sm" onclick="CK.deleteFile('${f.file_name}')">🗑️</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  CK.markStudentPresent = async (studentId) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const { error } = await window.supabaseClient.from('attendance').upsert({
        userid: studentId,
        date: date,
        status: 'present'
      });
      if (error) throw error;
      document.getElementById(`att-status-${studentId}`).innerHTML = '<span style="color:green;">Present ✅</span>';
      CK.showToast("Attendance marked", "success");
    } catch (err) {
      CK.showToast("Failed to mark attendance", "error");
    }
  };

})();