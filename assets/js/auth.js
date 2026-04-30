(() => {
  const API = '/api'; // Use relative path for Vercel deployment

  function _storeToken(token) {
    localStorage.setItem('ck_token', token);
  }
  function _getToken() {
    return localStorage.getItem('ck_token');
  }
  function _decodePayload(token) {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (_) { return null; }
  }

  window.Auth = {
    /** Demo login – talks to the mock API (or real API) and stores a JWT */
    login(username, password, remember = false) {
      return fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }).then(r => {
        if (!r.ok) throw new Error('Invalid credentials');
        return r.json();
      }).then(data => {
        const token = data.token;
        _storeToken(token);
        if (remember) localStorage.setItem('ck_remember', token);
        else localStorage.removeItem('ck_remember');
        return _decodePayload(token);
      }).catch(err => {
        // Fallback to mock authentication for demo
        console.log('API not available, using mock auth');
        const mockUsers = [
          { id: 1, username: 'admin@ck', password: 'Admin123$', name: 'Admin', role: 'admin' },
          { id: 2, username: 'student@ck', password: 'Student123', name: 'Riya', role: 'student' },
          { id: 3, username: 'coach@ck', password: 'Coach123', name: 'Vishnu', role: 'coach' }
        ];

        const user = mockUsers.find(u => u.username === username && u.password === password);
        if (!user) throw new Error('Invalid credentials');

        // Create mock JWT
        const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ sub: user.id, name: user.name, role: user.role }));
        const token = `${header}.${payload}.signature`;

        _storeToken(token);
        return _decodePayload(token);
      });
    },

    logout() {
      localStorage.removeItem('ck_token');
      localStorage.removeItem('ck_remember');
      window.location.hash = '';
      window.location.reload();
    },

    /** Returns the parsed payload or null */
    currentUser() {
      const token = _getToken() || localStorage.getItem('ck_remember');
      if (!token) return null;
      const payload = _decodePayload(token);
      if (!localStorage.getItem('ck_token') && token) _storeToken(token);
      return payload;
    },

    /** Guard a page – if the role doesn't match, redirect to login */
    guard(requiredRole) {
      const user = this.currentUser();
      if (!user) {
        CK.showLogin();
        return false;
      }
      if (requiredRole && user.role !== requiredRole) {
        CK.showLogin();
        return false;
      }
      return true;
    }
  };
})();