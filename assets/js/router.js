/* assets/js/router.js -----------------------------------------------------
   SPA Router — delegates to main.js CK.showPage, adds auth guards
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  // NOTE: CK.showPage is defined in main.js. This file only adds guards.
  CK.showHome  = () => CK.showPage('landing-page');
  CK.showLogin = () => CK.showPage('login-page');

  CK.checkAuth = () => {
    return !!(CK.currentUser || localStorage.getItem('ck_user'));
  };

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'login') CK.showLogin();
    else CK.showHome();
  });

})();