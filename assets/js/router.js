/* assets/js/router.js ---------------------------------------------------
   Single-page application routing - handles showing/hiding pages
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  // Page management
  const pages = ['landing-page', 'login-page', 'admin-page', 'student-page', 'coach-page'];

  CK.showPage = (pageId) => {
    // Hide all pages
    pages.forEach(id => {
      const page = document.getElementById(id);
      if (page) page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
      // Update URL hash without triggering scroll
      if (pageId === 'landing-page') {
        history.replaceState(null, null, '/');
      } else {
        history.replaceState(null, null, '#' + pageId.replace('-page', ''));
      }
    }

    // Handle special cases
    if (pageId === 'admin-page') {
      // Load admin data
      if (window.loadAdminData) window.loadAdminData();
    } else if (pageId === 'student-page') {
      // Load student data
      if (window.loadStudentData) window.loadStudentData();
    } else if (pageId === 'coach-page') {
      // Load coach data
      if (window.loadCoachData) window.loadCoachData();
    }
  };

  // Convenience methods
  CK.showHome = () => CK.showPage('landing-page');
  CK.showLogin = () => CK.showPage('login-page');
  CK.showAdmin = () => CK.showPage('admin-page');
  CK.showStudent = () => CK.showPage('student-page');
  CK.showCoach = () => CK.showPage('coach-page');

  // Handle URL hash changes
  const handleHashChange = () => {
    const hash = window.location.hash.substring(1); // Remove #

    // Check if user is authenticated
    const user = Auth.currentUser();

    if (!user) {
      // Not logged in - only allow landing and login pages
      if (hash === 'login' || hash === '') {
        CK.showPage(hash === 'login' ? 'login-page' : 'landing-page');
      } else {
        CK.showPage('landing-page');
      }
    } else {
      // Logged in - route based on role and hash
      if (hash === 'admin' && user.role === 'admin') {
        CK.showAdmin();
      } else if (hash === 'student' && user.role === 'student') {
        CK.showStudent();
      } else if (hash === 'coach' && user.role === 'coach') {
        CK.showCoach();
      } else if (hash === '' || hash === 'home') {
        CK.showHome();
      } else {
        // Default to role-appropriate page
        if (user.role === 'admin') CK.showAdmin();
        else if (user.role === 'student') CK.showStudent();
        else if (user.role === 'coach') CK.showCoach();
      }
    }
  };

  // Initialize routing on page load
  window.addEventListener('load', () => {
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Handle initial load
    handleHashChange();

    // Update login button to use SPA routing
    const loginBtn = document.querySelector('.nav-links .btn-outline');
    if (loginBtn) {
      loginBtn.onclick = () => CK.showLogin();
    }

    // Update mobile login button
    const mobileLoginBtn = document.querySelector('.mobile-nav-cta .btn-outline');
    if (mobileLoginBtn) {
      mobileLoginBtn.onclick = () => {
        CK.closeMobileMenu();
        CK.showLogin();
      };
    }
  });

  // Override Auth.logout to redirect to home
  const originalLogout = Auth.logout;
  Auth.logout = () => {
    originalLogout();
    CK.showHome();
  };

})();