/* assets/js/router.js -----------------------------------------------------
   SPA Router with Auth Guards and Dynamic View Loading
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.showPage = (id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      window.scrollTo(0, 0);
      
      // Load specific view data
      if (id === 'student-page') CK.loadStudentDashboard();
      if (id === 'admin-page') typeof CK.loadAdminDashboard === 'function' && CK.loadAdminDashboard();
      if (id === 'coach-page') typeof CK.loadCoachDashboard === 'function' && CK.loadCoachDashboard();
    }
  };

  CK.showHome = () => CK.showPage('landing-page');
  CK.showLogin = () => CK.showPage('login-page');

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'login') CK.showLogin();
    else if (hash === 'student' && CK.checkAuth()) CK.showPage('student-page');
    else CK.showHome();
  });

})();