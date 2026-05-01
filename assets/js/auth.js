/* assets/js/auth.js -------------------------------------------------------
   Supabase Authentication — handles all roles: admin, student, coach
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email    = form.email.value.trim();
    const password = form.password.value;
    const btn      = form.querySelector('[type="submit"]');

    btn.textContent = '♛ Entering...';
    btn.disabled = true;

    try {
      CK.showToast('Authenticating...', 'info');
      // DEMO BYPASS: Allows testing even if Supabase Auth is not set up
      if ((email === 'admin@gmail.com' && (password === 'admin' || password === 'admin123')) || (email === 'coach@gmail.com' && password === 'coach')) {
        const role = email.split('@')[0];
        const demoProfile = {
          userid: 'demo-user-' + role,
          full_name: role.charAt(0).toUpperCase() + role.slice(1) + ' Demo',
          email: email,
          role: role
        };
        CK.currentUser = demoProfile;
        localStorage.setItem('ck_user', JSON.stringify(demoProfile));
        CK.showToast('Welcome to Demo Mode! ♛', 'success');
        setTimeout(() => {
          CK.showPage(role + '-page');
          if (role === 'admin') CK.admin.init();
          if (role === 'coach') CK.coach.init();
          if (role === 'student') CK.student.init();
        }, 500);
        return;
      }


      const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Fetch profile from public.users table
      const { data: profile, error: profErr } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('userid', data.user.id)
        .maybeSingle();

      if (profErr) throw profErr;

      if (!profile) {
        // Fallback: check if this is admin via config
        if (data.user.id === window.APP_CONFIG?.ADMIN_ID || email === 'admin@gmail.com') {
          const adminProfile = {
            userid: data.user.id,
            full_name: 'Academy Admin',
            email: email,
            role: 'admin'
          };
          CK.currentUser = adminProfile;
          localStorage.setItem('ck_user', JSON.stringify(adminProfile));
          localStorage.setItem('ck_session', JSON.stringify(data.session));
          CK.showToast('Welcome, Admin! 🏆', 'success');
          CK.showPage('admin-page');
          CK.admin.init();
          return;
        }
        throw new Error('User profile not found. Please contact the admin.');
      }

      CK.currentUser = profile;
      localStorage.setItem('ck_user', JSON.stringify(profile));
      localStorage.setItem('ck_session', JSON.stringify(data.session));

      const role = (profile.role || 'student').toLowerCase();
      CK.showToast(`Welcome back, ${profile.full_name || 'Champion'}! ♟`, 'success');

      setTimeout(() => {
        CK.showPage(`${role}-page`);
        if (role === 'admin')   CK.admin.init();
        if (role === 'student') CK.student.init();
        if (role === 'coach')   CK.coach.init();
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      CK.showToast(err.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      btn.textContent = 'Enter the Arena →';
      btn.disabled = false;
    }
  };

  CK.logout = async () => {
    try {
      await window.supabaseClient.auth.signOut();
    } catch(e) {}
    localStorage.removeItem('ck_user');
    localStorage.removeItem('ck_session');
    CK.currentUser = null;
    CK.showToast('Logged out successfully.', 'success');
    setTimeout(() => {
      CK.showPage('landing-page');
      window.scrollTo(0, 0);
    }, 400);
  };

})();