export async function onRequestGet(context) {
  const id = context.params.id;
  const data = await context.env.CHECKLIST_KV.get('job:' + id);
  return new Response(data || 'null', { headers: { 'content-type': 'application/json' } });
}

export async function onRequestPost(context) {
  const id = context.params.id;
  const body = await context.request.text();
  try {
    JSON.parse(body);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 });
  }
  await context.env.CHECKLIST_KV.put('job:' + id, body);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
}
