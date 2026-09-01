/**
 * Attendance API - Vercel Serverless Function
 * Uses Supabase client directly for database operations
 */

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase configuration');
  }
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = await getSupabaseClient();
    const url = new URL(request.url);
    const method = request.method;
    const date = url.searchParams.get('date');
    const studentId = url.searchParams.get('student_id');
    const id = url.searchParams.get('id');

    // GET - List attendance records
    if (method === 'GET') {
      let query = supabase.from('attendance').select('*').order('date', { ascending: false });
      if (date) query = query.eq('date', date);
      if (studentId) query = query.eq('student_id', studentId);
      if (id) query = query.eq('id', id);

      const { data, error } = await query;
      if (error) {
        console.warn('[Attendance] GET error:', error.message);
        return jsonResponse({ data: [], total: 0 });
      }

      return jsonResponse({ data: data || [], total: (data || []).length });
    }

    // POST - Create attendance records
    if (method === 'POST') {
      let body = [];
      try { body = await request.json(); } catch (_e) {}

      const records = Array.isArray(body) ? body : [body];
      const validRecords = records.map(r => ({
        id: r.id || crypto.randomUUID(),
        student_id: String(r.student_id || ''),
        date: String(r.date || new Date().toISOString().split('T')[0]),
        status: String(r.status || 'Present'),
        notes: String(r.notes || ''),
        created_at: String(r.created_at || new Date().toISOString())
      })).filter(r => r.student_id && r.date && r.status);

      if (validRecords.length === 0) {
        return jsonResponse({ error: 'No valid attendance records provided. Required fields: student_id, date, status' }, 400);
      }

      // Try insert first (upsert may fail without proper unique constraint)
      try {
        const { data: inserted, error: insertError } = await supabase.from('attendance').insert(validRecords).select();
        if (!insertError && inserted) {
          return jsonResponse({ success: true, count: inserted.length, data: inserted });
        }
        // If insert fails, try upsert
        const { data: upserted, error: upsertError } = await supabase.from('attendance').upsert(validRecords, { onConflict: 'student_id,date' }).select();
        if (upsertError) throw upsertError;
        return jsonResponse({ success: true, count: upserted.length, data: upserted });
      } catch (dbError) {
        console.error('[Attendance] Database error:', dbError.message);
        return jsonResponse({ error: 'Failed to save attendance: ' + dbError.message }, 500);
      }
    }

    // PUT/PATCH - Update attendance record
    if (method === 'PUT' || method === 'PATCH') {
      let body = {};
      try { body = await request.json(); } catch (_e) {}

      const updateData = { updated_at: new Date().toISOString() };
      if (body.status !== undefined) updateData.status = String(body.status);
      if (body.notes !== undefined) updateData.notes = String(body.notes || '');

      let query = supabase.from('attendance').update(updateData);
      if (id) {
        query = query.eq('id', id);
      } else if (studentId) {
        query = query.eq('student_id', studentId);
        if (date) query = query.eq('date', date);
      } else {
        return jsonResponse({ error: 'ID or student_id required' }, 400);
      }

      const { data, error } = await query.select();
      if (error) throw error;
      return jsonResponse({ success: true, data: data || [] });
    }

    // DELETE - Delete attendance record
    if (method === 'DELETE') {
      let query = supabase.from('attendance').delete();
      if (id) {
        query = query.eq('id', id);
      } else if (studentId) {
        query = query.eq('student_id', studentId);
        if (date) query = query.eq('date', date);
      } else {
        return jsonResponse({ error: 'ID or student_id required' }, 400);
      }

      const { error } = await query;
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('[Attendance] Error:', error);
    return jsonResponse({ error: error.message || 'Internal server error' }, 500);
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
