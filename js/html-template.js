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

/** Các địa chỉ có thể dùng để tải cùng một ảnh (Google Drive hay chặn một số kiểu link). */
function imgCandidates(url) {
  const out = [url];
  const m = url.match(/[?&]id=([\w-]{20,})/) || url.match(/\/d\/([\w-]{20,})/) || url.match(/\/file\/d\/([\w-]{20,})/);
  if (m && /google/.test(url)) {
    out.push(`https://lh3.googleusercontent.com/d/${m[1]}=w1600`, `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600`, `https://drive.google.com/uc?export=view&id=${m[1]}`);
  }
  return [...new Set(out)];
}

function setPhoto(img, url) {
  const list = imgCandidates(url);
  let k = 0;
  img.setAttribute('loading', 'eager');
  img.setAttribute('decoding', 'async');
  img.setAttribute('style', 'left:0;top:0;width:100%;height:100%;object-fit:cover;background:none');
  img.onerror = () => {
    k += 1;
    if (k < list.length) img.src = list[k];
    else img.style.visibility = 'hidden'; // không tải được thì ẩn, tránh hiện biểu tượng ảnh lỗi
  };
  img.src = list[0];
}

/**
 * Ảnh mẫu của người khác không được hiện trên thiệp thật: thay bằng ảnh người dùng tải lên.
 * Mẫu có 25 ô ảnh: 0-11 ảnh bìa ghép, 12 chú rể, 13 cô dâu, 14-16 ảnh ngày cưới, 17-24 album.
 * Ảnh ít hơn số ô thì dùng lại luân phiên.
 */
function fillPhotos(doc, data, keepSample) {
  if (keepSample) return;
  const hero = safeImg(data.heroPhoto);
  const groom = safeImg(data.groomPhoto);
  const bride = safeImg(data.bridePhoto);
  const gallery = (data.gallery || []).map(safeImg).filter(Boolean);
  const mixed = [hero, ...gallery].filter(Boolean);
  const any = mixed.length ? mixed : [groom, bride].filter(Boolean);
  const imgs = [...doc.querySelectorAll('img.cv-crop')].filter((img) => img.closest('.iv-photo') || /height="(600|525)"/.test(img.getAttribute('src') || ''));
  let n = 0;
  imgs.forEach((img) => {
    const slot = Number(img.closest('.iv-photo')?.dataset.slot);
    let pick = '';
    if (slot === 12) pick = groom || any[0];
    else if (slot === 13) pick = bride || any[1 % (any.length || 1)];
    else if (any.length) pick = any[n++ % any.length];
    if (pick) setPhoto(img, pick);
    else img.style.visibility = 'hidden';
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
body{margin:0 auto;overflow-x:hidden}html{-webkit-text-size-adjust:100%}`;

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
  doc.querySelectorAll('meta[name="referrer"]').forEach((n) => n.remove()); // meta no-referrer làm ảnh Google Drive không tải được
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
  iframe.style.cssText = `display:block;width:100%;height:${slug === 'demo' ? 'calc(100vh - 56px)' : '100vh'};height:${slug === 'demo' ? 'calc(100dvh - 56px)' : '100dvh'};border:0;background:#fff`;
  // Mẫu thiết kế rộng 420px: phóng/thu theo bề rộng màn hình (tối đa 500px) để vừa mọi điện thoại.
  const fit = () => {
    const w = iframe.clientWidth || window.innerWidth;
    const z = Math.max(0.5, Math.min(w, 500) / 420);
    const de = iframe.contentDocument?.documentElement;
    if (de) de.style.setProperty('--cvz', String(z));
  };
  doc.documentElement.style.setProperty('--cvz', String(Math.max(0.5, Math.min(root.clientWidth || window.innerWidth, 500) / 420)));
  const onResize = () => fit();
  window.addEventListener('resize', onResize);
  iframe.addEventListener('load', () => {
    const d = iframe.contentDocument;
    if (!d) return;
    fit();
    wireGift(d, data);
    wireRsvp(d, opts);
    wireMusic(d, data);
  });
  root.innerHTML = '';
  root.appendChild(iframe);
  iframe.srcdoc = '<!doctype html>' + doc.documentElement.outerHTML;
  return () => { window.removeEventListener('resize', onResize); iframe.remove(); };
}
