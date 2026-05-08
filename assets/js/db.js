/* assets/js/db.js ---------------------------------------------------------
   ChessKidoo Resilient Database Layer (Supabase + LocalStorage Fallback)
   
   This module provides unified CRUD wrappers for users, documents, attendance,
   and ratings. It automatically handles offline environments by falling back
   to a highly robust localStorage database populated with beautiful demo data.
   ------------------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  // Default Mock Database Structure
  const DEFAULT_DB = {
    users: [
      {
        id: "a007b0b0-9b30-478f-a147-1af18dff20ce", // ADMIN_UUID from config
        email: "admin@gmail.com",
        full_name: "Academy Admin",
        role: "admin",
        userid: "admin",
        phone_number: "+91 90258 46663",
        city: "Chennai"
      },
      {
        id: "student-uuid-1",
        email: "student@gmail.com",
        full_name: "Emma Wilson",
        role: "student",
        phone_number: "+91 90258 46663",
        level: "Intermediate",
        userid: "101",
        coach: "Sarah Chess",
        batch: "1",
        age: 10,
        grade: "5th Grade",
        city: "Chennai",
        puzzle: "45",
        game: "28",
        star: 4,
        photo: "",
        certificate: "certificates/emma_wilson_lvl1.pdf"
      },
      {
        id: "student-uuid-2",
        email: "james@gmail.com",
        full_name: "James Smith",
        role: "student",
        phone_number: "+91 98765 43210",
        level: "Beginner",
        userid: "102",
        coach: "Michael Knight",
        batch: "2",
        age: 8,
        grade: "3rd Grade",
        city: "Coimbatore",
        puzzle: "15",
        game: "12",
        star: 1,
        photo: "",
        certificate: ""
      },
      {
        id: "student-uuid-3",
        email: "leo@gmail.com",
        full_name: "Leo Garcia",
        role: "student",
        phone_number: "+91 94440 12345",
        level: "Advanced",
        userid: "103",
        coach: "Sarah Chess",
        batch: "1",
        age: 12,
        grade: "7th Grade",
        city: "Bangalore",
        puzzle: "85",
        game: "52",
        star: 5,
        photo: "",
        certificate: "certificates/leo_garcia_lvl2.pdf"
      },
      {
        id: "coach-uuid-1",
        email: "coach@gmail.com",
        full_name: "Sarah Chess",
        role: "coach",
        userid: "C1",
        phone_number: "+91 90258 46663",
        level: "Advanced",
        batch_list: "1,11",
        star: 5,
        puzzle: "Opening Specialist"
      },
      {
        id: "coach-uuid-2",
        email: "michael@gmail.com",
        full_name: "Michael Knight",
        role: "coach",
        userid: "C2",
        phone_number: "+91 90258 46664",
        level: "Beginner",
        batch_list: "2",
        star: 4,
        puzzle: "Tactics Specialist"
      }
    ],
    document: [
      {
        id: 1,
        created_at: "2026-05-01T12:00:00Z",
        file_name: "beginner/chess_basics.pdf",
        name: "Chess Fundamentals & Piece Movements",
        level: "Beginner",
        coach: "Michael Knight",
        batch: "2"
      },
      {
        id: 2,
        created_at: "2026-05-03T10:00:00Z",
        file_name: "intermediate/tactics_pins.pdf",
        name: "Tactical Patterns - Pins & Forks",
        level: "Intermediate",
        coach: "Sarah Chess",
        batch: "1"
      },
      {
        id: 3,
        created_at: "2026-05-05T15:00:00Z",
        file_name: "advanced/endgames_rook.pdf",
        name: "Advanced Endgames: Rook vs Pawn",
        level: "Advanced",
        coach: "Sarah Chess",
        batch: "1"
      }
    ],
    
  resources: [
    { id: 'R1', name: 'Mating_Puzzles.pdf', batch: 1, type: 'Homework', notes: 'Review before Friday' },
    { id: 'R2', name: 'Endgame_Basics.pdf', batch: 2, type: 'Homework', notes: 'Read chapter 1' },
    { id: 'R3', name: 'Opening_Principles.pdf', batch: 1, type: 'Class Notes', notes: 'Memorize lines' },
    { id: 'R4', name: 'Tactics_Test.pdf', batch: 3, type: 'Homework', notes: 'Complete by Sunday' }
  ],
  attendance: [
      { id: 1, userid: "student-uuid-1", date: "2026-05-01", status: "present" },
      { id: 2, userid: "student-uuid-1", date: "2026-05-02", status: "present" },
      { id: 3, userid: "student-uuid-1", date: "2026-05-04", status: "present" },
      { id: 4, userid: "student-uuid-1", date: "2026-05-05", status: "absent" },
      { id: 5, userid: "student-uuid-1", date: "2026-05-06", status: "present" },
      { id: 6, userid: "student-uuid-1", date: "2026-05-08", status: "present" },
      { id: 7, userid: "student-uuid-2", date: "2026-05-01", status: "present" },
      { id: 8, userid: "student-uuid-2", date: "2026-05-03", status: "present" },
      { id: 9, userid: "student-uuid-2", date: "2026-05-05", status: "present" },
      { id: 10, userid: "student-uuid-2", date: "2026-05-08", status: "absent" }
    ],
    ratings: [
      { id: 1, user_id: "101", online: 800, international: 0, date: "2026-01-10T00:00:00Z" },
      { id: 2, user_id: "101", online: 850, international: 0, date: "2026-02-10T00:00:00Z" },
      { id: 3, user_id: "101", online: 920, international: 1000, date: "2026-03-10T00:00:00Z" },
      { id: 4, user_id: "101", online: 1050, international: 1050, date: "2026-04-10T00:00:00Z" },
      { id: 5, user_id: "101", online: 1100, international: 1080, date: "2026-05-01T00:00:00Z" },
      { id: 6, user_id: "101", online: 1120, international: 1100, date: "2026-05-08T00:00:00Z" },
      { id: 7, user_id: "102", online: 500, international: 0, date: "2026-03-01T00:00:00Z" },
      { id: 8, user_id: "102", online: 550, international: 0, date: "2026-04-01T00:00:00Z" },
      { id: 9, user_id: "102", online: 650, international: 0, date: "2026-05-08T00:00:00Z" },
      { id: 10, user_id: "103", online: 1200, international: 1100, date: "2026-03-01T00:00:00Z" },
      { id: 11, user_id: "103", online: 1350, international: 1200, date: "2026-04-01T00:00:00Z" },
      { id: 12, user_id: "103", online: 1450, international: 1350, date: "2026-05-08T00:00:00Z" }
    ],
    tourRatings: [
      { id: 1, user_id: "101", name: "Chennai District Under-10", result: "3rd Place (4/5 pts)", change: "+45" },
      { id: 2, user_id: "101", name: "ChessKidoo Academy Monthly Rapid", result: "1st Place (5/5 pts)", change: "+30" },
      { id: 3, user_id: "103", name: "Tamil Nadu State Championship U-12", result: "5th Place (5.5/7 pts)", change: "+60" }
    ]
  };

  // Helper: Initialize localStorage if empty
  const initLocalStore = () => {
    Object.keys(DEFAULT_DB).forEach(key => {
      const storeKey = `ck_db_${key}`;
      if (!localStorage.getItem(storeKey)) {
        localStorage.setItem(storeKey, JSON.stringify(DEFAULT_DB[key]));
      }
    });
  };
  initLocalStore();

  // Helper: Get local storage item
  const getLocal = (key) => JSON.parse(localStorage.getItem(`ck_db_${key}`));
  
  // Helper: Set local storage item
  const setLocal = (key, data) => localStorage.setItem(`ck_db_${key}`, JSON.stringify(data));

  // Determine if Supabase can be queried
  let _supabaseDisabled = false; // Fast-fail flag: once Supabase fails, stop retrying this session
  const canUseSupabase = () => {
    if (_supabaseDisabled) return false;
    return window.supabaseClient && navigator.onLine;
  };
  const markSupabaseFailed = () => {
    if (!_supabaseDisabled) {
      _supabaseDisabled = true;
      console.warn("[ChessKidoo DB] Supabase marked unreachable. All queries will use local storage for this session.");
    }
  };

  /* ─── CK.db Main Object ─── */
  CK.db = {
    // --- USER PROFILE OPERATIONS ---
    
    // Fetch all profiles of a certain role
    async getProfiles(role = null) {
      if (canUseSupabase()) {
        try {
          let query = window.supabaseClient.from('users').select('*');
          if (role) query = query.eq('role', role);
          // Race against a 3s timeout to prevent hanging
          const result = await Promise.race([
            query,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 3000))
          ]);
          const { data, error } = result;
          if (!error && data) return data;
          console.warn("[ChessKidoo DB] Supabase query failed, falling back to local storage:", error);
          markSupabaseFailed();
        } catch (e) {
          console.warn("[ChessKidoo DB] Supabase error, falling back:", e);
          markSupabaseFailed();
        }
      }
      
      const localUsers = getLocal('users');
      return role ? localUsers.filter(u => u.role === role) : localUsers;
    },

    // Fetch a single profile by user ID or custom readable userid string
    async getProfile(id, isCustomUserId = false) {
      if (canUseSupabase()) {
        try {
          const col = isCustomUserId ? 'userid' : 'id';
          const result = await Promise.race([
            window.supabaseClient.from('users').select('*').eq(col, id).maybeSingle(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 3000))
          ]);
          const { data, error } = result;
          if (!error && data) return data;
          console.warn("[ChessKidoo DB] Supabase profile query failed, falling back:", error);
          markSupabaseFailed();
        } catch (e) {
          console.warn("[ChessKidoo DB] Profile query error, falling back:", e);
          markSupabaseFailed();
        }
      }

      const localUsers = getLocal('users');
      const col = isCustomUserId ? 'userid' : 'id';
      return localUsers.find(u => u[col] === id) || null;
    },

    // Save a user profile (Insert/Update)
    async saveProfile(profile) {
      if (!profile.id) profile.id = 'user-' + Date.now();
      if (!profile.userid) profile.userid = Math.floor(100 + Math.random() * 900).toString();

      if (canUseSupabase()) {
        try {
          const { error } = await window.supabaseClient
            .from('users')
            .upsert(profile);
          if (!error) {
            console.log("[ChessKidoo DB] Saved to Supabase successfully.");
          } else {
            console.warn("[ChessKidoo DB] Supabase save failed, saving to local only:", error);
          }
        } catch (e) {
          console.warn("[ChessKidoo DB] Supabase error during save:", e);
        }
      }

      // Always update local storage as a mirror/fallback
      const localUsers = getLocal('users');
      const idx = localUsers.findIndex(u => u.id === profile.id);
      if (idx !== -1) {
        localUsers[idx] = { ...localUsers[idx], ...profile };
      } else {
        localUsers.push(profile);
      }
      setLocal('users', localUsers);
      return profile;
    },

    // Delete a profile
    async deleteProfile(id) {
      if (canUseSupabase()) {
        try {
          const { error } = await window.supabaseClient
            .from('users')
            .delete()
            .eq('id', id);
          if (!error) {
            console.log("[ChessKidoo DB] Deleted from Supabase successfully.");
          } else {
            console.warn("[ChessKidoo DB] Supabase delete failed:", error);
          }
        } catch (e) {
          console.warn("[ChessKidoo DB] Supabase delete error:", e);
        }
      }

      const localUsers = getLocal('users');
      const filtered = localUsers.filter(u => u.id !== id);
      setLocal('users', filtered);
      return true;
    },


    // --- DOCUMENT OPERATIONS ---

    // Fetch documents
    async getDocuments(level = null) {
      if (canUseSupabase()) {
        try {
          let query = window.supabaseClient.from('document').select('*').order('created_at', { ascending: false });
          if (level) query = query.eq('level', level);
          const { data, error } = await query;
          if (!error && data) return data;
        } catch (e) {
          console.warn("[ChessKidoo DB] Documents query error, falling back:", e);
        }
      }

      const docs = getLocal('document');
      return level ? docs.filter(d => d.level === level) : docs;
    },

    // Save a document record
    async saveDocument(doc) {
      if (!doc.id) doc.id = Date.now();
      if (!doc.created_at) doc.created_at = new Date().toISOString();

      if (canUseSupabase()) {
        try {
          const { error } = await window.supabaseClient.from('document').upsert(doc);
          if (!error) console.log("[ChessKidoo DB] Document saved to Supabase.");
        } catch (e) {
          console.warn("[ChessKidoo DB] Document save error, local only:", e);
        }
      }

      const docs = getLocal('document');
      const idx = docs.findIndex(d => d.id === doc.id);
      if (idx !== -1) docs[idx] = { ...docs[idx], ...doc };
      else docs.push(doc);
      setLocal('document', docs);
      return doc;
    },

    // Delete a document
    async deleteDocument(id) {
      const numId = Number(id) || id;
      if (canUseSupabase()) {
        try {
          const { error } = await window.supabaseClient.from('document').delete().eq('id', numId);
          if (!error) console.log("[ChessKidoo DB] Document deleted from Supabase.");
        } catch (e) {
          console.warn("[ChessKidoo DB] Document delete error, local only:", e);
        }
      }

      const docs = getLocal('document');
      const filtered = docs.filter(d => d.id !== numId && d.id !== id);
      setLocal('document', filtered);
      return true;
    },


    // --- ATTENDANCE OPERATIONS ---

    // Fetch attendance log
    async getAttendance(userid = null, date = null) {
      if (canUseSupabase()) {
        try {
          let query = window.supabaseClient.from('attendance').select('*');
          if (userid) query = query.eq('userid', userid);
          if (date) query = query.eq('date', date);
          const { data, error } = await query;
          if (!error && data) return data;
        } catch (e) {
          console.warn("[ChessKidoo DB] Attendance query error, falling back:", e);
        }
      }

      const att = getLocal('attendance');
      return att.filter(a => {
        const matchUser = userid ? a.userid === userid : true;
        const matchDate = date ? a.date === date : true;
        return matchUser && matchDate;
      });
    },

    // Save attendance (Insert/Update)
    async saveAttendance(log) {
      if (!log.id) log.id = Date.now();
      if (!log.created_at) log.created_at = new Date().toISOString();

      if (canUseSupabase()) {
        try {
          const { error } = await window.supabaseClient.from('attendance').upsert(log);
          if (!error) console.log("[ChessKidoo DB] Attendance saved to Supabase.");
        } catch (e) {
          console.warn("[ChessKidoo DB] Attendance save error, local only:", e);
        }
      }

      const att = getLocal('attendance');
      const idx = att.findIndex(a => a.id === log.id || (a.userid === log.userid && a.date === log.date));
      if (idx !== -1) att[idx] = { ...att[idx], ...log };
      else att.push(log);
      setLocal('attendance', att);
      return log;
    },


    // --- RATINGS OPERATIONS ---

    // Fetch ratings history
    async getRatings(userid) {
      if (canUseSupabase()) {
        try {
          const { data, error } = await window.supabaseClient
            .from('ratings')
            .select('*')
            .eq('user_id', userid)
            .order('date', { ascending: true });
          if (!error && data) return data;
        } catch (e) {
          console.warn("[ChessKidoo DB] Ratings query error, falling back:", e);
        }
      }

      const ratings = getLocal('ratings');
      return ratings
        .filter(r => r.user_id === userid)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    // Save rating log
    async saveRating(ratingLog) {
      if (!ratingLog.id) ratingLog.id = Date.now();
      if (!ratingLog.date) ratingLog.date = new Date().toISOString();

      if (canUseSupabase()) {
        try {
          const { error } = await window.supabaseClient.from('ratings').upsert(ratingLog);
          if (!error) console.log("[ChessKidoo DB] Rating saved to Supabase.");
        } catch (e) {
          console.warn("[ChessKidoo DB] Rating save error, local only:", e);
        }
      }

      const ratings = getLocal('ratings');
      ratings.push(ratingLog);
      setLocal('ratings', ratings);
      return ratingLog;
    },


    // --- TOURNAMENT RATINGS OPERATIONS ---

    // Fetch tournament history
    async getTourRatings(userid) {
      if (canUseSupabase()) {
        try {
          const { data, error } = await window.supabaseClient
            .from('tourRatings')
            .select('*')
            .eq('user_id', userid);
          if (!error && data) return data;
        } catch (e) {
          console.warn("[ChessKidoo DB] TourRatings query error, falling back:", e);
        }
      }

      const tours = getLocal('tourRatings');
      return tours.filter(t => t.user_id === userid);
    },

    // Save tournament rating log
    async saveTourRating(tourLog) {
      if (!tourLog.id) tourLog.id = Date.now();

      if (canUseSupabase()) {
        try {
          const { error } = await window.supabaseClient.from('tourRatings').upsert(tourLog);
          if (!error) console.log("[ChessKidoo DB] TourRating saved to Supabase.");
        } catch (e) {
          console.warn("[ChessKidoo DB] TourRating save error, local only:", e);
        }
      }

      const tours = getLocal('tourRatings');
      tours.push(tourLog);
      setLocal('tourRatings', tours);
      return tourLog;
    }
  };

})();
