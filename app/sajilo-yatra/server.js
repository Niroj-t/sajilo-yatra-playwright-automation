// Sajilo Yatra: a tiny bus ticket booking app for the Qrius Page Object Model lab.
// One file, no database, no packages to install. Data lives in memory.
// Every login starts a fresh session with its own 3 sample tickets,
// so tests never share data and can run in parallel.

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 4300;
const REDESIGN = process.argv.includes('--redesign') || process.env.REDESIGN === '1';

const USERS = {
  'ram.thapa':   { password: 'Yatra@123', name: 'Ram Thapa',   phone: '9841000001', city: 'Kathmandu' },
  'sita.gurung': { password: 'Yatra@123', name: 'Sita Gurung', phone: '9851000002', city: 'Pokhara' },
};

const CITIES = ['Kathmandu', 'Pokhara', 'Chitwan', 'Lumbini', 'Janakpur'];
// Fare per seat in rupees, decided by the destination city
const FARE = { Kathmandu: 1200, Pokhara: 1200, Chitwan: 900, Lumbini: 1500, Janakpur: 1400 };

const sessions = new Map(); // sid -> { username, tickets, nextNo }

function seedTickets() {
  return [
    { no: 'SY-1001', passenger: 'Ram Thapa',  from: 'Kathmandu', to: 'Pokhara', seats: 2, fare: 2400, status: 'Confirmed' },
    { no: 'SY-1002', passenger: 'Gita Rai',   from: 'Kathmandu', to: 'Chitwan', seats: 1, fare: 900,  status: 'Confirmed' },
    { no: 'SY-1003', passenger: 'Hari Karki', from: 'Pokhara',   to: 'Lumbini', seats: 3, fare: 4500, status: 'Cancelled' },
  ];
}

function send(res, status, body, headers = {}) {
  const isJson = typeof body === 'object' && body !== null;
  res.writeHead(status, { 'Content-Type': isJson ? 'application/json' : 'text/plain', ...headers });
  res.end(isJson ? JSON.stringify(body) : body || '');
}

function getSession(req) {
  const m = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '');
  return m ? sessions.get(m[1]) : undefined;
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
  });
}

function servePage(res, file) {
  let html = fs.readFileSync(path.join(__dirname, 'public', file), 'utf8');
  if (REDESIGN) {
    // "Redesign day": the UI team renames two buttons. Nothing else changes.
    html = html.replace('>Log in</button>', '>Sign in</button>')
               .replace('>Book ticket</button>', '>Book now</button>');
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  const session = getSession(req);

  // ---------- pages ----------
  if (req.method === 'GET' && (p === '/' || p === '/login')) {
    if (p === '/' ) return send(res, 302, '', { Location: session ? '/bookings' : '/login' });
    return servePage(res, 'login.html');
  }
  if (req.method === 'GET' && (p === '/bookings' || p === '/profile')) {
    if (!session) return send(res, 302, '', { Location: '/login' });
    return servePage(res, p === '/bookings' ? 'bookings.html' : 'profile.html');
  }
  if (req.method === 'GET' && p === '/style.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(fs.readFileSync(path.join(__dirname, 'public', 'style.css')));
  }

  // ---------- API ----------
  if (p === '/api/health') return send(res, 200, { status: 'ok', redesign: REDESIGN });

  if (req.method === 'POST' && p === '/api/login') {
    const { username = '', password = '' } = await readBody(req);
    if (!String(username).trim() || !String(password)) {
      return send(res, 400, { error: 'Username and password are required' });
    }
    const user = USERS[String(username).trim()];
    if (!user || user.password !== password) {
      return send(res, 401, { error: 'Invalid username or password' });
    }
    const sid = crypto.randomBytes(16).toString('hex');
    sessions.set(sid, { username: String(username).trim(), tickets: seedTickets(), nextNo: 1004 });
    return send(res, 200, { name: user.name }, { 'Set-Cookie': `sid=${sid}; HttpOnly; Path=/; SameSite=Lax` });
  }

  if (req.method === 'POST' && p === '/api/logout') {
    const m = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '');
    if (m) sessions.delete(m[1]);
    return send(res, 204, '', { 'Set-Cookie': 'sid=; HttpOnly; Path=/; Max-Age=0' });
  }

  if (!p.startsWith('/api/')) return send(res, 404, 'Not found');
  if (!session) return send(res, 401, { error: 'Please log in first' });
  const me = USERS[session.username];

  if (req.method === 'GET' && p === '/api/me') {
    return send(res, 200, { username: session.username, name: me.name, phone: me.phone, city: me.city });
  }

  if (req.method === 'GET' && p === '/api/tickets') {
    return send(res, 200, { tickets: session.tickets, cities: CITIES });
  }

  if (req.method === 'POST' && p === '/api/tickets') {
    const b = await readBody(req);
    const passenger = String(b.passenger || '').trim();
    const seats = Number(b.seats);
    if (!passenger) return send(res, 400, { error: 'Passenger name is required' });
    if (!CITIES.includes(b.from) || !CITIES.includes(b.to)) return send(res, 400, { error: 'Please choose both cities' });
    if (b.from === b.to) return send(res, 400, { error: 'From and To cannot be the same' });
    if (!Number.isInteger(seats) || seats < 1 || seats > 6) return send(res, 400, { error: 'Seats must be between 1 and 6' });
    const ticket = {
      no: `SY-${session.nextNo++}`, passenger, from: b.from, to: b.to, seats,
      fare: FARE[b.to] * seats, status: 'Confirmed',
    };
    session.tickets.push(ticket);
    return send(res, 201, ticket);
  }

  const cancel = /^\/api\/tickets\/(SY-\d+)\/cancel$/.exec(p);
  if (req.method === 'POST' && cancel) {
    const t = session.tickets.find((x) => x.no === cancel[1]);
    if (!t) return send(res, 404, { error: 'Ticket not found' });
    if (t.status === 'Cancelled') return send(res, 409, { error: 'Ticket is already cancelled' });
    t.status = 'Cancelled';
    return send(res, 200, t);
  }

  return send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Sajilo Yatra running at http://localhost:${PORT}${REDESIGN ? '  (REDESIGN mode: buttons renamed)' : ''}`);
});
