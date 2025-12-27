export default {
  async fetch(request, env) {
    await (async function ensureSchema() {
      env.DB.prepare('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, email TEXT UNIQUE, password_hash TEXT, created_at TEXT)').run();
      env.DB.prepare('CREATE TABLE IF NOT EXISTS tokens (token TEXT PRIMARY KEY, user_id TEXT, created_at TEXT, expires_at TEXT)').run();
      env.DB.prepare('CREATE TABLE IF NOT EXISTS attendance_records (id TEXT PRIMARY KEY, user_id TEXT, record_date TEXT, employee_name TEXT, employee_count INTEGER, site_name TEXT, room_type TEXT, room_number TEXT, parking_fee REAL, highway_fee REAL, created_at TEXT)').run();
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_records_user ON attendance_records(user_id)').run();
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_records_date ON attendance_records(record_date)').run();
    })();
    const url = new URL(request.url);
    const m = request.method;
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' };
    if (m === 'OPTIONS') return new Response('', { headers });
    async function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }
    async function body() { try { return await request.json(); } catch { return {}; } }
    function authUserId() { const a = request.headers.get('Authorization'); if (!a || !a.startsWith('Bearer ')) return null; const t = a.slice(7); const row = env.DB.prepare('SELECT user_id FROM tokens WHERE token = ? AND expires_at > CURRENT_TIMESTAMP').bind(t).first(); return row ? row.user_id : null; }
    function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; const v = c==='x'?r:(r&0x3|0x8); return v.toString(16); }); }
    async function hashPassword(p) { const e = new TextEncoder().encode(p); const b = await crypto.subtle.digest('SHA-256', e); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join(''); }

    if (url.pathname === '/api/register' && m === 'POST') {
      const { username, email, password } = await body();
      if (!username || !email || !password) return json({ error: 'invalid_input' }, 400);
      const exists = env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (exists) return json({ error: 'email_exists' }, 409);
      const id = uuid();
      const hash = await hashPassword(password);
      env.DB.prepare('INSERT INTO users (id, username, email, password_hash, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)').bind(id, username, email, hash).run();
      return json({ id, username, email });
    }

    if (url.pathname === '/api/login' && m === 'POST') {
      const { usernameOrEmail, password } = await body();
      if (!usernameOrEmail || !password) return json({ error: 'invalid_input' }, 400);
      const hash = await hashPassword(password);
      const row = env.DB.prepare('SELECT id, username, email FROM users WHERE (email = ? OR username = ?) AND password_hash = ?').bind(usernameOrEmail, usernameOrEmail, hash).first();
      if (!row) return json({ error: 'invalid_credentials' }, 401);
      const token = crypto.getRandomValues(new Uint8Array(24)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
      env.DB.prepare('INSERT INTO tokens (token, user_id, created_at, expires_at) VALUES (?, ?, CURRENT_TIMESTAMP, DATETIME(CURRENT_TIMESTAMP, "+7 days"))').bind(token, row.id).run();
      return json({ token, user: row });
    }

    if (url.pathname === '/api/records' && m === 'GET') {
      const uid = authUserId();
      if (!uid) return json({ error: 'unauthorized' }, 401);
      const month = url.searchParams.get('month');
      let stmt = 'SELECT * FROM attendance_records WHERE user_id = ?';
      const binds = [uid];
      if (month) { stmt += ' AND substr(record_date, 1, 7) = ?'; binds.push(month); }
      const list = env.DB.prepare(stmt).bind(...binds).all().results || [];
      return json(list);
    }

    if (url.pathname === '/api/records' && m === 'POST') {
      const uid = authUserId();
      if (!uid) return json({ error: 'unauthorized' }, 401);
      const b = await body();
      const id = uuid();
      env.DB.prepare('INSERT INTO attendance_records (id, user_id, record_date, employee_name, employee_count, site_name, room_type, room_number, parking_fee, highway_fee, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
        .bind(id, uid, b.record_date, b.employee_name, b.employee_count, b.site_name, b.room_type || '', b.room_number || '', b.parking_fee || 0, b.highway_fee || 0).run();
      const row = env.DB.prepare('SELECT * FROM attendance_records WHERE id = ?').bind(id).first();
      return json(row, 201);
    }

    if (url.pathname.startsWith('/api/records/') && m === 'PUT') {
      const uid = authUserId();
      if (!uid) return json({ error: 'unauthorized' }, 401);
      const id = url.pathname.split('/').pop();
      const b = await body();
      env.DB.prepare('UPDATE attendance_records SET record_date = ?, employee_name = ?, employee_count = ?, site_name = ?, room_type = ?, room_number = ?, parking_fee = ?, highway_fee = ? WHERE id = ? AND user_id = ?')
        .bind(b.record_date, b.employee_name, b.employee_count, b.site_name, b.room_type || '', b.room_number || '', b.parking_fee || 0, b.highway_fee || 0, id, uid).run();
      const row = env.DB.prepare('SELECT * FROM attendance_records WHERE id = ? AND user_id = ?').bind(id, uid).first();
      if (!row) return json({ error: 'not_found' }, 404);
      return json(row);
    }

    if (url.pathname.startsWith('/api/records/') && m === 'DELETE') {
      const uid = authUserId();
      if (!uid) return json({ error: 'unauthorized' }, 401);
      const id = url.pathname.split('/').pop();
      env.DB.prepare('DELETE FROM attendance_records WHERE id = ? AND user_id = ?').bind(id, uid).run();
      return json({ ok: true });
    }

    return new Response('Not Found', { status: 404, headers });
  }
}