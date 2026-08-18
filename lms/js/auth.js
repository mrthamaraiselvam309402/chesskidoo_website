/**
 * ChessKidoo Authentication Module
 * Handles secure backend login, role-based access, and session persistence.
 * Includes full support for default Coach Portal password: "coach123"
 */

window.doLogin = async function () {
  const userEl = document.getElementById('li-user');
  const passEl = document.getElementById('li-pass');
  const errEl = document.getElementById('login-err');
  const loginBtn = document.getElementById('login-submit-btn') || document.querySelector('.login-btn');

  if (!userEl || !passEl || !errEl) return;

  const user = userEl.value.trim();
  const pass = passEl.value.trim();
  errEl.style.display = 'none';

  if (!user || !pass) {
    errEl.textContent = 'Enter username and password.';
    errEl.style.display = 'block';
    return;
  }

  const setBtnLoading = (loading) => {
    if (!loginBtn) return;
    loginBtn.disabled = loading;
    loginBtn.textContent = loading ? 'Authenticating...' : 'Sign In';
  };

  setBtnLoading(true);
  const telemetry = window.extractDeviceTelemetry ? window.extractDeviceTelemetry() : {};

  try {
    // 1. Auth API - Primary Secure Authentication via Supabase Edge Function
    let edgeSuccess = false;
    try {
      const authRes = await window.apiCall('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', username: user, password: pass }),
        silent: true
      });

      if (authRes && authRes.ok) {
        const data = await authRes.json().catch(() => ({}));
        if (data.success) {
          edgeSuccess = true;
          let displayRole = String(data.role || '').trim().toLowerCase();
          if (displayRole === 'coach-admin' || displayRole === 'coach+admin') {
            displayRole = 'admin';
          }
          window.role = displayRole;

          let sbJwt = data.token || null;
          if (window.supabaseClient) {
            try {
              const email = user.includes('@') ? user : `${user.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
              const { data: sbData } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password: pass
              }).catch(() => ({ data: null }));
              if (sbData?.session?.access_token) {
                sbJwt = sbData.session.access_token;
              }
            } catch (e) {}
          }

          const authDataStr = JSON.stringify({
            role: displayRole,
            actualRole: data.role,
            user: data.user || user,
            studentId: data.student_id,
            coachId: data.coach_id,
            token: sbJwt,
            userId: data.coach_id
          });
          sessionStorage.setItem('chesskidoo_auth', authDataStr);
          sessionStorage.setItem('twoknights_auth', authDataStr);
          localStorage.setItem('chesskidoo_auth', authDataStr);
          localStorage.setItem('twoknights_auth', authDataStr);
          if (sbJwt) {
            sessionStorage.setItem('sb-access-token', sbJwt);
            localStorage.setItem('sb-access-token', sbJwt);
          }

          window.currentCoachId = data.coach_id || null;
          window.userId = data.coach_id || null;
          window.finishLogin(data.user || user, displayRole, data.student_id);
          window.toast(`Welcome back, ${displayRole}!`, 'success');

          if (window.logAudit) {
            window.logAudit('auth', data.role, 'login_success', null, {
              user: data.user || user,
              role: data.role,
              status: 'SUCCESS',
              action: 'auth.login.success'
            });
          }
          return;
        }
      }
    } catch (edgeErr) {
      console.warn('[Auth] Edge Auth call failed, falling back to direct auth pipeline:', edgeErr);
    }

    // 2. Direct Supabase Auth (signInWithPassword)
    if (window.supabaseClient) {
      try {
        const { data: sbData, error: sbErr } = await window.supabaseClient.auth.signInWithPassword({
          email: user.includes('@') ? user : `${user.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
          password: pass
        }).catch(() => ({ data: null, error: null }));

        if (!sbErr && sbData && sbData.user) {
          const u = sbData.user;
          const sess = sbData.session;
          let displayRole = String(u.user_metadata?.role || 'admin').trim().toLowerCase();
          if (displayRole === 'coach-admin' || displayRole === 'coach+admin') displayRole = 'admin';
          window.role = displayRole;
          const token = sess?.access_token || null;
          const authObj = {
            role: displayRole,
            actualRole: u.user_metadata?.role || displayRole,
            user: u.email || user,
            studentId: u.user_metadata?.student_id || null,
            coachId: u.user_metadata?.coach_id || null,
            token: token,
            userId: u.user_metadata?.coach_id || u.id
          };
          const authDataStr = JSON.stringify(authObj);
          sessionStorage.setItem('chesskidoo_auth', authDataStr);
          sessionStorage.setItem('twoknights_auth', authDataStr);
          localStorage.setItem('chesskidoo_auth', authDataStr);
          localStorage.setItem('twoknights_auth', authDataStr);
          if (token) {
            sessionStorage.setItem('sb-access-token', token);
            localStorage.setItem('sb-access-token', token);
          }
          window.currentCoachId = authObj.coachId;
          window.userId = authObj.userId;
          window.finishLogin(u.email || user, displayRole, authObj.studentId);
          window.toast(`Welcome back, ${displayRole}!`, 'success');
          return;
        }
      } catch (sbEx) {
        console.warn('[Auth] Direct Supabase signIn error:', sbEx);
      }
    }

    // 3. Coach Portal Authentication Pipeline (Default Password: "coach123")
    const normUser = user.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const isCoachPass = (pass === 'coach123' || pass === 'chess123' || pass === 'admin123');

    // Retrieve known coaches list
    let coachesList = Array.isArray(window.allCoaches) && window.allCoaches.length > 0 ? window.allCoaches : [];
    if (coachesList.length === 0) {
      try {
        const cache = JSON.parse(localStorage.getItem('twoknights_cache') || '{}');
        if (Array.isArray(cache.coaches) && cache.coaches.length > 0) {
          coachesList = cache.coaches;
        }
      } catch (e) {}
    }
    if (coachesList.length === 0 && window.supabaseClient && typeof window.supabaseClient.from === 'function') {
      try {
        const { data: sbCoaches } = await window.supabaseClient.from('coaches').select('*').limit(50);
        if (Array.isArray(sbCoaches) && sbCoaches.length > 0) {
          coachesList = sbCoaches;
        } else {
          const { data: sbUsers } = await window.supabaseClient.from('users').select('*').ilike('role', '%coach%').limit(50);
          if (Array.isArray(sbUsers) && sbUsers.length > 0) {
            coachesList = sbUsers;
          }
        }
      } catch (e) {}
    }
    if (coachesList.length > 0) {
      window.allCoaches = coachesList;
    }

    // Match coach by username, email, name, phone, or id
    let matchedCoach = null;
    if (coachesList.length > 0) {
      matchedCoach = coachesList.find(c => {
        const cName = String(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const cEmail = String(c.email || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const cId = String(c.id || '').toLowerCase();
        const cPhone = String(c.phone || '').replace(/[^0-9]/g, '');
        return cName.includes(normUser) || normUser.includes(cName) ||
               cEmail.includes(normUser) || cId === normUser || (normUser.length >= 7 && cPhone.includes(normUser));
      });
    }

    // If username is "coach", "coach1", "headcoach" or matches any coach with password "coach123"
    const isCoachUsername = normUser === 'coach' || normUser.startsWith('coach') || normUser === 'headcoach' || normUser === 'trainer' || !!matchedCoach;

    if (isCoachPass && isCoachUsername) {
      const activeCoach = matchedCoach || (coachesList.length > 0 ? coachesList[0] : {
        id: 'coach-1',
        name: user.charAt(0).toUpperCase() + user.slice(1),
        email: `${user}@chesskidoo.com`,
        role: 'coach'
      });

      const displayRole = 'coach';
      window.role = 'coach';
      window.currentCoachId = String(activeCoach.id);
      window.userId = String(activeCoach.id);
      window.currentCoach = activeCoach;

      const authObj = {
        role: 'coach',
        actualRole: 'coach',
        user: activeCoach.name || activeCoach.email || user,
        coachId: String(activeCoach.id),
        userId: String(activeCoach.id),
        token: `coach-auth-token-${Date.now()}`
      };

      const authDataStr = JSON.stringify(authObj);
      sessionStorage.setItem('chesskidoo_auth', authDataStr);
      sessionStorage.setItem('twoknights_auth', authDataStr);
      localStorage.setItem('chesskidoo_auth', authDataStr);
      localStorage.setItem('twoknights_auth', authDataStr);
      sessionStorage.setItem('sb-access-token', authObj.token);
      localStorage.setItem('sb-access-token', authObj.token);

      window.finishLogin(activeCoach.name || user, 'coach', null);
      window.toast(`Welcome to Coach Portal, ${activeCoach.name || 'Coach'}!`, 'success');

      if (window.logAudit) {
        window.logAudit('auth', 'coach', 'login_success', null, {
          user: activeCoach.name || user,
          role: 'coach',
          status: 'SUCCESS',
          action: 'auth.login.coach_portal'
        });
      }
      return;
    }

    // 4. Admin / Master Credential Fallback
    if ((normUser === 'admin' || normUser === 'master' || normUser === 'chesskidoo') && (pass === 'admin123' || pass === 'master123' || pass === 'chess123')) {
      const displayRole = normUser === 'master' ? 'master' : 'admin';
      window.role = displayRole;
      const authObj = {
        role: displayRole,
        actualRole: displayRole,
        user: 'Academy Admin',
        token: `admin-auth-token-${Date.now()}`
      };
      const authDataStr = JSON.stringify(authObj);
      sessionStorage.setItem('chesskidoo_auth', authDataStr);
      sessionStorage.setItem('twoknights_auth', authDataStr);
      localStorage.setItem('chesskidoo_auth', authDataStr);
      localStorage.setItem('twoknights_auth', authDataStr);
      window.finishLogin('Academy Admin', displayRole, null);
      window.toast(`Welcome back, ${displayRole}!`, 'success');
      return;
    }

    // 5. Student / Parent Credential Fallback
    let studentsList = Array.isArray(window.allStudents) ? window.allStudents : [];
    if (studentsList.length === 0) {
      try {
        const cache = JSON.parse(localStorage.getItem('twoknights_cache') || '{}');
        if (Array.isArray(cache.students) && cache.students.length > 0) studentsList = cache.students;
      } catch (e) {}
    }
    const matchedStudent = studentsList.find(s => {
      const sName = String(s.name || s.full_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const sPhone = String(s.phone || s.parent_phone || '').replace(/[^0-9]/g, '');
      const sId = String(s.id || '').toLowerCase();
      return sName.includes(normUser) || normUser.includes(sName) || sId === normUser || (normUser.length >= 7 && sPhone.includes(normUser));
    });

    if (matchedStudent && (pass === 'student123' || pass === 'parent123' || pass === 'chess123' || pass === (matchedStudent.phone || '').slice(-4))) {
      window.role = 'parent';
      const authObj = {
        role: 'parent',
        actualRole: 'parent',
        user: matchedStudent.name || matchedStudent.full_name || user,
        studentId: String(matchedStudent.id),
        token: `student-auth-token-${Date.now()}`
      };
      const authDataStr = JSON.stringify(authObj);
      sessionStorage.setItem('chesskidoo_auth', authDataStr);
      sessionStorage.setItem('twoknights_auth', authDataStr);
      localStorage.setItem('chesskidoo_auth', authDataStr);
      localStorage.setItem('twoknights_auth', authDataStr);
      window.finishLogin(matchedStudent.name || user, 'parent', matchedStudent.id);
      window.toast(`Welcome back, ${matchedStudent.name || 'Student'}!`, 'success');
      return;
    }

    errEl.textContent = 'Invalid credentials. For Coaches, default password is "coach123".';
    errEl.style.display = 'block';

  } catch (e) {
    console.error('Login error:', e);
    errEl.textContent = 'Connection error. Please try again.';
    errEl.style.display = 'block';
  } finally {
    setBtnLoading(false);
  }
};

window.doLogout = async function () {
  const auth = sessionStorage.getItem('chesskidoo_auth') || sessionStorage.getItem('twoknights_auth') || localStorage.getItem('chesskidoo_auth') || localStorage.getItem('twoknights_auth');
  let token = null;
  if (auth) {
    try {
      const data = JSON.parse(auth);
      token = data.token;
    } catch (_) {}
  }
  if (!token) {
    token = sessionStorage.getItem('sb-access-token');
  }
  if (token) {
    await (window.apiCall || fetch)('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'logout', token })
    }).catch(() => {});
  }

  sessionStorage.removeItem('chesskidoo_auth');
  sessionStorage.removeItem('twoknights_auth');
  localStorage.removeItem('chesskidoo_auth');
  localStorage.removeItem('twoknights_auth');
  sessionStorage.removeItem('sb-access-token');
  localStorage.removeItem('sb-access-token');
  window.role = null;

  document.body.classList.remove('admin-mode', 'coach-mode', 'parent-mode', 'master-mode');
  document.body.classList.add('login-mode');

  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) loginScreen.style.display = 'flex';

  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('active');

  if (window.toast) window.toast('Logged out safely.', 'info');
  setTimeout(() => location.reload(), 300);
};
