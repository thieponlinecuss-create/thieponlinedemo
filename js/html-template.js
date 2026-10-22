import { api } from './api.js';
import { esc, fmtDateVi, safeImg, safeUrl } from './lib.js';

/**
 * Mẫu thiệp dạng "trang HTML thiết kế sẵn" (vd. Anh Đào).
 * Tải file mẫu, thay thông tin cô dâu chú rể vào, rồi hiển thị trong iframe.
 */
const cache = new Map();
async function loadSource(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(new URL('../' + path, import.meta.url)).then((r) => {
      if (!r.ok) throw new Error('Không tải được mẫu thiệp.');
      return r.text();
    }));
  }
  return cache.get(path);
}

const upper = (s) => String(s || '').toLocaleUpperCase('vi-VN');

/** Tách "Ông: A / Bà: B / dòng khác" thành 3 dòng hiển thị của mẫu. */
function parentLines(text) {
  const out = { father: '', mother: '', place: [] };
  String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => {
    const m = l.match(/^(ông|bà)\s*:?\s*(.*)$/i);
    if (m && m[1].toLowerCase() === 'ông' && !out.father) out.father = 'ÔNG ' + m[2];
    else if (m && m[1].toLowerCase() === 'bà' && !out.mother) out.mother = 'BÀ ' + upper(m[2]);
    else out.place.push(l);
  });
  return out;
}

function fillTexts(doc, data) {
  const d = fmtDateVi(data.date);
  const names = `${data.groomName} & ${data.brideName}`;
  const gp = parentLines(data.groomParents);
  const bp = parentLines(data.brideParents);
  const seq = (arr) => { let i = 0; return () => arr[Math.min(i++, arr.length - 1)]; };
  const nextFather = seq([gp.father, bp.father]);
  const nextMother = seq([gp.mother, bp.mother]);
  const nextPlace = seq([gp.place.join(' · '), bp.place.join(' · ')]);
  const nextTime = seq([data.partyTime || data.ceremonyTime, data.ceremonyTime || data.partyTime]);
  const weekday = (d.weekday || '').toLocaleLowerCase('vi-VN');
  const lunar = String(data.lunarDate || '').trim();
  const quote = String(data.quote || '').trim();

  const exact = {
    'Thu Nga & Thanh Hải': names,
    '08 . 03 . 2026': `${d.day} . ${d.month} . ${d.year}`,
    '08. 03. 2026': `${d.day}. ${d.month}. ${d.year}`,
    '08': d.day, '03': d.month, '2026': d.year,
    'Tháng 03': `Tháng ${d.month}`, 'Năm 2026': `Năm ${d.year}`,
    'Trần Minh Hoàng': data.groomFull || data.groomName,
    'Phạm Mai Hương': data.brideFull || data.brideName,
    'TƯ GIA NHÀ TRAI': upper(data.venue),
    'Khu 4, Xã Phùng Nguyên, Tỉnh Phú Thọ': data.address,
    '(Nhằm Ngày 20 Tháng 01 Năm Bính Ngọ)': lunar ? `(${lunar.replace(/^\(|\)$/g, '')})` : '',
    '“Hôn nhân là chuyện cả đời,': quote ? `“${quote}”` : '',
    'Yêu người vừa ý, cưới người mình thương.”': '',
    'Yêu người vừa ý, cưới người mình thương.': '',
  };
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    const raw = n.nodeValue;
    const t = raw.trim();
    if (!t) return;
    if (/^ÔNG Nguyễn Quang Thắng$/.test(t)) n.nodeValue = nextFather();
    else if (t === 'BÀ NGUYỄN THỊ VÂN') n.nodeValue = nextMother();
    else if (t === "Xã K'Dang - Tỉnh Gia Lai") n.nodeValue = nextPlace();
    else if (/^\d{2}:\d{2} \| /.test(t)) n.nodeValue = `${nextTime()} | ${weekday}`;
    else if (Object.prototype.hasOwnProperty.call(exact, t)) n.nodeValue = exact[t];
  });
}

/** Ảnh mẫu của người khác không được hiện trên thiệp thật: thay bằng ảnh người dùng tải lên (hoặc ẩn đi). */
function fillPhotos(doc, data, keepSample) {
  if (keepSample) return;
  const pool = [data.heroPhoto, data.groomPhoto, data.bridePhoto, ...(data.gallery || [])].map(safeImg).filter(Boolean);
  // Ảnh chụp: nằm trong .iv-photo, hoặc là ảnh giữ chỗ tỉ lệ 2:3 (400x600, 350x525). Hoạ tiết hoa lá thì giữ nguyên.
  const imgs = [...doc.querySelectorAll('img.cv-crop')].filter((img) => img.closest('.iv-photo') || /height="(600|525)"/.test(img.getAttribute('src') || ''));
  imgs.forEach((img, i) => {
    if (!pool.length) { img.style.visibility = 'hidden'; return; }
    img.setAttribute('src', pool[i % pool.length]);
    img.setAttribute('style', 'left:0;top:0;width:100%;height:100%;object-fit:cover;background:none');
  });
}

function fillMap(doc, data) {
  const url = safeUrl(data.mapUrl) || `https://maps.google.com/?q=${encodeURIComponent(data.address || data.venue || '')}`;
  doc.querySelectorAll('a[href*="maps.google.com"]').forEach((a) => {
    a.setAttribute('href', url); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer');
  });
}

function fillWishes(doc, wishes) {
  const track = doc.querySelector('.iv-wishes__track');
  if (!track) return;
  const list = wishes.filter((w) => String(w.message || '').trim()).slice(0, 30);
  track.innerHTML = list.map((w) => `<div class="iv-wish"><b>${esc(w.name)}</b><p>${esc(w.message)}</p></div>`).join('');
}

const GIFT_CSS = `
.hx-modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:grid;place-items:center;z-index:99999;padding:20px}
.hx-card{background:#fff;border-radius:16px;max-width:360px;width:100%;padding:22px;text-align:center;font-family:Quicksand,sans-serif;color:#333;max-height:90vh;overflow:auto}
.hx-card h3{margin:0 0 12px}.hx-box{border:1px solid #f0dde4;border-radius:12px;padding:12px;margin:10px 0}
.hx-box b{display:block;margin-bottom:4px}.hx-box p{margin:2px 0}.hx-acc{font-size:1.15rem;font-weight:700;letter-spacing:.04em}
.hx-card button{border:0;border-radius:10px;padding:9px 16px;background:#dcc4c3;color:#222;font-weight:600;cursor:pointer;margin:4px}
.hx-music{position:fixed;right:14px;bottom:14px;width:44px;height:44px;border-radius:50%;border:0;background:#a52a2a;color:#fff;font-size:20px;z-index:9999;cursor:pointer}
body{margin:0 auto}`;

function wireGift(doc, data) {
  const btn = doc.querySelector('[data-open="iv-gift-modal"]');
  if (!btn) return;
  const cards = [['Mừng chú rể', data.giftGroom], ['Mừng cô dâu', data.giftBride]].filter(([, g]) => g && String(g.number || '').trim());
  if (!cards.length) { btn.style.display = 'none'; return; }
  btn.addEventListener('click', () => {
    const m = doc.createElement('div');
    m.className = 'hx-modal';
    m.innerHTML = `<div class="hx-card"><h3>Gửi quà mừng cưới</h3>${cards.map(([t, g]) =>
      `<div class="hx-box"><b>${esc(t)}</b><p>${esc(g.bank)}</p><p class="hx-acc">${esc(g.number)}</p><p>${esc(g.holder)}</p>
      <button type="button" data-copy="${esc(String(g.number).replace(/\s/g, ''))}">Sao chép</button></div>`).join('')}
      <button type="button" data-close>Đóng</button></div>`;
    m.addEventListener('click', async (e) => {
      if (e.target === m || e.target.closest('[data-close]')) m.remove();
      const c = e.target.closest('[data-copy]');
      if (c) { try { await doc.defaultView.navigator.clipboard.writeText(c.dataset.copy); c.textContent = 'Đã chép ✓'; } catch { /* bỏ qua */ } }
    });
    doc.body.appendChild(m);
  });
}

function wireRsvp(doc, { slug, guest, rsvpDisabled }) {
  const form = doc.querySelector('form.cv-form');
  if (!form) return;
  const msg = form.querySelector('.cv-form__msg');
  const say = (t, bad) => { if (msg) { msg.textContent = t; msg.style.color = bad ? '#c0392b' : '#2e7d32'; } };
  if (guest?.name && form.name && !form.name.value) form.name.value = guest.name;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (rsvpDisabled) return say('Đây là bản xem thử.', true);
    const attend = form.attend.value;
    if (!form.name.value.trim()) return say('Vui lòng nhập tên của bạn.', true);
    if (!attend) return say('Vui lòng chọn bạn có tham dự không.', true);
    const b = form.querySelector('button[type=submit]');
    b.disabled = true;
    try {
      await api('submitRsvp', {
        slug, guest: guest?.token || '', website: form.website.value,
        name: form.name.value, attending: attend.startsWith('Có') ? '1' : '0', count: 1, message: form.message.value,
      });
      say('Cảm ơn bạn! Chúng mình đã nhận được phản hồi.');
      form.reset();
    } catch (x) {
      say(x.message || 'Không gửi được, vui lòng thử lại.', true);
      b.disabled = false;
    }
  });
}

function wireMusic(doc, data) {
  const b = doc.getElementById('iv-music');
  const src = safeUrl(data.music);
  if (!src) { if (b) b.remove(); return; }
  const audio = doc.createElement('audio');
  audio.src = src; audio.loop = true; audio.preload = 'none';
  doc.body.appendChild(audio);
  if (!b) return;
  b.addEventListener('click', () => {
    if (audio.paused) audio.play().then(() => b.setAttribute('aria-pressed', 'true')).catch(() => {});
    else { audio.pause(); b.setAttribute('aria-pressed', 'false'); }
  });
}

export async function renderHtmlTemplate(root, opts) {
  const { tpl, data, slug, wishes = [] } = opts;
  root.innerHTML = '<p class="muted center" style="padding:60px 20px">Đang tải thiệp...</p>';
  let html;
  try { html = await loadSource(tpl.html); } catch (e) { root.innerHTML = `<p class="center" style="padding:60px 20px">${esc(e.message)}</p>`; return; }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('.iv-demobar').forEach((n) => n.remove()); // nút "Dùng mẫu này" của bản demo gốc
  fillTexts(doc, data);
  fillPhotos(doc, data, slug === 'demo');
  fillMap(doc, data);
  fillWishes(doc, slug === 'demo' ? [] : wishes);
  doc.title = `${data.groomName} & ${data.brideName} - Thiệp mời cưới | Duyên Thư`;
  const style = doc.createElement('style');
  style.textContent = GIFT_CSS;
  doc.head.appendChild(style);

  const iframe = document.createElement('iframe');
  iframe.title = 'Thiệp cưới';
  iframe.style.cssText = `display:block;width:100%;height:${slug === 'demo' ? 'calc(100vh - 56px)' : '100vh'};border:0;background:#fff`;
  iframe.addEventListener('load', () => {
    const d = iframe.contentDocument;
    if (!d) return;
    wireGift(d, data);
    wireRsvp(d, opts);
    wireMusic(d, data);
  });
  root.innerHTML = '';
  root.appendChild(iframe);
  iframe.srcdoc = '<!doctype html>' + doc.documentElement.outerHTML;
  return () => { iframe.remove(); };
}
