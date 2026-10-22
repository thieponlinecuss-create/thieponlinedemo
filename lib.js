import { CONFIG } from './config.js';

export const { PRICE, TRIAL_DAYS, PAID_DAYS, SITE_NAME } = CONFIG;
export const DAY = 86400000;

/* ---------- tiện ích ---------- */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export const fmtVnd = (n) => Number(n).toLocaleString('vi-VN') + 'đ';
export const fmtTime = (t) => new Date(t).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
export function parseDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null;
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}
export function fmtDateVi(date) {
  const dt = parseDate(date);
  if (!dt) return { weekday: '', day: '--', month: '--', year: '----', long: '' };
  const weekday = WEEKDAYS[dt.getDay()];
  const day = String(dt.getDate()).padStart(2, '0');
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const year = String(dt.getFullYear());
  return { weekday, day, month, year, long: `${weekday}, ${day}/${month}/${year}` };
}
export function safeUrl(u) {
  const s = String(u || '').trim();
  return /^https?:\/\//i.test(s) ? s : '';
}
export function safeImg(u) {
  const s = String(u || '').trim();
  return /^https:\/\//i.test(s) ? s : '';
}
export const lastWord = (s) => String(s || '').split(' ').slice(-1)[0];

export function isActive(inv) {
  const now = Date.now();
  return (inv.paid_until || 0) > now || inv.trial_ends_at > now;
}
export const isPaid = (inv) => (inv.paid_until || 0) > Date.now();

export function statusBadge(inv) {
  if (isPaid(inv)) return '<span class="badge badge-ok">Đã kích hoạt</span>';
  if (isActive(inv)) {
    const d = Math.max(1, Math.ceil((inv.trial_ends_at - Date.now()) / DAY));
    return `<span class="badge badge-trial">Dùng thử · còn ${d} ngày</span>`;
  }
  return '<span class="badge badge-off">Hết hạn</span>';
}

/* Đường dẫn công khai của thiệp (t.html nằm cùng thư mục với index.html) */
export function inviteUrl(slug, token) {
  const base = location.origin + location.pathname.replace(/[^/]*$/, '');
  return `${base}t.html?s=${encodeURIComponent(slug)}${token ? `&k=${encodeURIComponent(token)}` : ''}`;
}

/* ---------- mẫu thiệp ---------- */
export const STYLES = ['Tối giản', 'Truyền thống', 'Hoa', 'Sang trọng'];
export const COLORS = ['Đỏ', 'Xanh', 'Hồng', 'Lam'];

export const TEMPLATES = [
  { id: 'toi-gian-do', name: 'Tối Giản - Đỏ Đậm', layout: 'minimal', style: 'Tối giản', color: 'Đỏ', tags: ['Tối giản', 'Thanh lịch'],
    vars: { bg: '#fbf7f4', paper: '#ffffff', ink: '#2b1a1a', muted: '#7a6666', accent: '#9b1c31', accent2: '#e3b9c0', hero: '#9b1c31', heroInk: '#fff6f2' } },
  { id: 'toi-gian-lam', name: 'Tối Giản - Lam Navy', layout: 'minimal', style: 'Tối giản', color: 'Lam', tags: ['Tối giản', 'Xanh navy'], isNew: true,
    vars: { bg: '#f4f7fb', paper: '#ffffff', ink: '#14233a', muted: '#5d6b82', accent: '#1f3b6b', accent2: '#b5c6df', hero: '#1f3b6b', heroInk: '#f2f6fc' } },
  { id: 'song-hy-do', name: 'Song Hỷ - Đỏ Vàng', layout: 'hy', style: 'Truyền thống', color: 'Đỏ', tags: ['Truyền thống', 'Chữ Hỷ'],
    vars: { bg: '#fbefe0', paper: '#fffaf0', ink: '#3d0d12', muted: '#7d5a54', accent: '#b3121f', accent2: '#d4a437', hero: '#a50f1c', heroInk: '#fbe9c4' } },
  { id: 'song-hy-ngoc', name: 'Song Hỷ - Xanh Ngọc', layout: 'hy', style: 'Truyền thống', color: 'Xanh', tags: ['Truyền thống', 'Chữ Hỷ'],
    vars: { bg: '#f1f3e8', paper: '#fbfcf5', ink: '#0f2e2a', muted: '#58706b', accent: '#0f5e55', accent2: '#d4a437', hero: '#0f5e55', heroInk: '#f6edcf' } },
  { id: 'hoa-hong', name: 'Hoa Hồng Pastel', layout: 'floral', style: 'Hoa', color: 'Hồng', tags: ['Hoa', 'Lãng mạn'],
    vars: { bg: '#fff6f7', paper: '#ffffff', ink: '#4a2a33', muted: '#8c6a74', accent: '#c2577a', accent2: '#f2c4d0', hero: '#f9dde4', heroInk: '#4a2a33' } },
  { id: 'vuon-xuan', name: 'Vườn Xuân - Xanh Lá', layout: 'floral', style: 'Hoa', color: 'Xanh', tags: ['Hoa', 'Thiên nhiên'], isNew: true,
    vars: { bg: '#f5f8f2', paper: '#ffffff', ink: '#26352a', muted: '#637a68', accent: '#4f7a55', accent2: '#c8dbc0', hero: '#dfeadb', heroInk: '#26352a' } },
  { id: 'hoang-kim-lam', name: 'Hoàng Kim - Lam Đêm', layout: 'gold', style: 'Sang trọng', color: 'Lam', tags: ['Sang trọng', 'Vàng kim'],
    vars: { bg: '#0f1c36', paper: '#16264a', ink: '#f3ead2', muted: '#b9b29c', accent: '#d6b25e', accent2: '#7d6c3c', hero: '#0b1429', heroInk: '#f3ead2' } },
  { id: 'hoang-kim-do', name: 'Hoàng Kim - Đỏ Rượu', layout: 'gold', style: 'Sang trọng', color: 'Đỏ', tags: ['Sang trọng', 'Vàng kim'], isNew: true,
    vars: { bg: '#3a0a12', paper: '#4a1019', ink: '#f6e7c8', muted: '#c9b08c', accent: '#e0b865', accent2: '#8a6a34', hero: '#2c070d', heroInk: '#f6e7c8' } },
];
export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id);

export const varStyle = (vars) => Object.entries(vars).map(([k, v]) => `--${k}:${v}`).join(';');

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };

export const EMPTY_GIFT = { bank: '', number: '', holder: '' };

export function defaultData(groomName, brideName) {
  return {
    groomName, brideName, groomFull: groomName, brideFull: brideName,
    groomParents: 'Ông: Nguyễn Văn A\nBà: Trần Thị B',
    brideParents: 'Ông: Lê Văn C\nBà: Phạm Thị D',
    date: plusDays(60), lunarDate: '', ceremonyTime: '09:00', partyTime: '11:30',
    venue: 'Nhà hàng tiệc cưới', address: 'Số 1, đường ABC, Quận XYZ', mapUrl: '',
    heroPhoto: '', groomPhoto: '', bridePhoto: '', gallery: [],
    quote: 'Hạnh phúc là khi có người cùng bạn đi hết quãng đường còn lại.',
    story: 'Chúng mình gặp nhau vào một ngày bình thường, và từ đó mọi ngày đều trở nên đặc biệt. Cảm ơn bạn đã đến chung vui và chúc phúc cho ngày trọng đại của chúng mình.',
    giftGroom: { ...EMPTY_GIFT }, giftBride: { ...EMPTY_GIFT }, music: '',
  };
}

export function mergeData(raw) {
  const d = { ...defaultData('', ''), ...(raw || {}) };
  d.giftGroom = { ...EMPTY_GIFT, ...(d.giftGroom || {}) };
  d.giftBride = { ...EMPTY_GIFT, ...(d.giftBride || {}) };
  if (!Array.isArray(d.gallery)) d.gallery = [];
  return d;
}

export const SAMPLE = {
  groomName: 'Minh Khang', brideName: 'Thu Hà', groomFull: 'Nguyễn Minh Khang', brideFull: 'Trần Thu Hà',
  groomParents: 'Ông: Nguyễn Văn Hùng\nBà: Lê Thị Mai', brideParents: 'Ông: Trần Quốc Bảo\nBà: Phạm Thị Lan',
  date: plusDays(75), lunarDate: 'Tức ngày 15 tháng 11 năm Bính Ngọ',
  ceremonyTime: '09:30', partyTime: '11:30', venue: 'Trung tâm tiệc cưới Hoa Sen',
  address: '123 Đường Láng, Đống Đa, Hà Nội', mapUrl: 'https://maps.google.com/',
  heroPhoto: '', groomPhoto: '', bridePhoto: '', gallery: [],
  quote: 'Yêu là tìm thấy nhà trong một con người.',
  story: 'Hai đứa mình quen nhau từ một buổi chiều mưa ở quán cà phê nhỏ. Sau nhiều năm cùng nhau trưởng thành, chúng mình quyết định về chung một nhà. Sự hiện diện của bạn là niềm vui lớn nhất trong ngày cưới của chúng mình.',
  giftGroom: { bank: 'Vietcombank', number: '0123456789', holder: 'NGUYEN MINH KHANG' },
  giftBride: { bank: 'Techcombank', number: '9876543210', holder: 'TRAN THU HA' },
  music: '',
};

export function thumb(tpl, { groom = 'Khang', bride = 'Hà', date = '20 · 12' } = {}) {
  return `<div class="thumb l-${tpl.layout}" style="${varStyle(tpl.vars)}" aria-hidden="true">
  <div class="t-top">${tpl.layout === 'hy' ? '<div class="t-hy">囍</div>' : ''}<span class="t-kick">Thiệp mời cưới</span>
    <div class="t-names"><span>${esc(groom)}</span><i>&amp;</i><span>${esc(bride)}</span></div></div>
  <div class="t-bot"><span class="t-sub">Save the date</span><span class="t-line"></span><span class="t-date">${date}</span></div>
</div>`;
}

/* ---------- hình trang trí ---------- */
export function flower(size = 80, petals = 8, cls = '') {
  let p = '';
  for (let i = 0; i < petals; i++) p += `<ellipse cx="0" cy="-22" rx="9" ry="22" fill="currentColor" opacity=".5" transform="rotate(${(i * 360) / petals})"/>`;
  return `<svg viewBox="-50 -50 100 100" width="${size}" height="${size}" aria-hidden="true" class="${cls}">${p}<circle r="8" fill="#fff" opacity=".92"/><circle r="4" fill="currentColor"/></svg>`;
}
export function leaf(size = 60, cls = '', rotate = 0) {
  return `<svg viewBox="0 0 40 80" width="${size / 2}" height="${size}" aria-hidden="true" class="${cls}" style="transform:rotate(${rotate}deg)"><path d="M20 2 C34 20 34 56 20 78 C6 56 6 20 20 2Z" fill="currentColor" opacity=".55"/><path d="M20 8 L20 74" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/></svg>`;
}
export function floralCorner(cls = '') {
  return `<div class="floral-corner ${cls}" aria-hidden="true">${flower(120, 10, 'f1')}${flower(72, 8, 'f2')}${flower(52, 7, 'f3')}${leaf(90, 'l1', -35)}${leaf(70, 'l2', 40)}${leaf(60, 'l3', 110)}</div>`;
}
export function divider(layout) {
  if (layout === 'floral') return `<div class="divider divider-floral" aria-hidden="true"><span></span>${flower(26, 6)}<span></span></div>`;
  if (layout === 'gold' || layout === 'hy')
    return `<div class="divider divider-${layout}" aria-hidden="true"><span></span><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 1 L23 12 L12 23 L1 12Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7 L17 12 L12 17 L7 12Z" fill="currentColor"/></svg><span></span></div>`;
  return '<div class="divider divider-minimal" aria-hidden="true"><span></span></div>';
}
export const hyMark = (size = 120) => `<div class="hy-mark" style="width:${size}px;height:${size}px;font-size:${size * 0.58}px" aria-hidden="true"><span>囍</span></div>`;

/* ---------- tải/gỡ CSS của thiệp (tránh trùng class với CSS trang chủ) ---------- */
let invLink = null;
export function loadInvitationCss() {
  if (invLink) return Promise.resolve();
  return new Promise((resolve) => {
    invLink = document.createElement('link');
    invLink.rel = 'stylesheet';
    invLink.href = new URL('../css/invitation.css', import.meta.url).href;
    invLink.onload = invLink.onerror = () => resolve();
    document.head.appendChild(invLink);
  });
}
export function unloadInvitationCss() {
  if (invLink) { invLink.remove(); invLink = null; }
}
