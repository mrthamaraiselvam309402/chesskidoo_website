/* assets/js/config.js -------------------------------------------------------
   Project Configuration and API Keys (Sync with .env from ChessKiddo)
   --------------------------------------------------------------- */

window.APP_CONFIG = {
  SUPABASE_URL: "https://hcjuyqicftkgpiyrkscr.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjanV5cWljZnRrZ3BpeXJrc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTE4NTIsImV4cCI6MjA5MzEyNzg1Mn0.utVxS7jX2GH9mIVbKquuQFCyH99nUmP_geWI8hhWJP4",
  GEMINI_API_KEY: "AIzaSyCx1_4f2pU37Di_OUNaN9Mj1v2peNsOu2s",
  ADMIN_ID: "a007b0b0-9b30-478f-a147-1af18dff20ce",
  SERVICE_ID: "service_7mn07q9",
  TEMPLATE_ID: "template_3lumv9c",
  PUBLIC_KEY: "1EuHvvzi2H9RnaBF6"
};

// Initialize Supabase Client
if (window.supabase) {
  window.supabaseClient = window.supabase.createClient(
    window.APP_CONFIG.SUPABASE_URL,
    window.APP_CONFIG.SUPABASE_ANON_KEY
  );
}
