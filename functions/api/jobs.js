export async function onRequestGet(context) {
  const idx = await context.env.CHECKLIST_KV.get('jobs-index');
  return new Response(idx || '[]', { headers: { 'content-type': 'application/json' } });
}

export async function onRequestPost(context) {
  const body = await context.request.json();
  if (!body || !Array.isArray(body.ids)) {
    return new Response(JSON.stringify({ error: 'expected { ids: [] }' }), { status: 400 });
  }
  await context.env.CHECKLIST_KV.put('jobs-index', JSON.stringify(body.ids));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
}
