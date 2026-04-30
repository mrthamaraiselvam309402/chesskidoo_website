/* assets/js/auth.js -------------------------------------------------------
   Supabase-based Authentication Logic for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  // ---- Login Logic ----
  const loginForm = document.getElementById('loginFormSPA');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.username.value;
      const password = loginForm.password.value;

      try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Fetch user profile from profiles table
        const { data: profile, error: profError } = await window.supabaseClient
          .from('profiles')
          .select('*')
          .eq('userid', data.user.id)
          .maybeSingle();

        if (profError) throw profError;

        if (profile) {
          localStorage.setItem('ck_user', JSON.stringify(profile));
          localStorage.setItem('ck_session', JSON.stringify(data.session));
          
          CK.showToast(`Welcome back, ${profile.full_name}!`, 'success');
          
          // Redirect based on role
          const role = profile.role || 'student';
          CK.showPage(`${role}-page`);
        } else {
          throw new Error("User profile not found.");
        }

      } catch (err) {
        console.error("Login failed:", err);
        CK.showToast(err.message || "Invalid credentials", 'error');
      }
    });
  }

  // ---- Logout Logic ----
  CK.logout = async () => {
    await window.supabaseClient.auth.signOut();
    localStorage.removeItem('ck_user');
    localStorage.removeItem('ck_session');
    CK.showHome();
    CK.showToast("Logged out successfully", 'success');
  };

  // ---- Auth Guard ----
  CK.checkAuth = () => {
    const user = JSON.parse(localStorage.getItem('ck_user'));
    const session = JSON.parse(localStorage.getItem('ck_session'));
    return (user && session);
  };

  CK.getCurrentUser = () => JSON.parse(localStorage.getItem('ck_user'));

})();