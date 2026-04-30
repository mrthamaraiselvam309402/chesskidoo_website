/* assets/js/config.js -------------------------------------------------------
   ChessKidoo — Runtime Configuration
   
   SECURITY NOTE:
   The Supabase ANON KEY is intentionally public — it is designed for
   client-side use and is restricted by Row Level Security (RLS) policies
   in Supabase. It cannot access data beyond what RLS permits.
   
   Never commit SERVICE_ROLE keys or private secrets here.
   --------------------------------------------------------------- */

window.APP_CONFIG = {
  SUPABASE_URL:     "https://hcjuyqicftkgpiyrkscr.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjanV5cWljZnRrZ3BpeXJrc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTE4NTIsImV4cCI6MjA5MzEyNzg1Mn0.utVxS7jX2GH9mIVbKquuQFCyH99nUmP_geWI8hhWJP4",

  // Admin UUID from Supabase Auth (set after creating the admin user)
  ADMIN_UUID:       "a007b0b0-9b30-478f-a147-1af18dff20ce",

  // EmailJS (public keys — safe for client-side)
  EMAILJS_SERVICE:  "service_7mn07q9",
  EMAILJS_TEMPLATE: "template_3lumv9c",
  EMAILJS_KEY:      "1EuHvvzi2H9RnaBF6"
};

// Initialize Supabase Client
(function initSupabase() {
  if (!window.supabase) {
    console.error("[ChessKidoo] Supabase SDK not loaded. Check CDN import.");
    return;
  }
  try {
    window.supabaseClient = window.supabase.createClient(
      window.APP_CONFIG.SUPABASE_URL,
      window.APP_CONFIG.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      }
    );
    console.log("[ChessKidoo] Supabase connected ✓");
  } catch (e) {
    console.error("[ChessKidoo] Supabase init failed:", e);
  }
})();
