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
  return (inv.paid_until || 0) > now; // không có dùng thử: chỉ thiệp đã thanh toán mới mở
}
export const isPaid = (inv) => (inv.paid_until || 0) > Date.now();

export function statusBadge(inv) {
  if (isPaid(inv)) return '<span class="badge badge-ok">Đã kích hoạt</span>';
  return '<span class="badge badge-pending">Chờ thanh toán</span>';
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
  {"id":"vuon-oai-huong-do-01","name":"Vườn Oải Hương - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Vườn Oải Hương"],"isNew":true,"vars":{"bg":"#f7f0fb","paper":"#ede0f7","ink":"#76517f","muted":"#d8c0e8","accent":"#9b72b0","accent2":"#d8c0e8","hero":"#f7f0fb","heroInk":"#76517f"}},
  {"id":"vuon-oai-huong-xanh-02","name":"Vườn Oải Hương - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Vườn Oải Hương"],"vars":{"bg":"#f7f0fb","paper":"#ede0f7","ink":"#76517f","muted":"#d8c0e8","accent":"#9b72b0","accent2":"#d8c0e8","hero":"#f7f0fb","heroInk":"#76517f"}},
  {"id":"vuon-oai-huong-hong-03","name":"Vườn Oải Hương - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Vườn Oải Hương"],"vars":{"bg":"#f7f0fb","paper":"#ede0f7","ink":"#76517f","muted":"#d8c0e8","accent":"#9b72b0","accent2":"#d8c0e8","hero":"#f7f0fb","heroInk":"#76517f"}},
  {"id":"vuon-oai-huong-lam-04","name":"Vườn Oải Hương - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Vườn Oải Hương"],"vars":{"bg":"#f7f0fb","paper":"#ede0f7","ink":"#76517f","muted":"#d8c0e8","accent":"#9b72b0","accent2":"#d8c0e8","hero":"#f7f0fb","heroInk":"#76517f"}},
  {"id":"nang-mai-do-01","name":"Nắng Mai - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Nắng Mai"],"vars":{"bg":"#fff7e8","paper":"#fce9c7","ink":"#8d5b2b","muted":"#f0d29c","accent":"#d28b36","accent2":"#f0d29c","hero":"#fff7e8","heroInk":"#8d5b2b"}},
  {"id":"nang-mai-xanh-02","name":"Nắng Mai - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Nắng Mai"],"vars":{"bg":"#fff7e8","paper":"#fce9c7","ink":"#8d5b2b","muted":"#f0d29c","accent":"#d28b36","accent2":"#f0d29c","hero":"#fff7e8","heroInk":"#8d5b2b"}},
  {"id":"nang-mai-hong-03","name":"Nắng Mai - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Nắng Mai"],"vars":{"bg":"#fff7e8","paper":"#fce9c7","ink":"#8d5b2b","muted":"#f0d29c","accent":"#d28b36","accent2":"#f0d29c","hero":"#fff7e8","heroInk":"#8d5b2b"}},
  {"id":"nang-mai-lam-04","name":"Nắng Mai - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Nắng Mai"],"vars":{"bg":"#fff7e8","paper":"#fce9c7","ink":"#8d5b2b","muted":"#f0d29c","accent":"#d28b36","accent2":"#f0d29c","hero":"#fff7e8","heroInk":"#8d5b2b"}},
  {"id":"moc-lan-trang-do-01","name":"Mộc Lan Trắng - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Mộc Lan Trắng"],"vars":{"bg":"#f7f5f0","paper":"#ebe6dc","ink":"#554c43","muted":"#d8cfc2","accent":"#8b8174","accent2":"#d8cfc2","hero":"#f7f5f0","heroInk":"#554c43"}},
  {"id":"moc-lan-trang-xanh-02","name":"Mộc Lan Trắng - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Mộc Lan Trắng"],"isNew":true,"vars":{"bg":"#f7f5f0","paper":"#ebe6dc","ink":"#554c43","muted":"#d8cfc2","accent":"#8b8174","accent2":"#d8cfc2","hero":"#f7f5f0","heroInk":"#554c43"}},
  {"id":"moc-lan-trang-hong-03","name":"Mộc Lan Trắng - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Mộc Lan Trắng"],"vars":{"bg":"#f7f5f0","paper":"#ebe6dc","ink":"#554c43","muted":"#d8cfc2","accent":"#8b8174","accent2":"#d8cfc2","hero":"#f7f5f0","heroInk":"#554c43"}},
  {"id":"moc-lan-trang-lam-04","name":"Mộc Lan Trắng - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Mộc Lan Trắng"],"vars":{"bg":"#f7f5f0","paper":"#ebe6dc","ink":"#554c43","muted":"#d8cfc2","accent":"#8b8174","accent2":"#d8cfc2","hero":"#f7f5f0","heroInk":"#554c43"}},
  {"id":"hoa-anh-dao-do-01","name":"Hoa Anh Đào - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Hoa Anh Đào"],"vars":{"bg":"#fff3f6","paper":"#f8dce5","ink":"#7d344f","muted":"#edb6ca","accent":"#c85c83","accent2":"#edb6ca","hero":"#fff3f6","heroInk":"#7d344f"}},
  {"id":"hoa-anh-dao-xanh-02","name":"Hoa Anh Đào - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Hoa Anh Đào"],"vars":{"bg":"#fff3f6","paper":"#f8dce5","ink":"#7d344f","muted":"#edb6ca","accent":"#c85c83","accent2":"#edb6ca","hero":"#fff3f6","heroInk":"#7d344f"}},
  {"id":"hoa-anh-dao-hong-03","name":"Hoa Anh Đào - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Hoa Anh Đào"],"vars":{"bg":"#fff3f6","paper":"#f8dce5","ink":"#7d344f","muted":"#edb6ca","accent":"#c85c83","accent2":"#edb6ca","hero":"#fff3f6","heroInk":"#7d344f"}},
  {"id":"hoa-anh-dao-lam-04","name":"Hoa Anh Đào - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Hoa Anh Đào"],"vars":{"bg":"#fff3f6","paper":"#f8dce5","ink":"#7d344f","muted":"#edb6ca","accent":"#c85c83","accent2":"#edb6ca","hero":"#fff3f6","heroInk":"#7d344f"}},
  {"id":"cam-tu-cau-do-01","name":"Cẩm Tú Cầu - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Cẩm Tú Cầu"],"vars":{"bg":"#eef5ff","paper":"#d6e5fa","ink":"#29496e","muted":"#a9c5e8","accent":"#557eb8","accent2":"#a9c5e8","hero":"#eef5ff","heroInk":"#29496e"}},
  {"id":"cam-tu-cau-xanh-02","name":"Cẩm Tú Cầu - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Cẩm Tú Cầu"],"vars":{"bg":"#eef5ff","paper":"#d6e5fa","ink":"#29496e","muted":"#a9c5e8","accent":"#557eb8","accent2":"#a9c5e8","hero":"#eef5ff","heroInk":"#29496e"}},
  {"id":"cam-tu-cau-hong-03","name":"Cẩm Tú Cầu - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Cẩm Tú Cầu"],"isNew":true,"vars":{"bg":"#eef5ff","paper":"#d6e5fa","ink":"#29496e","muted":"#a9c5e8","accent":"#557eb8","accent2":"#a9c5e8","hero":"#eef5ff","heroInk":"#29496e"}},
  {"id":"cam-tu-cau-lam-04","name":"Cẩm Tú Cầu - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Cẩm Tú Cầu"],"vars":{"bg":"#eef5ff","paper":"#d6e5fa","ink":"#29496e","muted":"#a9c5e8","accent":"#557eb8","accent2":"#a9c5e8","hero":"#eef5ff","heroInk":"#29496e"}},
  {"id":"rung-thong-do-01","name":"Rừng Thông - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Rừng Thông"],"vars":{"bg":"#eef4ed","paper":"#d9e6d5","ink":"#2e4b35","muted":"#b6cdb0","accent":"#4f7656","accent2":"#b6cdb0","hero":"#eef4ed","heroInk":"#2e4b35"}},
  {"id":"rung-thong-xanh-02","name":"Rừng Thông - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Rừng Thông"],"vars":{"bg":"#eef4ed","paper":"#d9e6d5","ink":"#2e4b35","muted":"#b6cdb0","accent":"#4f7656","accent2":"#b6cdb0","hero":"#eef4ed","heroInk":"#2e4b35"}},
  {"id":"rung-thong-hong-03","name":"Rừng Thông - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Rừng Thông"],"vars":{"bg":"#eef4ed","paper":"#d9e6d5","ink":"#2e4b35","muted":"#b6cdb0","accent":"#4f7656","accent2":"#b6cdb0","hero":"#eef4ed","heroInk":"#2e4b35"}},
  {"id":"rung-thong-lam-04","name":"Rừng Thông - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Rừng Thông"],"vars":{"bg":"#eef4ed","paper":"#d9e6d5","ink":"#2e4b35","muted":"#b6cdb0","accent":"#4f7656","accent2":"#b6cdb0","hero":"#eef4ed","heroInk":"#2e4b35"}},
  {"id":"sen-hong-do-01","name":"Sen Hồng - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Sen Hồng"],"vars":{"bg":"#fff4f1","paper":"#f7ddd4","ink":"#783e42","muted":"#e9b7ae","accent":"#bf6b69","accent2":"#e9b7ae","hero":"#fff4f1","heroInk":"#783e42"}},
  {"id":"sen-hong-xanh-02","name":"Sen Hồng - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Sen Hồng"],"vars":{"bg":"#fff4f1","paper":"#f7ddd4","ink":"#783e42","muted":"#e9b7ae","accent":"#bf6b69","accent2":"#e9b7ae","hero":"#fff4f1","heroInk":"#783e42"}},
  {"id":"sen-hong-hong-03","name":"Sen Hồng - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Sen Hồng"],"vars":{"bg":"#fff4f1","paper":"#f7ddd4","ink":"#783e42","muted":"#e9b7ae","accent":"#bf6b69","accent2":"#e9b7ae","hero":"#fff4f1","heroInk":"#783e42"}},
  {"id":"sen-hong-lam-04","name":"Sen Hồng - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Sen Hồng"],"isNew":true,"vars":{"bg":"#fff4f1","paper":"#f7ddd4","ink":"#783e42","muted":"#e9b7ae","accent":"#bf6b69","accent2":"#e9b7ae","hero":"#fff4f1","heroInk":"#783e42"}},
  {"id":"bien-ngoc-do-01","name":"Biển Ngọc - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Biển Ngọc"],"vars":{"bg":"#edf8f7","paper":"#d3ece8","ink":"#20534f","muted":"#a7d5ce","accent":"#287f7a","accent2":"#a7d5ce","hero":"#edf8f7","heroInk":"#20534f"}},
  {"id":"bien-ngoc-xanh-02","name":"Biển Ngọc - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Biển Ngọc"],"vars":{"bg":"#edf8f7","paper":"#d3ece8","ink":"#20534f","muted":"#a7d5ce","accent":"#287f7a","accent2":"#a7d5ce","hero":"#edf8f7","heroInk":"#20534f"}},
  {"id":"bien-ngoc-hong-03","name":"Biển Ngọc - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Biển Ngọc"],"vars":{"bg":"#edf8f7","paper":"#d3ece8","ink":"#20534f","muted":"#a7d5ce","accent":"#287f7a","accent2":"#a7d5ce","hero":"#edf8f7","heroInk":"#20534f"}},
  {"id":"bien-ngoc-lam-04","name":"Biển Ngọc - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Biển Ngọc"],"vars":{"bg":"#edf8f7","paper":"#d3ece8","ink":"#20534f","muted":"#a7d5ce","accent":"#287f7a","accent2":"#a7d5ce","hero":"#edf8f7","heroInk":"#20534f"}},
  {"id":"dem-thien-ha-do-01","name":"Đêm Thiên Hà - Đỏ","layout":"gold","style":"Sang trọng","color":"Đỏ","tags":["Sang trọng","Đêm Thiên Hà"],"vars":{"bg":"#10172b","paper":"#202b49","ink":"#f3e8c8","muted":"#8f7b4b","accent":"#d7b96e","accent2":"#8f7b4b","hero":"#0a1020","heroInk":"#fff8e8"}},
  {"id":"dem-thien-ha-xanh-02","name":"Đêm Thiên Hà - Xanh","layout":"gold","style":"Sang trọng","color":"Xanh","tags":["Sang trọng","Đêm Thiên Hà"],"vars":{"bg":"#10172b","paper":"#202b49","ink":"#f3e8c8","muted":"#8f7b4b","accent":"#d7b96e","accent2":"#8f7b4b","hero":"#0a1020","heroInk":"#fff8e8"}},
  {"id":"dem-thien-ha-hong-03","name":"Đêm Thiên Hà - Hồng","layout":"gold","style":"Sang trọng","color":"Hồng","tags":["Sang trọng","Đêm Thiên Hà"],"vars":{"bg":"#10172b","paper":"#202b49","ink":"#f3e8c8","muted":"#8f7b4b","accent":"#d7b96e","accent2":"#8f7b4b","hero":"#0a1020","heroInk":"#fff8e8"}},
  {"id":"dem-thien-ha-lam-04","name":"Đêm Thiên Hà - Lam","layout":"gold","style":"Sang trọng","color":"Lam","tags":["Sang trọng","Đêm Thiên Hà"],"vars":{"bg":"#10172b","paper":"#202b49","ink":"#f3e8c8","muted":"#8f7b4b","accent":"#d7b96e","accent2":"#8f7b4b","hero":"#0a1020","heroInk":"#fff8e8"}},
  {"id":"do-son-truyen-thong-do-01","name":"Đỏ Son Truyền Thống - Đỏ","layout":"hy","style":"Truyền thống","color":"Đỏ","tags":["Truyền thống","Đỏ Son Truyền Thống"],"isNew":true,"vars":{"bg":"#fff0e6","paper":"#f3d4bd","ink":"#641a20","muted":"#d7aa55","accent":"#b4202a","accent2":"#d7aa55","hero":"#b4202a","heroInk":"#fff8e8"}},
  {"id":"do-son-truyen-thong-xanh-02","name":"Đỏ Son Truyền Thống - Xanh","layout":"hy","style":"Truyền thống","color":"Xanh","tags":["Truyền thống","Đỏ Son Truyền Thống"],"vars":{"bg":"#fff0e6","paper":"#f3d4bd","ink":"#641a20","muted":"#d7aa55","accent":"#b4202a","accent2":"#d7aa55","hero":"#b4202a","heroInk":"#641a20"}},
  {"id":"do-son-truyen-thong-hong-03","name":"Đỏ Son Truyền Thống - Hồng","layout":"hy","style":"Truyền thống","color":"Hồng","tags":["Truyền thống","Đỏ Son Truyền Thống"],"vars":{"bg":"#fff0e6","paper":"#f3d4bd","ink":"#641a20","muted":"#d7aa55","accent":"#b4202a","accent2":"#d7aa55","hero":"#b4202a","heroInk":"#641a20"}},
  {"id":"do-son-truyen-thong-lam-04","name":"Đỏ Son Truyền Thống - Lam","layout":"hy","style":"Truyền thống","color":"Lam","tags":["Truyền thống","Đỏ Son Truyền Thống"],"vars":{"bg":"#fff0e6","paper":"#f3d4bd","ink":"#641a20","muted":"#d7aa55","accent":"#b4202a","accent2":"#d7aa55","hero":"#b4202a","heroInk":"#641a20"}},
  {"id":"lam-co-dien-do-01","name":"Lam Cổ Điển - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Lam Cổ Điển"],"vars":{"bg":"#eef2f8","paper":"#dce4f0","ink":"#1c2e4b","muted":"#aebed6","accent":"#304d7a","accent2":"#aebed6","hero":"#eef2f8","heroInk":"#1c2e4b"}},
  {"id":"lam-co-dien-xanh-02","name":"Lam Cổ Điển - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Lam Cổ Điển"],"vars":{"bg":"#eef2f8","paper":"#dce4f0","ink":"#1c2e4b","muted":"#aebed6","accent":"#304d7a","accent2":"#aebed6","hero":"#eef2f8","heroInk":"#1c2e4b"}},
  {"id":"lam-co-dien-hong-03","name":"Lam Cổ Điển - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Lam Cổ Điển"],"vars":{"bg":"#eef2f8","paper":"#dce4f0","ink":"#1c2e4b","muted":"#aebed6","accent":"#304d7a","accent2":"#aebed6","hero":"#eef2f8","heroInk":"#1c2e4b"}},
  {"id":"lam-co-dien-lam-04","name":"Lam Cổ Điển - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Lam Cổ Điển"],"vars":{"bg":"#eef2f8","paper":"#dce4f0","ink":"#1c2e4b","muted":"#aebed6","accent":"#304d7a","accent2":"#aebed6","hero":"#eef2f8","heroInk":"#1c2e4b"}},
  {"id":"hong-champagne-do-01","name":"Hồng Champagne - Đỏ","layout":"gold","style":"Sang trọng","color":"Đỏ","tags":["Sang trọng","Hồng Champagne"],"vars":{"bg":"#f9f0ec","paper":"#f0d9ce","ink":"#67444a","muted":"#d9b28b","accent":"#b97973","accent2":"#d9b28b","hero":"#fffaf7","heroInk":"#fff8e8"}},
  {"id":"hong-champagne-xanh-02","name":"Hồng Champagne - Xanh","layout":"gold","style":"Sang trọng","color":"Xanh","tags":["Sang trọng","Hồng Champagne"],"isNew":true,"vars":{"bg":"#f9f0ec","paper":"#f0d9ce","ink":"#67444a","muted":"#d9b28b","accent":"#b97973","accent2":"#d9b28b","hero":"#fffaf7","heroInk":"#fff8e8"}},
  {"id":"hong-champagne-hong-03","name":"Hồng Champagne - Hồng","layout":"gold","style":"Sang trọng","color":"Hồng","tags":["Sang trọng","Hồng Champagne"],"vars":{"bg":"#f9f0ec","paper":"#f0d9ce","ink":"#67444a","muted":"#d9b28b","accent":"#b97973","accent2":"#d9b28b","hero":"#fffaf7","heroInk":"#fff8e8"}},
  {"id":"hong-champagne-lam-04","name":"Hồng Champagne - Lam","layout":"gold","style":"Sang trọng","color":"Lam","tags":["Sang trọng","Hồng Champagne"],"vars":{"bg":"#f9f0ec","paper":"#f0d9ce","ink":"#67444a","muted":"#d9b28b","accent":"#b97973","accent2":"#d9b28b","hero":"#fffaf7","heroInk":"#fff8e8"}},
  {"id":"olive-thanh-lich-do-01","name":"Olive Thanh Lịch - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Olive Thanh Lịch"],"vars":{"bg":"#f4f3e8","paper":"#e6e4cf","ink":"#3f432d","muted":"#c7c49b","accent":"#74784a","accent2":"#c7c49b","hero":"#f4f3e8","heroInk":"#3f432d"}},
  {"id":"olive-thanh-lich-xanh-02","name":"Olive Thanh Lịch - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Olive Thanh Lịch"],"vars":{"bg":"#f4f3e8","paper":"#e6e4cf","ink":"#3f432d","muted":"#c7c49b","accent":"#74784a","accent2":"#c7c49b","hero":"#f4f3e8","heroInk":"#3f432d"}},
  {"id":"olive-thanh-lich-hong-03","name":"Olive Thanh Lịch - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Olive Thanh Lịch"],"vars":{"bg":"#f4f3e8","paper":"#e6e4cf","ink":"#3f432d","muted":"#c7c49b","accent":"#74784a","accent2":"#c7c49b","hero":"#f4f3e8","heroInk":"#3f432d"}},
  {"id":"olive-thanh-lich-lam-04","name":"Olive Thanh Lịch - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Olive Thanh Lịch"],"vars":{"bg":"#f4f3e8","paper":"#e6e4cf","ink":"#3f432d","muted":"#c7c49b","accent":"#74784a","accent2":"#c7c49b","hero":"#f4f3e8","heroInk":"#3f432d"}},
  {"id":"dao-kem-do-01","name":"Đào Kem - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Đào Kem"],"vars":{"bg":"#fff4eb","paper":"#f7dfce","ink":"#7b4935","muted":"#edb99b","accent":"#cf815e","accent2":"#edb99b","hero":"#fff4eb","heroInk":"#7b4935"}},
  {"id":"dao-kem-xanh-02","name":"Đào Kem - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Đào Kem"],"vars":{"bg":"#fff4eb","paper":"#f7dfce","ink":"#7b4935","muted":"#edb99b","accent":"#cf815e","accent2":"#edb99b","hero":"#fff4eb","heroInk":"#7b4935"}},
  {"id":"dao-kem-hong-03","name":"Đào Kem - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Đào Kem"],"isNew":true,"vars":{"bg":"#fff4eb","paper":"#f7dfce","ink":"#7b4935","muted":"#edb99b","accent":"#cf815e","accent2":"#edb99b","hero":"#fff4eb","heroInk":"#7b4935"}},
  {"id":"dao-kem-lam-04","name":"Đào Kem - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Đào Kem"],"vars":{"bg":"#fff4eb","paper":"#f7dfce","ink":"#7b4935","muted":"#edb99b","accent":"#cf815e","accent2":"#edb99b","hero":"#fff4eb","heroInk":"#7b4935"}},
  {"id":"tim-khoi-do-01","name":"Tím Khói - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Tím Khói"],"vars":{"bg":"#f4f0f7","paper":"#e3d9ec","ink":"#4b3857","muted":"#c5b1d0","accent":"#80638f","accent2":"#c5b1d0","hero":"#f4f0f7","heroInk":"#4b3857"}},
  {"id":"tim-khoi-xanh-02","name":"Tím Khói - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Tím Khói"],"vars":{"bg":"#f4f0f7","paper":"#e3d9ec","ink":"#4b3857","muted":"#c5b1d0","accent":"#80638f","accent2":"#c5b1d0","hero":"#f4f0f7","heroInk":"#4b3857"}},
  {"id":"tim-khoi-hong-03","name":"Tím Khói - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Tím Khói"],"vars":{"bg":"#f4f0f7","paper":"#e3d9ec","ink":"#4b3857","muted":"#c5b1d0","accent":"#80638f","accent2":"#c5b1d0","hero":"#f4f0f7","heroInk":"#4b3857"}},
  {"id":"tim-khoi-lam-04","name":"Tím Khói - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Tím Khói"],"vars":{"bg":"#f4f0f7","paper":"#e3d9ec","ink":"#4b3857","muted":"#c5b1d0","accent":"#80638f","accent2":"#c5b1d0","hero":"#f4f0f7","heroInk":"#4b3857"}},
  {"id":"xanh-bac-ha-do-01","name":"Xanh Bạc Hà - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Xanh Bạc Hà"],"vars":{"bg":"#eff8f3","paper":"#d8eee2","ink":"#245541","muted":"#add8c1","accent":"#39856b","accent2":"#add8c1","hero":"#eff8f3","heroInk":"#245541"}},
  {"id":"xanh-bac-ha-xanh-02","name":"Xanh Bạc Hà - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Xanh Bạc Hà"],"vars":{"bg":"#eff8f3","paper":"#d8eee2","ink":"#245541","muted":"#add8c1","accent":"#39856b","accent2":"#add8c1","hero":"#eff8f3","heroInk":"#245541"}},
  {"id":"xanh-bac-ha-hong-03","name":"Xanh Bạc Hà - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Xanh Bạc Hà"],"vars":{"bg":"#eff8f3","paper":"#d8eee2","ink":"#245541","muted":"#add8c1","accent":"#39856b","accent2":"#add8c1","hero":"#eff8f3","heroInk":"#245541"}},
  {"id":"xanh-bac-ha-lam-04","name":"Xanh Bạc Hà - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Xanh Bạc Hà"],"isNew":true,"vars":{"bg":"#eff8f3","paper":"#d8eee2","ink":"#245541","muted":"#add8c1","accent":"#39856b","accent2":"#add8c1","hero":"#eff8f3","heroInk":"#245541"}},
  {"id":"den-vang-kim-do-01","name":"Đen Vàng Kim - Đỏ","layout":"gold","style":"Sang trọng","color":"Đỏ","tags":["Sang trọng","Đen Vàng Kim"],"vars":{"bg":"#171717","paper":"#292929","ink":"#f7e8bd","muted":"#8f7137","accent":"#d9b35c","accent2":"#8f7137","hero":"#101010","heroInk":"#fff8e8"}},
  {"id":"den-vang-kim-xanh-02","name":"Đen Vàng Kim - Xanh","layout":"gold","style":"Sang trọng","color":"Xanh","tags":["Sang trọng","Đen Vàng Kim"],"vars":{"bg":"#171717","paper":"#292929","ink":"#f7e8bd","muted":"#8f7137","accent":"#d9b35c","accent2":"#8f7137","hero":"#101010","heroInk":"#fff8e8"}},
  {"id":"den-vang-kim-hong-03","name":"Đen Vàng Kim - Hồng","layout":"gold","style":"Sang trọng","color":"Hồng","tags":["Sang trọng","Đen Vàng Kim"],"vars":{"bg":"#171717","paper":"#292929","ink":"#f7e8bd","muted":"#8f7137","accent":"#d9b35c","accent2":"#8f7137","hero":"#101010","heroInk":"#fff8e8"}},
  {"id":"den-vang-kim-lam-04","name":"Đen Vàng Kim - Lam","layout":"gold","style":"Sang trọng","color":"Lam","tags":["Sang trọng","Đen Vàng Kim"],"vars":{"bg":"#171717","paper":"#292929","ink":"#f7e8bd","muted":"#8f7137","accent":"#d9b35c","accent2":"#8f7137","hero":"#101010","heroInk":"#fff8e8"}},
  {"id":"do-man-do-01","name":"Đỏ Mận - Đỏ","layout":"hy","style":"Truyền thống","color":"Đỏ","tags":["Truyền thống","Đỏ Mận"],"vars":{"bg":"#f8edf0","paper":"#ead4dc","ink":"#4d1829","muted":"#c5a06a","accent":"#7f243e","accent2":"#c5a06a","hero":"#7f243e","heroInk":"#fff8e8"}},
  {"id":"do-man-xanh-02","name":"Đỏ Mận - Xanh","layout":"hy","style":"Truyền thống","color":"Xanh","tags":["Truyền thống","Đỏ Mận"],"vars":{"bg":"#f8edf0","paper":"#ead4dc","ink":"#4d1829","muted":"#c5a06a","accent":"#7f243e","accent2":"#c5a06a","hero":"#7f243e","heroInk":"#4d1829"}},
  {"id":"do-man-hong-03","name":"Đỏ Mận - Hồng","layout":"hy","style":"Truyền thống","color":"Hồng","tags":["Truyền thống","Đỏ Mận"],"vars":{"bg":"#f8edf0","paper":"#ead4dc","ink":"#4d1829","muted":"#c5a06a","accent":"#7f243e","accent2":"#c5a06a","hero":"#7f243e","heroInk":"#4d1829"}},
  {"id":"do-man-lam-04","name":"Đỏ Mận - Lam","layout":"hy","style":"Truyền thống","color":"Lam","tags":["Truyền thống","Đỏ Mận"],"vars":{"bg":"#f8edf0","paper":"#ead4dc","ink":"#4d1829","muted":"#c5a06a","accent":"#7f243e","accent2":"#c5a06a","hero":"#7f243e","heroInk":"#4d1829"}},
  {"id":"gom-dat-do-01","name":"Gốm Đất - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Gốm Đất"],"isNew":true,"vars":{"bg":"#f7eee8","paper":"#ead7ca","ink":"#603a2b","muted":"#d5ad94","accent":"#a45e43","accent2":"#d5ad94","hero":"#f7eee8","heroInk":"#603a2b"}},
  {"id":"gom-dat-xanh-02","name":"Gốm Đất - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Gốm Đất"],"vars":{"bg":"#f7eee8","paper":"#ead7ca","ink":"#603a2b","muted":"#d5ad94","accent":"#a45e43","accent2":"#d5ad94","hero":"#f7eee8","heroInk":"#603a2b"}},
  {"id":"gom-dat-hong-03","name":"Gốm Đất - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Gốm Đất"],"vars":{"bg":"#f7eee8","paper":"#ead7ca","ink":"#603a2b","muted":"#d5ad94","accent":"#a45e43","accent2":"#d5ad94","hero":"#f7eee8","heroInk":"#603a2b"}},
  {"id":"gom-dat-lam-04","name":"Gốm Đất - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Gốm Đất"],"vars":{"bg":"#f7eee8","paper":"#ead7ca","ink":"#603a2b","muted":"#d5ad94","accent":"#a45e43","accent2":"#d5ad94","hero":"#f7eee8","heroInk":"#603a2b"}},
  {"id":"xanh-suong-do-01","name":"Xanh Sương - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Xanh Sương"],"vars":{"bg":"#f0f5f7","paper":"#d9e6eb","ink":"#344f5b","muted":"#b2cbd4","accent":"#5c8292","accent2":"#b2cbd4","hero":"#f0f5f7","heroInk":"#344f5b"}},
  {"id":"xanh-suong-xanh-02","name":"Xanh Sương - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Xanh Sương"],"vars":{"bg":"#f0f5f7","paper":"#d9e6eb","ink":"#344f5b","muted":"#b2cbd4","accent":"#5c8292","accent2":"#b2cbd4","hero":"#f0f5f7","heroInk":"#344f5b"}},
  {"id":"xanh-suong-hong-03","name":"Xanh Sương - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Xanh Sương"],"vars":{"bg":"#f0f5f7","paper":"#d9e6eb","ink":"#344f5b","muted":"#b2cbd4","accent":"#5c8292","accent2":"#b2cbd4","hero":"#f0f5f7","heroInk":"#344f5b"}},
  {"id":"xanh-suong-lam-04","name":"Xanh Sương - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Xanh Sương"],"vars":{"bg":"#f0f5f7","paper":"#d9e6eb","ink":"#344f5b","muted":"#b2cbd4","accent":"#5c8292","accent2":"#b2cbd4","hero":"#f0f5f7","heroInk":"#344f5b"}},
  {"id":"vang-bo-do-01","name":"Vàng Bơ - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Vàng Bơ"],"vars":{"bg":"#fff9e8","paper":"#f7edc7","ink":"#65511c","muted":"#e0cf88","accent":"#b79535","accent2":"#e0cf88","hero":"#fff9e8","heroInk":"#65511c"}},
  {"id":"vang-bo-xanh-02","name":"Vàng Bơ - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Vàng Bơ"],"isNew":true,"vars":{"bg":"#fff9e8","paper":"#f7edc7","ink":"#65511c","muted":"#e0cf88","accent":"#b79535","accent2":"#e0cf88","hero":"#fff9e8","heroInk":"#65511c"}},
  {"id":"vang-bo-hong-03","name":"Vàng Bơ - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Vàng Bơ"],"vars":{"bg":"#fff9e8","paper":"#f7edc7","ink":"#65511c","muted":"#e0cf88","accent":"#b79535","accent2":"#e0cf88","hero":"#fff9e8","heroInk":"#65511c"}},
  {"id":"vang-bo-lam-04","name":"Vàng Bơ - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Vàng Bơ"],"vars":{"bg":"#fff9e8","paper":"#f7edc7","ink":"#65511c","muted":"#e0cf88","accent":"#b79535","accent2":"#e0cf88","hero":"#fff9e8","heroInk":"#65511c"}},
  {"id":"ruou-vang-do-01","name":"Rượu Vang - Đỏ","layout":"gold","style":"Sang trọng","color":"Đỏ","tags":["Sang trọng","Rượu Vang"],"vars":{"bg":"#2b101b","paper":"#421b2b","ink":"#f6e5c8","muted":"#91654c","accent":"#d6af72","accent2":"#91654c","hero":"#1b0a11","heroInk":"#fff8e8"}},
  {"id":"ruou-vang-xanh-02","name":"Rượu Vang - Xanh","layout":"gold","style":"Sang trọng","color":"Xanh","tags":["Sang trọng","Rượu Vang"],"vars":{"bg":"#2b101b","paper":"#421b2b","ink":"#f6e5c8","muted":"#91654c","accent":"#d6af72","accent2":"#91654c","hero":"#1b0a11","heroInk":"#fff8e8"}},
  {"id":"ruou-vang-hong-03","name":"Rượu Vang - Hồng","layout":"gold","style":"Sang trọng","color":"Hồng","tags":["Sang trọng","Rượu Vang"],"vars":{"bg":"#2b101b","paper":"#421b2b","ink":"#f6e5c8","muted":"#91654c","accent":"#d6af72","accent2":"#91654c","hero":"#1b0a11","heroInk":"#fff8e8"}},
  {"id":"ruou-vang-lam-04","name":"Rượu Vang - Lam","layout":"gold","style":"Sang trọng","color":"Lam","tags":["Sang trọng","Rượu Vang"],"vars":{"bg":"#2b101b","paper":"#421b2b","ink":"#f6e5c8","muted":"#91654c","accent":"#d6af72","accent2":"#91654c","hero":"#1b0a11","heroInk":"#fff8e8"}},
  {"id":"trang-tinh-khoi-do-01","name":"Trắng Tinh Khôi - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Trắng Tinh Khôi"],"vars":{"bg":"#faf9f6","paper":"#f0eee8","ink":"#504940","muted":"#d7d0c5","accent":"#a69b8b","accent2":"#d7d0c5","hero":"#faf9f6","heroInk":"#504940"}},
  {"id":"trang-tinh-khoi-xanh-02","name":"Trắng Tinh Khôi - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Trắng Tinh Khôi"],"vars":{"bg":"#faf9f6","paper":"#f0eee8","ink":"#504940","muted":"#d7d0c5","accent":"#a69b8b","accent2":"#d7d0c5","hero":"#faf9f6","heroInk":"#504940"}},
  {"id":"trang-tinh-khoi-hong-03","name":"Trắng Tinh Khôi - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Trắng Tinh Khôi"],"isNew":true,"vars":{"bg":"#faf9f6","paper":"#f0eee8","ink":"#504940","muted":"#d7d0c5","accent":"#a69b8b","accent2":"#d7d0c5","hero":"#faf9f6","heroInk":"#504940"}},
  {"id":"trang-tinh-khoi-lam-04","name":"Trắng Tinh Khôi - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Trắng Tinh Khôi"],"vars":{"bg":"#faf9f6","paper":"#f0eee8","ink":"#504940","muted":"#d7d0c5","accent":"#a69b8b","accent2":"#d7d0c5","hero":"#faf9f6","heroInk":"#504940"}},
  {"id":"xanh-co-vi-do-01","name":"Xanh Cổ Vị - Đỏ","layout":"hy","style":"Truyền thống","color":"Đỏ","tags":["Truyền thống","Xanh Cổ Vị"],"vars":{"bg":"#edf4f1","paper":"#d6e5df","ink":"#24463d","muted":"#c4a66a","accent":"#2d6b5d","accent2":"#c4a66a","hero":"#2d6b5d","heroInk":"#fff8e8"}},
  {"id":"xanh-co-vi-xanh-02","name":"Xanh Cổ Vị - Xanh","layout":"hy","style":"Truyền thống","color":"Xanh","tags":["Truyền thống","Xanh Cổ Vị"],"vars":{"bg":"#edf4f1","paper":"#d6e5df","ink":"#24463d","muted":"#c4a66a","accent":"#2d6b5d","accent2":"#c4a66a","hero":"#2d6b5d","heroInk":"#24463d"}},
  {"id":"xanh-co-vi-hong-03","name":"Xanh Cổ Vị - Hồng","layout":"hy","style":"Truyền thống","color":"Hồng","tags":["Truyền thống","Xanh Cổ Vị"],"vars":{"bg":"#edf4f1","paper":"#d6e5df","ink":"#24463d","muted":"#c4a66a","accent":"#2d6b5d","accent2":"#c4a66a","hero":"#2d6b5d","heroInk":"#24463d"}},
  {"id":"xanh-co-vi-lam-04","name":"Xanh Cổ Vị - Lam","layout":"hy","style":"Truyền thống","color":"Lam","tags":["Truyền thống","Xanh Cổ Vị"],"vars":{"bg":"#edf4f1","paper":"#d6e5df","ink":"#24463d","muted":"#c4a66a","accent":"#2d6b5d","accent2":"#c4a66a","hero":"#2d6b5d","heroInk":"#24463d"}},
  {"id":"mo-hong-do-01","name":"Mơ Hồng - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Mơ Hồng"],"vars":{"bg":"#fff4f3","paper":"#f8dfdc","ink":"#81454d","muted":"#efbfc2","accent":"#d17b83","accent2":"#efbfc2","hero":"#fff4f3","heroInk":"#81454d"}},
  {"id":"mo-hong-xanh-02","name":"Mơ Hồng - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Mơ Hồng"],"vars":{"bg":"#fff4f3","paper":"#f8dfdc","ink":"#81454d","muted":"#efbfc2","accent":"#d17b83","accent2":"#efbfc2","hero":"#fff4f3","heroInk":"#81454d"}},
  {"id":"mo-hong-hong-03","name":"Mơ Hồng - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Mơ Hồng"],"vars":{"bg":"#fff4f3","paper":"#f8dfdc","ink":"#81454d","muted":"#efbfc2","accent":"#d17b83","accent2":"#efbfc2","hero":"#fff4f3","heroInk":"#81454d"}},
  {"id":"mo-hong-lam-04","name":"Mơ Hồng - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Mơ Hồng"],"isNew":true,"vars":{"bg":"#fff4f3","paper":"#f8dfdc","ink":"#81454d","muted":"#efbfc2","accent":"#d17b83","accent2":"#efbfc2","hero":"#fff4f3","heroInk":"#81454d"}},
  {"id":"bau-troi-do-01","name":"Bầu Trời - Đỏ","layout":"minimal","style":"Tối giản","color":"Đỏ","tags":["Tối giản","Bầu Trời"],"vars":{"bg":"#eff6ff","paper":"#dbeafe","ink":"#25486f","muted":"#a8c9ed","accent":"#3d75b8","accent2":"#a8c9ed","hero":"#eff6ff","heroInk":"#25486f"}},
  {"id":"bau-troi-xanh-02","name":"Bầu Trời - Xanh","layout":"minimal","style":"Tối giản","color":"Xanh","tags":["Tối giản","Bầu Trời"],"vars":{"bg":"#eff6ff","paper":"#dbeafe","ink":"#25486f","muted":"#a8c9ed","accent":"#3d75b8","accent2":"#a8c9ed","hero":"#eff6ff","heroInk":"#25486f"}},
  {"id":"bau-troi-hong-03","name":"Bầu Trời - Hồng","layout":"minimal","style":"Tối giản","color":"Hồng","tags":["Tối giản","Bầu Trời"],"vars":{"bg":"#eff6ff","paper":"#dbeafe","ink":"#25486f","muted":"#a8c9ed","accent":"#3d75b8","accent2":"#a8c9ed","hero":"#eff6ff","heroInk":"#25486f"}},
  {"id":"bau-troi-lam-04","name":"Bầu Trời - Lam","layout":"minimal","style":"Tối giản","color":"Lam","tags":["Tối giản","Bầu Trời"],"vars":{"bg":"#eff6ff","paper":"#dbeafe","ink":"#25486f","muted":"#a8c9ed","accent":"#3d75b8","accent2":"#a8c9ed","hero":"#eff6ff","heroInk":"#25486f"}},
  {"id":"nau-ca-phe-do-01","name":"Nâu Cà Phê - Đỏ","layout":"gold","style":"Sang trọng","color":"Đỏ","tags":["Sang trọng","Nâu Cà Phê"],"vars":{"bg":"#f3ebe4","paper":"#dfcbb8","ink":"#4d3024","muted":"#c7a184","accent":"#87583e","accent2":"#c7a184","hero":"#fffaf5","heroInk":"#fff8e8"}},
  {"id":"nau-ca-phe-xanh-02","name":"Nâu Cà Phê - Xanh","layout":"gold","style":"Sang trọng","color":"Xanh","tags":["Sang trọng","Nâu Cà Phê"],"vars":{"bg":"#f3ebe4","paper":"#dfcbb8","ink":"#4d3024","muted":"#c7a184","accent":"#87583e","accent2":"#c7a184","hero":"#fffaf5","heroInk":"#fff8e8"}},
  {"id":"nau-ca-phe-hong-03","name":"Nâu Cà Phê - Hồng","layout":"gold","style":"Sang trọng","color":"Hồng","tags":["Sang trọng","Nâu Cà Phê"],"vars":{"bg":"#f3ebe4","paper":"#dfcbb8","ink":"#4d3024","muted":"#c7a184","accent":"#87583e","accent2":"#c7a184","hero":"#fffaf5","heroInk":"#fff8e8"}},
  {"id":"nau-ca-phe-lam-04","name":"Nâu Cà Phê - Lam","layout":"gold","style":"Sang trọng","color":"Lam","tags":["Sang trọng","Nâu Cà Phê"],"vars":{"bg":"#f3ebe4","paper":"#dfcbb8","ink":"#4d3024","muted":"#c7a184","accent":"#87583e","accent2":"#c7a184","hero":"#fffaf5","heroInk":"#fff8e8"}},
  {"id":"hoa-mau-don-do-01","name":"Hoa Mẫu Đơn - Đỏ","layout":"floral","style":"Hoa","color":"Đỏ","tags":["Hoa","Hoa Mẫu Đơn"],"isNew":true,"vars":{"bg":"#fff2f7","paper":"#f4d9e8","ink":"#6f2e4e","muted":"#e5b0ce","accent":"#b24e7d","accent2":"#e5b0ce","hero":"#fff2f7","heroInk":"#6f2e4e"}},
  {"id":"hoa-mau-don-xanh-02","name":"Hoa Mẫu Đơn - Xanh","layout":"floral","style":"Hoa","color":"Xanh","tags":["Hoa","Hoa Mẫu Đơn"],"vars":{"bg":"#fff2f7","paper":"#f4d9e8","ink":"#6f2e4e","muted":"#e5b0ce","accent":"#b24e7d","accent2":"#e5b0ce","hero":"#fff2f7","heroInk":"#6f2e4e"}},
  {"id":"hoa-mau-don-hong-03","name":"Hoa Mẫu Đơn - Hồng","layout":"floral","style":"Hoa","color":"Hồng","tags":["Hoa","Hoa Mẫu Đơn"],"vars":{"bg":"#fff2f7","paper":"#f4d9e8","ink":"#6f2e4e","muted":"#e5b0ce","accent":"#b24e7d","accent2":"#e5b0ce","hero":"#fff2f7","heroInk":"#6f2e4e"}},
  {"id":"hoa-mau-don-lam-04","name":"Hoa Mẫu Đơn - Lam","layout":"floral","style":"Hoa","color":"Lam","tags":["Hoa","Hoa Mẫu Đơn"],"vars":{"bg":"#fff2f7","paper":"#f4d9e8","ink":"#6f2e4e","muted":"#e5b0ce","accent":"#b24e7d","accent2":"#e5b0ce","hero":"#fff2f7","heroInk":"#6f2e4e"}},
  {"id":"ngoc-luc-bao-do-01","name":"Ngọc Lục Bảo - Đỏ","layout":"gold","style":"Sang trọng","color":"Đỏ","tags":["Sang trọng","Ngọc Lục Bảo"],"vars":{"bg":"#102b28","paper":"#1a403a","ink":"#f4e8c8","muted":"#8c7542","accent":"#d6b86a","accent2":"#8c7542","hero":"#091d1a","heroInk":"#fff8e8"}},
  {"id":"ngoc-luc-bao-xanh-02","name":"Ngọc Lục Bảo - Xanh","layout":"gold","style":"Sang trọng","color":"Xanh","tags":["Sang trọng","Ngọc Lục Bảo"],"vars":{"bg":"#102b28","paper":"#1a403a","ink":"#f4e8c8","muted":"#8c7542","accent":"#d6b86a","accent2":"#8c7542","hero":"#091d1a","heroInk":"#fff8e8"}},
  {"id":"ngoc-luc-bao-hong-03","name":"Ngọc Lục Bảo - Hồng","layout":"gold","style":"Sang trọng","color":"Hồng","tags":["Sang trọng","Ngọc Lục Bảo"],"vars":{"bg":"#102b28","paper":"#1a403a","ink":"#f4e8c8","muted":"#8c7542","accent":"#d6b86a","accent2":"#8c7542","hero":"#091d1a","heroInk":"#fff8e8"}},
  {"id":"ngoc-luc-bao-lam-04","name":"Ngọc Lục Bảo - Lam","layout":"gold","style":"Sang trọng","color":"Lam","tags":["Sang trọng","Ngọc Lục Bảo"],"vars":{"bg":"#102b28","paper":"#1a403a","ink":"#f4e8c8","muted":"#8c7542","accent":"#d6b86a","accent2":"#8c7542","hero":"#091d1a","heroInk":"#fff8e8"}}
];
// Chỉ giữ 8 mẫu hoàn chỉnh; các biến thể sinh tự động chưa có dữ liệu thiết kế riêng đã bị ẩn.
TEMPLATES.splice(8);

// Ten layout families are assigned across the whole collection.
const DESIGN_FAMILIES = ['classic', 'editorial', 'arch', 'frame', 'botanical', 'ornate', 'modern', 'letterpress', 'terrace', 'monogram'];
TEMPLATES.forEach((tpl, index) => { tpl.design = DESIGN_FAMILIES[index % DESIGN_FAMILIES.length]; });
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
  return `<div class="thumb l-${tpl.layout} d-${tpl.design || 'classic'}" style="${varStyle(tpl.vars)}" aria-hidden="true">
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
