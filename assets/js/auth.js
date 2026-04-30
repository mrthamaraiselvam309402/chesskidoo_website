/* assets/js/auth.js -------------------------------------------------------
   Supabase-based Authentication Logic for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      CK.showToast("Authenticating...", "info");
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch user profile from the 'users' table
      const { data: profile, error: profError } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('userid', data.user.id)
        .maybeSingle();

      if (profError) throw profError;

      if (profile) {
        CK.currentUser = profile;
        localStorage.setItem('ck_user', JSON.stringify(profile));
        localStorage.setItem('ck_session', JSON.stringify(data.session));
        
        CK.showToast(`Welcome back, ${profile.full_name}!`, 'success');
        
        // Redirect based on role
        const role = profile.role || 'student';
        CK.showPage(`${role}-page`);
        
        // Load specific dashboard data
        if (role === 'admin') CK.loadAdminDashboard();
        if (role === 'student') CK.loadStudentDashboard();
        if (role === 'coach') CK.loadCoachDashboard();
        
      } else {
        throw new Error("User profile not found. Please contact admin.");
      }

    } catch (err) {
      console.error("Login failed:", err);
      CK.showToast(err.message || "Invalid credentials", 'error');
    }
  };

  CK.logout = async () => {
    await window.supabaseClient.auth.signOut();
    localStorage.removeItem('ck_user');
    localStorage.removeItem('ck_session');
    CK.currentUser = null;
    CK.showPage('landing');
    CK.showToast("Logged out successfully", 'success');
    window.location.reload(); // Refresh to clear all states
  };

  // Restore session on load
  window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('ck_user');
    if (savedUser) {
      CK.currentUser = JSON.parse(savedUser);
      // Optional: Auto-login logic could go here
    }
  });

})();