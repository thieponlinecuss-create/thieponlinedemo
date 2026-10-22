import { CONFIG } from './config.js';

const TOKEN_KEY = 'dl_token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* bỏ qua */ }
};

/**
 * Gọi backend Google Apps Script.
 * Gửi dạng text/plain để trình duyệt không cần preflight CORS.
 */
export async function api(action, payload = {}) {
  if (!CONFIG.API_URL) {
    throw new Error('Chưa cấu hình API_URL trong js/config.js (xem README, bước 3).');
  }
  let res;
  try {
    res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token: getToken(), payload }),
    });
  } catch {
    throw new Error('Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.');
  }
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Máy chủ trả về dữ liệu không hợp lệ. Kiểm tra lại URL Apps Script và quyền truy cập "Anyone".');
  }
  if (!json.ok) {
    const err = new Error(json.error || 'Đã có lỗi xảy ra.');
    err.code = json.code;
    throw err;
  }
  return json.data;
}

/** Thu nhỏ ảnh ở trình duyệt (tối đa 1600px) rồi tải lên Google Drive. */
export async function uploadImage(file) {
  let blob = file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
    const out = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.86));
    if (out) blob = out;
  } catch {
    /* dùng ảnh gốc nếu trình duyệt không xử lý được */
  }
  if (blob.size > 6 * 1024 * 1024) throw new Error('Ảnh quá lớn (tối đa 6MB).');
  const base64 = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(new Error('Không đọc được ảnh.'));
    r.readAsDataURL(blob);
  });
  const j = await api('uploadImage', { base64 });
  return j.url;
}
