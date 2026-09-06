// Single file handling ALL /api/* routes for the ops checklist.
// - GET  /api/jobs           -> list of job ids
// - POST /api/jobs           -> save list of job ids   { ids: [...] }
// - GET  /api/job/<id>       -> one job's data
// - POST /api/job/<id>       -> save one job's data
// - DELETE /api/job/<id>     -> delete one job

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'content-type': 'application/json' }
  });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const segments = params.path || []; // e.g. ["jobs"] or ["job", "33-beechwood"]
  const method = request.method;
  const kv = env.CHECKLIST_KV;

  // ---- /api/jobs ----
  if (segments.length === 1 && segments[0] === 'jobs') {
    if (method === 'GET') {
      const idx = await kv.get('jobs-index');
      return new Response(idx || '[]', { headers: { 'content-type': 'application/json' } });
    }
    if (method === 'POST') {
      const body = await request.json();
      if (!body || !Array.isArray(body.ids)) {
        return json({ error: 'expected { ids: [] }' }, 400);
      }
      await kv.put('jobs-index', JSON.stringify(body.ids));
      return json({ ok: true });
    }
    return json({ error: 'method not allowed' }, 405);
  }

  // ---- /api/job/<id> ----
  if (segments.length === 2 && segments[0] === 'job') {
    const id = segments[1];

    if (method === 'GET') {
      const data = await kv.get('job:' + id);
      return new Response(data || 'null', { headers: { 'content-type': 'application/json' } });
    }
    if (method === 'POST') {
      const body = await request.text();
      try {
        JSON.parse(body);
      } catch (e) {
        return json({ error: 'invalid json' }, 400);
      }
      await kv.put('job:' + id, body);
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      await kv.delete('job:' + id);
      return json({ ok: true });
    }
    return json({ error: 'method not allowed' }, 405);
  }

  return json({ error: 'not found' }, 404);
}
