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
        id: "student-uuid-emma",
        email: "student@gmail.com",
        full_name: "Emma Wilson",
        role: "student",
        phone_number: "+91 90258 46663",
        level: "Intermediate",
        rating: 800,
        userid: "101",
        coach: "Sarah Chess",
        batch: "Evening",
        session: "Group",
        schedule: "17:00",
        fee: "5000",
        status: "Paid",
        due_date: "14-May-2026",
        join_date: "2026-01-10",
        age: 10,
        grade: "5th Grade",
        city: "Chennai",
        puzzle: 45,
        game: 28,
        star: 4,
        photo: "",
        certificate: "certificates/emma_wilson_lvl1.pdf"
      },
      { id: "s1", full_name: "AADHAVAN - SINGAPORE", role: "student", status: "Paid", level: "Beginner", rating: 850, coach: "ARIVUSELVAM", join_date: "2026-04-20", session: "Group", schedule: "17:00", fee: "2200", due_date: "04-May-2026" },
      { id: "s2", full_name: "AARA V", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "GYANASURYA", join_date: "2026-04-24", session: "Group", schedule: "WEEKEND", fee: "1800", due_date: "14-May-2026" },
      { id: "s3", full_name: "ANFAL", role: "student", status: "Paid", level: "Intermediate", rating: 800, coach: "VISHNU", join_date: "2026-04-24", session: "Group", schedule: "FRI& SAT", fee: "3300", due_date: "20-May-2026" },
      { id: "s4", full_name: "ANUSHYA", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "ARIVUSELVAM", join_date: "2026-04-23", session: "Group", schedule: "17:00", fee: "1800", due_date: "18-May-2026" },
      { id: "s5", full_name: "ANYUSH", role: "student", status: "Pending", level: "Intermediate", rating: 800, coach: "GYANASURYA", join_date: "2026-04-23", session: "Group", schedule: "17:00", fee: "1000", due_date: "18-May-2026" },
      { id: "s6", full_name: "ARUNYA", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "HARIS", join_date: "2026-04-24", session: "Group", schedule: "Weekend", fee: "2400", due_date: "24-May-2026" },
      { id: "s7", full_name: "ATHIVIK", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "YOGESH", join_date: "2026-04-24", session: "Group", schedule: "WEEKEND - SUNDAY&MONDAY", fee: "2500", due_date: "12-May-2026" },
      { id: "s8", full_name: "ATISH VIDUN", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "ARIVUSELVAM", join_date: "2026-04-24", session: "Group", schedule: "WEEKEND", fee: "3200", due_date: "04-May-2026" },
      { id: "s9", full_name: "BALAJI GANESH", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "GYANASURYA", join_date: "2026-02-21", session: "Group", schedule: "WEEKDAY", fee: "5200", due_date: "05-May-2026" },
      { id: "s10", full_name: "Faithma", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "YOGESH", join_date: "2026-04-14", session: "Group", schedule: "17:00", fee: "1200", due_date: "14-May-2026" },
      { id: "s11", full_name: "JAYARAJ", role: "student", status: "Pending", level: "Beginner", rating: 1000, coach: "VISHNU", join_date: "2026-03-07", session: "Group", schedule: "Fri & Sat", fee: "2500", due_date: "20-May-2026" },
      { id: "s12", full_name: "JEEVAN BASIC", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "ROHITH SELVARAJ", join_date: "2026-03-15", session: "Group", schedule: "17:00", fee: "3700", due_date: "25-May-2026" },
      { id: "s13", full_name: "Krishnaveni PARENT waiting list", role: "student", status: "Waiting List", level: "Beginner", rating: 800, coach: "SUDHIN", join_date: "2026-05-07", session: "Evening", schedule: "17:00", fee: "—", due_date: "—" },
      { id: "s14", full_name: "KRISNA", role: "student", status: "Pending", level: "Intermediate", rating: 800, coach: "VISHNU", join_date: "2026-04-24", session: "Group", schedule: "MORNING & EVENING", fee: "700", due_date: "20-May-2026" },
      { id: "s15", full_name: "MAGATHI", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "HARIS", join_date: "2026-04-08", session: "Group", schedule: "MORNING & EVENING", fee: "2200", due_date: "08-May-2026" },
      { id: "s16", full_name: "MEGAHA", role: "student", status: "Waiting List", level: "Beginner", rating: 800, coach: "SUDHIN", join_date: "2026-05-13", session: "Group", schedule: "17:00", fee: "—", due_date: "—" },
      { id: "s17", full_name: "MOHAMMED ATIFK", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "SUDHIN", join_date: "2026-04-20", session: "Group", schedule: "17:00", fee: "1700", due_date: "18-May-2026" },
      { id: "s18", full_name: "MOHAMMED RAYAN", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "YOGESH", join_date: "2026-04-13", session: "Group", schedule: "Weekend", fee: "1800", due_date: "18-May-2026" },
      { id: "s19", full_name: "MUKILAN", role: "student", status: "Paid", level: "Intermediate", rating: 800, coach: "VISHNU", join_date: "2026-04-24", session: "Group", schedule: "FRI& SAT", fee: "4000", due_date: "04-May-2026" },
      { id: "s20", full_name: "NATARAJAN PARENT waiting list", role: "student", status: "Waiting List", level: "Beginner", rating: 800, coach: "SUDHIN", join_date: "2026-05-07", session: "Evening", schedule: "17:00", fee: "—", due_date: "—" },
      { id: "s21", full_name: "NIGUNAN", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "GYANASURYA", join_date: "2026-04-10", session: "Group", schedule: "WEEKDAY", fee: "2400", due_date: "09-May-2026" },
      { id: "s22", full_name: "POONTHALIR", role: "student", status: "Pending", level: "Beginner", rating: 1000, coach: "VISHNU", join_date: "2026-03-22", session: "Group", schedule: "17:00", fee: "900", due_date: "20-May-2026" },
      { id: "s23", full_name: "PRANISH P", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "SUDHIN", join_date: "2026-04-27", session: "Group", schedule: "17:00", fee: "1500", due_date: "18-May-2026" },
      { id: "s24", full_name: "PRNAVAV", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "HARIS", join_date: "2026-04-08", session: "Group", schedule: "WEEKEND", fee: "2200", due_date: "10-May-2026" },
      { id: "s25", full_name: "RAKISTHA", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "GYANASURYA", join_date: "2026-04-24", session: "Group", schedule: "WEEKEND", fee: "800", due_date: "20-May-2026" },
      { id: "s26", full_name: "RIYAS", role: "student", status: "Pending", level: "Beginner", rating: 1400, coach: "RANJITH", join_date: "2026-03-15", session: "Group", schedule: "Weekend", fee: "1600", due_date: "15-May-2026" },
      { id: "s27", full_name: "SACHIN", role: "student", status: "Paid", level: "Advanced", rating: 800, coach: "ARIVUSELVAM", join_date: "2026-04-24", session: "Group", schedule: "WEEKEND", fee: "3000", due_date: "04-May-2026" },
      { id: "s28", full_name: "SAI", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "YOGESH", join_date: "2026-05-07", session: "Evening", schedule: "17:00", fee: "1600", due_date: "07-May-2026" },
      { id: "s29", full_name: "SAKTHI", role: "student", status: "Due", level: "Beginner", rating: 799, coach: "RANJITH", join_date: "2026-04-15", session: "Group", schedule: "17:00", fee: "3500", due_date: "13-May-2026" },
      { id: "s30", full_name: "SAKTHULA", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "SUDHIN", join_date: "2026-04-15", session: "Group", schedule: "Weekend", fee: "1700", due_date: "18-May-2026" },
      { id: "s31", full_name: "SATHYA", role: "student", status: "Due", level: "Beginner", rating: 800, coach: "RANJITH", join_date: "2026-04-14", session: "Group", schedule: "17:00", fee: "3500", due_date: "13-May-2026" },
      { id: "s32", full_name: "Shamima", role: "student", status: "Due", level: "Beginner", rating: 800, coach: "SUDHIN", join_date: "2026-05-07", session: "Evening", schedule: "17:00", fee: "1500", due_date: "07-May-2026" },
      { id: "s33", full_name: "SHERVIN", role: "student", status: "Pending", level: "Beginner", rating: 800, coach: "GYANASURYA", join_date: "2026-03-13", session: "Group", schedule: "WEEKEND", fee: "1800", due_date: "24-May-2026" },
      { id: "s34", full_name: "SREELAXMI", role: "student", status: "Paid", level: "Beginner", rating: 800, coach: "ROHITH SELVARAJ", join_date: "2026-04-24", session: "Group", schedule: "MORNING & EVENING", fee: "5000", due_date: "09-May-2026" },
      { id: "s35", full_name: "SUDARSAN", role: "student", status: "Due", level: "Beginner", rating: 1400, coach: "RANJITH", join_date: "2026-03-15", session: "Group", schedule: "17:00", fee: "1400", due_date: "01-May-2026" },
      { id: "s36", full_name: "SUSIN", role: "student", status: "Paid", level: "Advanced", rating: 800, coach: "RANJITH", join_date: "2026-04-08", session: "Group", schedule: "WEEKEND", fee: "1800", due_date: "08-May-2026" },
      { id: "s37", full_name: "UTTASAN", role: "student", status: "Paid", level: "Advanced", rating: 800, coach: "ARIVUSELVAM", join_date: "2026-04-24", session: "Group", schedule: "WEEKEND", fee: "3000", due_date: "04-May-2026" },
      { id: "s38", full_name: "VARUN", role: "student", status: "Pending", level: "Beginner", rating: 1400, coach: "RANJITH", join_date: "2026-03-15", session: "Group", schedule: "Weekend", fee: "1600", due_date: "15-May-2026" },
      { id: "s39", full_name: "VELAVA", role: "student", status: "Pending", level: "Intermediate", rating: 800, coach: "VISHNU", join_date: "2026-04-24", session: "Group", schedule: "FRI& SAT", fee: "1800", due_date: "20-May-2026" },

      // Coaches
      { id: "coach-uuid-1", email: "coach@gmail.com", full_name: "Sarah Chess", role: "coach", userid: "C0", phone_number: "+91 90258 46663", level: "Advanced", batches: "Evening, Weekend", timetable: "Mon-Fri 4PM-7PM", revenue: "₹32,000", classes: 24, star: 5, puzzle: "Opening Specialist" },
      { id: "c1", full_name: "ARIVUSELVAM", email: "arivuselvam@gmail.com", role: "coach", phone_number: "+91 98400 11223", level: "Advanced", batches: "Group 17:00, WEEKEND", timetable: "Mon-Thu 5PM, Sat 10AM", revenue: "₹18,400", classes: 18, star: 5, puzzle: "Endgames Specialist" },
      { id: "c2", full_name: "GYANASURYA", email: "gyanasurya@gmail.com", role: "coach", phone_number: "+91 98400 22334", level: "Intermediate", batches: "WEEKDAY, WEEKEND", timetable: "Tue-Fri 6PM, Sun 4PM", revenue: "₹15,000", classes: 22, star: 4, puzzle: "Tactics Specialist" },
      { id: "c3", full_name: "VISHNU", email: "vishnu@gmail.com", role: "coach", phone_number: "+91 98400 33445", level: "Advanced", batches: "FRI& SAT, Fri & Sat", timetable: "Fri-Sat 4PM-8PM", revenue: "₹24,500", classes: 20, star: 5, puzzle: "Calculation Expert" },
      { id: "c4", full_name: "HARIS", email: "haris@gmail.com", role: "coach", phone_number: "+91 98400 44556", level: "Beginner", batches: "Weekend, MORNING & EVENING", timetable: "Sat-Sun 9AM & 5PM", revenue: "₹11,200", classes: 16, star: 4, puzzle: "Junior Trainer" },
      { id: "c5", full_name: "YOGESH", email: "yogesh@gmail.com", role: "coach", phone_number: "+91 98400 55667", level: "Beginner", batches: "WEEKEND - SUNDAY&MONDAY, Evening", timetable: "Sun-Mon 5PM", revenue: "₹12,800", classes: 19, star: 4, puzzle: "Fundamentals Coach" },
      { id: "c6", full_name: "SUDHIN", email: "sudhin@gmail.com", role: "coach", phone_number: "+91 98400 66778", level: "Beginner", batches: "Evening 17:00, Group", timetable: "Mon-Wed 5PM", revenue: "₹9,600", classes: 14, star: 4, puzzle: "Pawn Structures" },
      { id: "c7", full_name: "RANJITH", email: "ranjith@gmail.com", role: "coach", phone_number: "+91 98400 77889", level: "Advanced", batches: "Weekend, Group 17:00", timetable: "Thu-Sun 5PM", revenue: "₹21,000", classes: 25, star: 5, puzzle: "Positional Master" },
      { id: "c8", full_name: "ROHITH SELVARAJ", email: "rohith@gmail.com", role: "coach", phone_number: "+91 98400 88990", level: "Beginner", batches: "Group 17:00, MORNING & EVENING", timetable: "Mon-Fri 5PM", revenue: "₹13,700", classes: 21, star: 4, puzzle: "Tactical Trainer" }
    ],

    expenses: [
      { id: 1, date: "14 May 2026", category: "Coach Salary", description: "monthly salary", amount: "₹19,600", mode: "UPI", bill: "—" },
      { id: 2, date: "11 May 2026", category: "Platform & Software", description: "Claudes subscription", amount: "₹2,600", mode: "Card", bill: "—" }
    ],

    document: [
      { id: 1, created_at: "2026-05-01T12:00:00Z", file_name: "beginner/chess_basics.pdf", name: "Chess Fundamentals & Piece Movements", level: "Beginner", coach: "Michael Knight", batch: "2" },
      { id: 2, created_at: "2026-05-03T10:00:00Z", file_name: "intermediate/tactics_pins.pdf", name: "Tactical Patterns - Pins & Forks", level: "Intermediate", coach: "Sarah Chess", batch: "1" },
      { id: 3, created_at: "2026-05-05T15:00:00Z", file_name: "advanced/endgames_rook.pdf", name: "Advanced Endgames: Rook vs Pawn", level: "Advanced", coach: "Sarah Chess", batch: "1" }
    ],
    
    resources: [
      { id: 'R1', name: 'Mating_Puzzles.pdf', batch: 1, type: 'Homework', notes: 'Review before Friday' },
      { id: 'R2', name: 'Endgame_Basics.pdf', batch: 2, type: 'Homework', notes: 'Read chapter 1' },
      { id: 'R3', name: 'Opening_Principles.pdf', batch: 1, type: 'Class Notes', notes: 'Memorize lines' },
      { id: 'R4', name: 'Tactics_Test.pdf', batch: 3, type: 'Homework', notes: 'Complete by Sunday' }
    ],

    attendance: [
      { id: 1, userid: "student-uuid-emma", date: "2026-05-01", status: "present" },
      { id: 2, userid: "student-uuid-emma", date: "2026-05-02", status: "present" },
      { id: 3, userid: "student-uuid-emma", date: "2026-05-04", status: "present" },
      { id: 4, userid: "student-uuid-emma", date: "2026-05-05", status: "absent" },
      { id: 5, userid: "student-uuid-emma", date: "2026-05-06", status: "present" },
      { id: 6, userid: "student-uuid-emma", date: "2026-05-08", status: "present" }
    ],

    ratings: [
      { id: 1, user_id: "101", online: 800, international: 0, date: "2026-01-10T00:00:00Z" },
      { id: 2, user_id: "101", online: 850, international: 0, date: "2026-02-10T00:00:00Z" },
      { id: 3, user_id: "101", online: 920, international: 1000, date: "2026-03-10T00:00:00Z" },
      { id: 4, user_id: "101", online: 1050, international: 1050, date: "2026-04-10T00:00:00Z" },
      { id: 5, user_id: "101", online: 1100, international: 1080, date: "2026-05-01T00:00:00Z" },
      { id: 6, user_id: "101", online: 1120, international: 1100, date: "2026-05-08T00:00:00Z" }
    ],

    tourRatings: [
      { id: 1, user_id: "101", name: "Chennai District Under-10", result: "3rd Place (4/5 pts)", change: "+45" },
      { id: 2, user_id: "101", name: "ChessKidoo Academy Monthly Rapid", result: "1st Place (5/5 pts)", change: "+30" }
    ]
  };

  // Helper: Initialize localStorage if empty
  const initLocalStore = () => {
    Object.keys(DEFAULT_DB).forEach(key => {
      const storeKey = `ck_db_${key}`;
      if (!localStorage.getItem(storeKey) || key === 'users' || key === 'expenses') {
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

    // --- EXPENDITURE OPERATIONS ---
    async getExpenses() {
      return getLocal('expenses') || [];
    },
    async saveExpense(expense) {
      if (!expense.id) expense.id = Date.now();
      const list = getLocal('expenses') || [];
      const idx = list.findIndex(e => e.id === expense.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...expense };
      else list.unshift(expense);
      setLocal('expenses', list);
      return expense;
    },
    async deleteExpense(id) {
      const list = getLocal('expenses') || [];
      setLocal('expenses', list.filter(e => e.id !== id));
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
