/* assets/js/config.js -------------------------------------------------------
   Project Configuration and API Keys (Sync with .env from ChessKiddo)
   --------------------------------------------------------------- */

window.APP_CONFIG = {
  SUPABASE_URL: "https://xttxauuiucmoqedkxdoa.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dHhhdXVpdWNtb3FlZGt4ZG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MTc0MjMsImV4cCI6MjA3MDI5MzQyM30.XwPDIyuqFnxb4RFnbiBFx06HrVhaRuYm3qG1IIvPbrY",
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
