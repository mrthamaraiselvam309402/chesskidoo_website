const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type'
};

let assignments = [];
let submissions = [];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const action = url.searchParams.get('action');
  const view = url.searchParams.get('view');

  if (request.method === 'GET') {
    if (view === 'submissions') {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '500')));
      const offset = (page - 1) * limit;
      const sorted = [...submissions].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
      const paginated = sorted.slice(offset, offset + limit);
      return jsonResponse({ data: paginated, total: submissions.length, page, limit });
    }

    if (id) {
      const assignment = assignments.find(a => String(a.id) === String(id));
      if (!assignment) return jsonResponse({ error: 'Not found' }, 404);
      return jsonResponse(assignment);
    }

    return jsonResponse({ data: assignments, total: assignments.length });
  }

  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    if (action === 'submit') {
      const studentId = body.student_id || url.searchParams.get('student_id');
      const assignmentId = body.assignment_id || url.searchParams.get('assignment_id');
      if (!studentId || !assignmentId) {
        return jsonResponse({ error: 'Student ID and Assignment ID are required' }, 400);
      }

      const existing = submissions.find(s => String(s.assignment_id) === String(assignmentId) && String(s.student_id) === String(studentId));
      const revisionCount = existing ? (existing.revision_count || 0) + 1 : 0;

      const submission = {
        id: existing?.id || `sub-${Date.now()}`,
        assignment_id: String(assignmentId),
        student_id: String(studentId),
        submission_text: body.submission_text || '',
        submission_url: body.submission_url || '',
        file_urls: body.file_urls || [],
        status: 'submitted',
        revision_count: revisionCount,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const idx = submissions.findIndex(s => String(s.id) === String(existing.id));
        if (idx >= 0) submissions[idx] = submission;
      } else {
        submissions.push(submission);
      }

      return jsonResponse({ data: submission, success: true }, 201);
    }

    const title = String(body.title || '').trim();
    if (!title) return jsonResponse({ error: 'Title is required' }, 400);

    const assignment = {
      id: body.id || `hw-${Date.now()}`,
      title,
      description: String(body.description || '').trim(),
      due_date: body.due_date || null,
      status: body.status || 'active',
      target_type: body.target_type || 'all',
      student_id: body.student_id || null,
      batch_id: body.batch_id || null,
      questions_files: body.questions_files || body.attachment_urls || [],
      attachment_urls: body.attachment_urls || body.questions_files || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    assignments.push(assignment);
    return jsonResponse({ data: assignment, success: true }, 201);
  }

  if (request.method === 'PUT' || request.method === 'PATCH') {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    if (action === 'review') {
      if (!id) return jsonResponse({ error: 'Submission ID is required for review' }, 400);
      const idx = submissions.findIndex(s => String(s.id) === String(id));
      if (idx < 0) return jsonResponse({ error: 'Submission not found' }, 404);

      submissions[idx] = {
        ...submissions[idx],
        status: body.status || submissions[idx].status,
        feedback: body.feedback || submissions[idx].feedback || '',
        score: body.score !== undefined && body.score !== '' ? Number(body.score) : submissions[idx].score,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return jsonResponse({ data: submissions[idx], success: true });
    }

    if (id) {
      const idx = assignments.findIndex(a => String(a.id) === String(id));
      if (idx < 0) return jsonResponse({ error: 'Assignment not found' }, 404);

      assignments[idx] = {
        ...assignments[idx],
        ...(body.title !== undefined ? { title: String(body.title || '').trim() } : {}),
        ...(body.description !== undefined ? { description: String(body.description || '').trim() } : {}),
        ...(body.due_date !== undefined ? { due_date: body.due_date || null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        updated_at: new Date().toISOString()
      };

      return jsonResponse({ data: assignments[idx], success: true });
    }

    if (Array.isArray(body.ids)) {
      const updateFields = {
        ...(body.status !== undefined ? { status: body.status } : {}),
        updated_at: new Date().toISOString()
      };

      assignments.forEach(a => {
        if (body.ids.includes(String(a.id))) {
          Object.assign(a, updateFields);
        }
      });

      return jsonResponse({ data: assignments.filter(a => body.ids.includes(String(a.id))), success: true });
    }

    return jsonResponse({ error: 'ID or ids required' }, 400);
  }

  if (request.method === 'DELETE') {
    if (!id) return jsonResponse({ error: 'ID required' }, 400);

    if (action === 'submission') {
      submissions = submissions.filter(s => String(s.id) !== String(id));
      return jsonResponse({ success: true });
    }

    assignments = assignments.filter(a => String(a.id) !== String(id));
    submissions = submissions.filter(s => String(s.assignment_id) !== String(id));
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
