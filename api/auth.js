import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

async function handlePost(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const action = String(body.action || '').trim();
  const username = String(body.username || '').trim();
  const password = String(body.password || '').trim();

  if (action !== 'login' || !username || !password) {
    return new Response(JSON.stringify({ error: 'Missing action, username, or password' }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vseombfkrvpffnpgbsnk.supabase.co';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_DADHCm1eB-nASpQfSi5zvA_2rMZxCJT';

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const email = username.includes('@') ? username : `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;

  let sbJwt = null;
  let sbUser = null;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    sbUser = data.user;
    if (data.session?.access_token) {
      sbJwt = data.session.access_token;
    }
    if (error || !sbUser) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
        status: 401,
        headers: corsHeaders
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'Authentication service error' }), {
      status: 500,
      headers: corsHeaders
    });
  }

  const role = String(sbUser.user_metadata?.role || 'authenticated').trim().toLowerCase();

  return new Response(JSON.stringify({
    success: true,
    role: role,
    user: sbUser.email || username,
    student_id: sbUser.user_metadata?.student_id || null,
    coach_id: sbUser.user_metadata?.coach_id || null,
    token: sbJwt
  }), {
    status: 200,
    headers: corsHeaders
  });
}

function handleOptions() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export const POST = handlePost;
export const OPTIONS = handleOptions;
