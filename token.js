/*! Token Inspector — Nexus Wave
 *
 * Install:
 *   Add a bookmark with this URL (rename USER/REPO):
 *
 *   javascript:(()=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/USER/REPO@main/token.js?v='+Date.now();(document.body||document.documentElement).appendChild(s)})()
 *
 * Usage:
 *   Open any site → click the bookmark → popup shows the Base64-decoded value
 *   of the configured cookie. Click again (or press Esc) to close.
 *
 * Config:
 *   Edit CONFIG below. No other file needed.
 */
(() => {
  'use strict';

  /* ============ CONFIG ============ */
  const CONFIG = {
    cookieName : 'token',   // cookie to read
    reloginUrl : '',        // '' = current site root (location.origin + '/')
    brand      : 'Nexus Wave',
  };
  /* ================================ */

  const HOST_ID = '__nx_token_inspector';
  const relogin = CONFIG.reloginUrl || (location.origin + '/');

  const prev = document.getElementById(HOST_ID);
  if (prev) { prev.remove(); return; }            // re-run = toggle off

  const readCookie = (name) => {
    const hit = document.cookie.split('; ').find((c) => c.startsWith(name + '='));
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
  };

  const b64decode = (str) => {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    s += '='.repeat((4 - (s.length % 4)) % 4);
    return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));
  };

  const token   = readCookie(CONFIG.cookieName);
  const missing = !token || !token.trim();

  let decoded = '', decodeError = '';
  if (!missing) {
    try { decoded = b64decode(token); }
    catch (err) { decodeError = (err && err.message) || 'invalid base64'; }
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = 'all:initial;position:fixed;top:20px;right:20px;z-index:2147483647;';
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
  <style>
    :host { all: initial; }
    .card, .card * { box-sizing: border-box; margin: 0; padding: 0; }
    .card {
      width: 360px;
      font: 13px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      color: #e6edf3;
      background: linear-gradient(180deg, #161b22, #0d1117);
      border: 1px solid #30363d; border-radius: 14px;
      box-shadow: 0 18px 44px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03) inset;
      overflow: hidden; animation: nxIn .18s ease-out;
    }
    @keyframes nxIn { from { opacity: 0; transform: translateY(-8px) scale(.97); } }
    .hd {
      display: flex; align-items: center; gap: 10px; padding: 11px 12px 11px 14px;
      background: linear-gradient(90deg, rgba(124,58,237,.28), rgba(34,211,238,.16));
      border-bottom: 1px solid #30363d;
      cursor: grab; user-select: none; touch-action: none;
    }
    .hd:active { cursor: grabbing; }
    .logo {
      width: 27px; height: 27px; flex: 0 0 auto; border-radius: 8px;
      display: grid; place-items: center;
      background: linear-gradient(135deg, #7c3aed, #22d3ee);
      color: #fff; font: 800 10.5px/1 system-ui; letter-spacing: .03em;
      box-shadow: 0 2px 10px rgba(124,58,237,.55);
    }
    .ttl { flex: 1 1 auto; min-width: 0; }
    .ttl b { display: block; font: 600 12.5px/1.3 system-ui; }
    .ttl span {
      display: block; font: 600 9.5px/1.4 system-ui;
      letter-spacing: .14em; text-transform: uppercase; color: #9aa4b2;
    }
    .x {
      flex: 0 0 auto; width: 26px; height: 26px; border: 0; border-radius: 8px;
      cursor: pointer; background: rgba(255,255,255,.06); color: #8b949e;
      font: 600 13px/1 system-ui; display: grid; place-items: center;
      transition: background .15s, color .15s;
    }
    .x:hover { background: rgba(248,81,73,.2); color: #f85149; }
    .bd { padding: 14px; }
    .lbl {
      font: 600 10px/1.4 system-ui; letter-spacing: .12em;
      text-transform: uppercase; color: #8b949e; margin-bottom: 7px;
    }
    textarea {
      display: block; width: 100%; height: 78px; resize: vertical;
      padding: 10px 11px; border-radius: 9px;
      background: #010409; color: #7ee787; border: 1px solid #30363d; outline: none;
      font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      word-break: break-all; transition: border-color .15s, box-shadow .15s;
    }
    textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.25); }
    .state {
      padding: 12px; border-radius: 9px;
      background: rgba(248,81,73,.08); border: 1px solid rgba(248,81,73,.32);
    }
    .state-t { font: 600 12.5px/1.4 system-ui; color: #ff8f85; margin-bottom: 2px; }
    .state-s { font: 11.5px/1.5 system-ui; color: #c9a19d; word-break: break-word; }
    .btn {
      display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
      padding: 8px 13px; border-radius: 8px; border: 0; cursor: pointer;
      text-decoration: none; color: #fff; font: 600 12px system-ui;
      background: linear-gradient(135deg, #7c3aed, #22d3ee);
      transition: filter .15s, transform .1s;
    }
    .btn:hover { filter: brightness(1.12); }
    .btn:active { transform: scale(.97); }
    .ft {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 9px 14px; border-top: 1px solid #21262d; background: rgba(1,4,9,.45);
    }
    .credit { font: 11px/1.4 system-ui; color: #8b949e; }
    .credit b {
      font-weight: 700; letter-spacing: .02em;
      background: linear-gradient(90deg, #a78bfa, #22d3ee);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .copy {
      border: 1px solid #30363d; background: #161b22; color: #c9d1d9; cursor: pointer;
      padding: 6px 11px; border-radius: 8px; font: 600 11.5px/1 system-ui;
      transition: border-color .15s, color .15s, background .15s;
    }
    .copy:hover { border-color: #7c3aed; color: #fff; background: #1c2330; }
    .copy.ok { border-color: #3fb950; color: #3fb950; background: rgba(63,185,80,.08); }
  </style>

  <div class="card" role="dialog" aria-label="Token Inspector">
    <div class="hd">
      <div class="logo">NW</div>
      <div class="ttl"><b>Token Inspector</b><span>${CONFIG.brand}</span></div>
      <button class="x" title="Close (Esc)">&#10005;</button>
    </div>
    <div class="bd"></div>
    <div class="ft">
      <div class="credit">made by <b>${CONFIG.brand}</b></div>
      <button class="copy" hidden>Copy</button>
    </div>
  </div>`;

  const body    = root.querySelector('.bd');
  const copyBtn = root.querySelector('.copy');

  const close = () => { document.removeEventListener('keydown', onKey, true); host.remove(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  root.querySelector('.x').addEventListener('click', close);
  document.addEventListener('keydown', onKey, true);

  const stateEl = (title, sub) => {
    const box = document.createElement('div');
    box.className = 'state';
    const t = document.createElement('div'); t.className = 'state-t'; t.textContent = title;
    const s = document.createElement('div'); s.className = 'state-s'; s.textContent = sub;
    const a = document.createElement('a');
    a.className = 'btn'; a.href = relogin;
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = 'Relogin \u2192';
    box.append(t, s, a);
    return box;
  };

  if (missing) {
    body.appendChild(stateEl('Token not found', 'No token cookie on this page. Please relogin to continue.'));
  } else if (decodeError) {
    body.appendChild(stateEl('Decode failed', decodeError));
  } else {
    const lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.textContent = 'Decoded token';
    const ta = document.createElement('textarea');
    ta.readOnly = true;
    ta.spellcheck = false;
    ta.value = decoded;
    ta.addEventListener('focus', () => ta.select());
    body.append(lbl, ta);
    copyBtn.hidden = false;
    copyBtn.addEventListener('click', () => copy(decoded, copyBtn));
  }

  async function copy(text, btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch {
      try {
        const t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', '');
        t.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(t); t.select();
        ok = document.execCommand('copy'); t.remove();
      } catch { ok = false; }
    }
    btn.textContent = ok ? 'Copied \u2713' : 'Copy failed';
    btn.classList.toggle('ok', ok);
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1300);
  }

  const hd = root.querySelector('.hd');
  let drag = null;
  hd.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.x')) return;
    const r = host.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width };
    host.style.right = 'auto';
    host.style.left = r.left + 'px';
    host.style.top  = r.top + 'px';
    hd.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  hd.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const x = Math.max(0, Math.min(e.clientX - drag.dx, innerWidth - drag.w - 4));
    const y = Math.max(0, Math.min(e.clientY - drag.dy, innerHeight - 48));
    host.style.left = x + 'px';
    host.style.top  = y + 'px';
  });
  const endDrag = () => { drag = null; };
  hd.addEventListener('pointerup', endDrag);
  hd.addEventListener('pointercancel', endDrag);

  (document.body || document.documentElement).appendChild(host);
})();
