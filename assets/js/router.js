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
      window.scrollTo(0, 0); // Reset scroll on page switch
      
      // Update URL hash
      if (pageId === 'landing-page') {
        history.replaceState(null, null, ' ');
      } else {
        history.replaceState(null, null, '#' + pageId.replace('-page', ''));
      }
    }

    // Load page-specific data
    if (pageId === 'admin-page' && window.loadAdminData) window.loadAdminData();
    if (pageId === 'student-page' && window.loadStudentData) window.loadStudentData();
    if (pageId === 'coach-page' && window.loadCoachData) window.loadCoachData();
  };

  CK.showHome = () => CK.showPage('landing-page');
  CK.showLogin = () => CK.showPage('login-page');
  CK.showAdmin = () => CK.showPage('admin-page');
  CK.showStudent = () => CK.showPage('student-page');
  CK.showCoach = () => CK.showPage('coach-page');

  const handleHashChange = () => {
    const hash = window.location.hash.substring(1);
    const user = typeof Auth !== 'undefined' ? Auth.currentUser() : null;

    if (!user) {
      if (hash === 'login') CK.showLogin();
      else CK.showHome();
    } else {
      if (hash === 'admin' && user.role === 'admin') CK.showAdmin();
      else if (hash === 'student' && user.role === 'student') CK.showStudent();
      else if (hash === 'coach' && user.role === 'coach') CK.showCoach();
      else {
        // Redirect to role-appropriate dashboard
        if (user.role === 'admin') CK.showAdmin();
        else if (user.role === 'student') CK.showStudent();
        else if (user.role === 'coach') CK.showCoach();
      }
    }
  };

  window.addEventListener('load', () => {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    // Handle Login Form
    const loginForm = document.getElementById('loginFormSPA');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userVal = formData.get('username');
        const passVal = formData.get('password');

        if (!userVal || !passVal) {
          CK.showToast('Enter both username and password', 'error');
          return;
        }

        try {
          const user = await Auth.login(userVal, passVal);
          CK.showToast(`Welcome, ${user.name}!`, 'success');
          
          if (user.role === 'admin') CK.showAdmin();
          else if (user.role === 'student') CK.showStudent();
          else if (user.role === 'coach') CK.showCoach();
        } catch (err) {
          CK.showToast('Invalid credentials', 'error');
        }
      });
    }
  });

  // Override Auth.logout to redirect to home
  if (typeof Auth !== 'undefined') {
    const originalLogout = Auth.logout;
    Auth.logout = () => {
      originalLogout();
      CK.showHome();
    };
  }

})();