const url = "https://hcjuyqicftkgpiyrkscr.supabase.co/rest/v1/users";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjanV5cWljZnRrZ3BpeXJrc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTE4NTIsImV4cCI6MjA5MzEyNzg1Mn0.utVxS7jX2GH9mIVbKquuQFCyH99nUmP_geWI8hhWJP4";

async function run() {
  try {
    const res = await fetch(url + "?select=*", {
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key
      }
    });
    const data = await res.json();
    console.log("Users:", data);
  } catch(e) {
    console.error(e);
  }
}
run();
