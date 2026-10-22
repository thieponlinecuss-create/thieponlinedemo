import { api, getToken, setToken, uploadImage } from './api.js';
import { renderInvitation } from './invitation.js';
import {
  COLORS, PAID_DAYS, PRICE, SAMPLE, SITE_NAME, STYLES, TEMPLATES, TRIAL_DAYS,
  defaultData, esc, fmtTime, fmtVnd, getTemplate, inviteUrl, isPaid, lastWord, loadInvitationCss,
  mergeData, statusBadge, thumb, unloadInvitationCss,
} from './lib.js';
import { CONFIG } from './config.js';

const $app = document.getElementById('app');
const $header = document.getElementById('header');
const $footer = document.getElementById('footer');

const state = { user: null };
let pageCleanup = null;
let routeId = 0;

/* ================= tiện ích giao diện ================= */
const href = (p) => `#${p}`;
const nav = (p) => { location.hash = p; };
const loading = () => { $app.innerHTML = '<p class="muted center" style="padding:60px 20px">Đang tải...</p>'; };
const setTitle = (t) => { document.title = t ? `${t} | ${SITE_NAME}` : `Thiệp cưới online đẹp, gửi riêng từng khách | ${SITE_NAME}`; };
const safeNext = (n) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/quan-ly');
const alertBox = (cls, msg) => `<div class="alert ${cls}">${esc(msg)}</div>`;

function linkBox(url) {
  return `<div class="link-box"><input readonly value="${esc(url)}" aria-label="Đường link"><button type="button" class="btn btn-ghost btn-sm" data-copy="${esc(url)}">Chép link</button></div>`;
}
function bindCopy(root) {
  root.querySelectorAll('[data-copy]').forEach((b) => {
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        const old = b.textContent;
        b.textContent = 'Đã chép ✓';
        setTimeout(() => { b.textContent = old; }, 1800);
      } catch { /* bỏ qua */ }
    });
  });
  root.querySelectorAll('.link-box input').forEach((i) => i.addEventListener('focus', () => i.select()));
}

/* ================= khung trang ================= */
function renderChrome() {
  const u = state.user;
  $header.innerHTML = `<header class="site-header"><div class="wrap nav">
    <a href="./index.html" class="brand"><img src="assets/logo-header.png" alt="${esc(SITE_NAME)}" style="height:40px;width:auto"></a>
    <nav class="nav-links" aria-label="Chính">
      <a href="${href('/mau-thiep')}">Mẫu thiệp</a>
      <a href="${href('/bang-gia')}">Bảng giá</a>
      ${u ? `<a href="${href('/quan-ly')}">Thiệp của tôi</a>` : ''}
      ${u && u.isAdmin ? `<a href="${href('/admin')}">Admin</a>` : ''}
    </nav>
    <div class="nav-cta">${u
      ? '<button class="btn btn-ghost" type="button" id="logout">Đăng xuất</button>'
      : `<a href="${href('/dang-nhap')}" class="btn btn-ghost">Đăng nhập</a><a href="${href('/tao-thiep')}" class="btn btn-primary">Tạo thiệp</a>`}</div>
  </div></header>`;
  const lo = document.getElementById('logout');
  if (lo) lo.addEventListener('click', async () => {
    try { await api('logout'); } catch { /* bỏ qua */ }
    setToken('');
    state.user = null;
    renderChrome();
    nav('/');
  });

  $footer.innerHTML = `<footer class="site-footer"><div class="wrap foot">
    <div><b class="brand"><span class="brand-mark">♥</span> ${esc(SITE_NAME)}</b><p>Thiệp mời cưới online: đẹp, dễ làm, gửi riêng từng khách mời.</p></div>
    <div><b>Khám phá</b><a href="${href('/mau-thiep')}">Mẫu thiệp</a><a href="${href('/bang-gia')}">Bảng giá</a><a href="${href('/tao-thiep')}">Tạo thiệp</a></div>
    <div><b>Tài khoản</b><a href="${href('/dang-nhap')}">Đăng nhập</a><a href="${href('/dang-ky')}">Đăng ký</a><a href="${href('/quan-ly')}">Thiệp của tôi</a></div>
    <div><b>Liên hệ</b><a href="tel:${CONFIG.PHONE}">Hotline: ${esc(CONFIG.PHONE)}</a><a href="https://zalo.me/${CONFIG.ZALO}" target="_blank" rel="noopener">Zalo: ${esc(CONFIG.ZALO)}</a><a href="mailto:${CONFIG.EMAIL}">${esc(CONFIG.EMAIL)}</a></div>
  </div><p class="copy">© ${new Date().getFullYear()} ${esc(SITE_NAME)}. Mọi quyền được bảo lưu.</p></footer>`;
}

/* ================= trang chủ ================= */
const FEATURES = [
  ['💌', 'Link riêng từng khách', 'Mỗi khách nhận một đường link có tên riêng: "Trân trọng kính mời anh Hùng...". Thân mật hơn rất nhiều so với thiệp gửi chung.'],
  ['✅', 'RSVP & lời chúc', 'Khách xác nhận tham dự, chọn số người và gửi lời chúc. Bạn xem thống kê ngay trong trang quản lý.'],
  ['📍', 'Bản đồ & đếm ngược', 'Chỉ đường đến địa điểm bằng một chạm, đếm ngược từng giây đến ngày vui.'],
  ['🖼️', 'Album ảnh cưới', 'Tải ảnh lên, hiển thị gallery đẹp và xem toàn màn hình trên điện thoại.'],
  ['🎁', 'Hộp mừng cưới', 'Hiển thị số tài khoản nhận mừng cưới, khách sao chép chỉ với một nút bấm.'],
  ['🎵', 'Nhạc nền', 'Thêm bản nhạc yêu thích, tự phát khi khách mở thiệp.'],
];
const FAQ = [
  ['Tôi cần bao lâu để làm xong thiệp?', 'Thường khoảng 10 phút: nhập tên, ngày giờ, địa điểm, tải vài tấm ảnh là có thể gửi link ngay.'],
  ['Tôi có được dùng thử không?', `Bạn xem demo miễn phí tất cả mẫu. Khi chọn mẫu, bạn quét mã QR thanh toán ${fmtVnd(PRICE)}/thiệp để bắt đầu tạo thiệp.`],
  ['Có đổi mẫu thiệp được không?', 'Được. Nội dung đã nhập (tên, ngày, địa điểm, ảnh) được giữ nguyên khi bạn đổi sang mẫu khác.'],
  ['Khách mở thiệp có cần cài ứng dụng không?', 'Không. Thiệp là một trang web, mở được trên mọi điện thoại và trình duyệt.'],
];

function pageHome() {
  setTitle('');
  const featured = [TEMPLATES[2], TEMPLATES[4], TEMPLATES[6], TEMPLATES[0]];
  $app.innerHTML = `
  <section class="hero-home"><div class="wrap hero-grid">
    <div>
      <p class="eyebrow">Thiệp cưới online</p>
      <h1>Thiệp mời cưới <em>đẹp</em>, gửi riêng cho từng khách mời</h1>
      <p class="lead">${esc(SITE_NAME)} giúp bạn tạo thiệp cưới online trong 10 phút: chọn mẫu, nhập thông tin, chia sẻ link. Khách xác nhận tham dự và gửi lời chúc ngay trên thiệp.</p>
      <div class="hero-actions">
        <a href="${href('/tao-thiep')}" class="btn btn-primary btn-lg">Chọn mẫu thiệp</a>
        <a href="${href('/mau-thiep')}" class="btn btn-ghost btn-lg">Xem demo mẫu</a>
      </div>
      <p class="hero-note">Xem demo miễn phí · Chỉ ${fmtVnd(PRICE)}/thiệp</p>
    </div>
    <div class="hero-thumbs">${featured.map((t) => thumb(t)).join('')}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="center" style="margin-bottom:36px"><p class="eyebrow">Tính năng</p><h2>Mọi thứ bạn cần cho tấm thiệp cưới</h2></div>
    <div class="grid-3">${FEATURES.map(([ic, t, d]) => `<div class="feature"><div class="ic">${ic}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
  </div></section>

  <section class="section section-alt"><div class="wrap">
    <div class="center" style="margin-bottom:36px"><p class="eyebrow">Cách làm</p><h2>Ba bước, mười phút</h2></div>
    <div class="steps">
      <div class="step"><h3>Chọn mẫu</h3><p>Xem demo và chọn phong cách hợp với đám cưới của bạn.</p></div>
      <div class="step"><h3>Nhập thông tin</h3><p>Tên, ngày giờ, địa điểm, ảnh. Xem trước thay đổi ngay bên cạnh.</p></div>
      <div class="step"><h3>Gửi cho khách</h3><p>Tạo link riêng cho từng người, gửi qua Zalo, Messenger, tin nhắn.</p></div>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="center" style="margin-bottom:36px"><p class="eyebrow">Mẫu nổi bật</p><h2>Nhiều phong cách cho mọi đám cưới</h2></div>
    <div class="grid-4">${featured.map((t) => `<a href="${href(`/mau-thiep/${t.id}/demo`)}" style="text-decoration:none;color:inherit">${thumb(t)}<p class="center" style="margin-top:10px;font-weight:600;font-size:.95rem">${esc(t.name)}</p></a>`).join('')}</div>
    <p class="center" style="margin-top:28px"><a href="${href('/mau-thiep')}" class="btn btn-ghost">Xem tất cả mẫu</a></p>
  </div></section>

  <section class="section section-alt"><div class="wrap">
    <h2 class="center" style="margin-bottom:28px">Câu hỏi thường gặp</h2>
    <div class="faq">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div></section>`;
}

/* ================= thư viện mẫu ================= */
function pageTemplates({ query }) {
  setTitle('Mẫu thiệp mời đám cưới online đẹp');
  const kieu = query.get('kieu') || '';
  const mau = query.get('mau') || '';
  const link = (k, m) => {
    const p = new URLSearchParams();
    if (k) p.set('kieu', k);
    if (m) p.set('mau', m);
    const s = p.toString();
    return href(`/mau-thiep${s ? `?${s}` : ''}`);
  };
  const list = TEMPLATES.filter((t) => (!kieu || t.style === kieu) && (!mau || t.color === mau));
  $app.innerHTML = `<div class="wrap">
    <div class="page-head"><h1>Mẫu thiệp mời đám cưới</h1><p>Xem demo miễn phí · Chọn mẫu và thanh toán ${fmtVnd(PRICE)}/thiệp qua mã QR.</p></div>
    <div class="filters">
      <div class="chips"><b>Phong cách</b><a class="chip ${!kieu ? 'on' : ''}" href="${link('', mau)}">Tất cả</a>${STYLES.map((s) => `<a class="chip ${kieu === s ? 'on' : ''}" href="${link(s, mau)}">${esc(s)}</a>`).join('')}</div>
      <div class="chips"><b>Màu</b><a class="chip ${!mau ? 'on' : ''}" href="${link(kieu, '')}">Tất cả</a>${COLORS.map((c) => `<a class="chip ${mau === c ? 'on' : ''}" href="${link(kieu, c)}">${esc(c)}</a>`).join('')}</div>
    </div>
    ${list.length === 0
      ? `<div class="empty"><p>Không có mẫu phù hợp bộ lọc này.</p><a href="${href('/mau-thiep')}" class="btn btn-ghost">Xoá bộ lọc</a></div>`
      : `<div class="grid-4">${list.map((t) => `<div class="tpl-card">
          <a href="${href(`/mau-thiep/${t.id}/demo`)}" aria-label="Xem demo ${esc(t.name)}">${thumb(t)}</a>
          <h3>${esc(t.name)}</h3>
          <div class="tpl-meta">${t.isNew ? '<span class="tag tag-new">Mới</span>' : ''}${t.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>
          <div class="tpl-actions"><a href="${href(`/mau-thiep/${t.id}/demo`)}" class="btn btn-ghost">Xem demo</a><a href="${href(`/tao-thiep?mau=${t.id}`)}" class="btn btn-primary">Chọn mẫu · ${fmtVnd(PRICE)}</a></div>
        </div>`).join('')}</div>`}
    <div class="card center" style="margin:56px auto 0;max-width:640px"><h3>Chưa thấy mẫu ưng ý?</h3><p class="muted">Hãy cho chúng mình biết bạn đang tìm phong cách nào, chúng mình sẽ thiết kế thêm mẫu mới.</p></div>
  </div>`;
}

/* ================= demo mẫu ================= */
async function pageDemo({ params }, rid) {
  const tpl = getTemplate(params[0]);
  if (!tpl) return pageNotFound();
  setTitle(`Demo ${tpl.name}`);
  loading();
  await loadInvitationCss();
  if (rid !== routeId) return unloadInvitationCss();
  $app.innerHTML = `<div class="demo-bar"><a href="${href('/mau-thiep')}">← Tất cả mẫu</a><span>${esc(tpl.name)}</span>
    <a href="${href(`/tao-thiep?mau=${tpl.id}`)}" class="btn btn-primary btn-sm">Chọn mẫu này · ${fmtVnd(PRICE)}</a></div><div class="demo-spacer"></div><div id="demo-root"></div>`;
  const off = renderInvitation(document.getElementById('demo-root'), {
    tpl, data: SAMPLE, slug: 'demo',
    guest: { name: 'Anh Chị Khách Quý', token: '' },
    wishes: [
      { id: 1, name: 'Bạn Lan', attending: 1, count: 2, message: 'Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui nhé!' },
      { id: 2, name: 'Anh Tuấn', attending: 1, count: 1, message: 'Chúc mừng đám cưới! Hạnh phúc mãi mãi.' },
    ],
    skipCover: true, rsvpDisabled: true,
  });
  pageCleanup = () => { off(); unloadInvitationCss(); };
}

/* ================= bảng giá ================= */
function pagePricing() {
  setTitle('Bảng giá thiệp cưới online');
  $app.innerHTML = `<div class="wrap section">
    <div class="center" style="margin-bottom:36px"><p class="eyebrow">Bảng giá</p><h1>Một mức giá, đầy đủ tính năng</h1>
      <p class="muted">Xem demo miễn phí. Chọn mẫu và thanh toán một lần qua mã QR.</p></div>
    <div class="price-card"><p class="eyebrow">Mỗi thiệp</p><div class="amount">${fmtVnd(PRICE)}</div><p class="muted">dùng trong ${PAID_DAYS} ngày</p>
      <ul><li>Tất cả mẫu thiệp, đổi mẫu không giới hạn</li><li>Link riêng cho từng khách mời</li><li>RSVP, thống kê và lời chúc</li><li>Album ảnh, bản đồ, đếm ngược, nhạc nền</li><li>Hộp mừng cưới và sao chép số tài khoản</li></ul>
      <a href="${href('/tao-thiep')}" class="btn btn-primary btn-lg" style="width:100%">Chọn mẫu thiệp</a></div>
    <div class="faq" style="margin-top:56px">
      <details><summary>Thanh toán như thế nào?</summary><p>Bạn chuyển khoản qua mã VietQR hiển thị trong trang quản lý thiệp. Sau khi nhận được tiền, thiệp được kích hoạt thời hạn sử dụng đầy đủ.</p></details>
      <details><summary>Tôi có xem trước được không?</summary><p>Có. Tất cả mẫu đều có trang demo miễn phí. Sau khi thanh toán, thiệp của bạn được mở cho khách mời xem.</p></details>
    </div></div>`;
}

/* ================= đăng nhập / đăng ký ================= */
function pageAuth(mode) {
  return ({ query }) => {
    const isLogin = mode === 'login';
    setTitle(isLogin ? 'Đăng nhập' : 'Đăng ký');
    const next = safeNext(query.get('next') || '');
    $app.innerHTML = `<div class="auth"><form class="card" id="auth-form">
      <h1 style="font-size:2.2rem">${isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
      <p class="muted">${isLogin ? 'Chào mừng bạn quay lại.' : 'Đăng ký tài khoản để chọn mẫu và tạo thiệp cưới.'}</p>
      <div id="auth-err"></div>
      ${isLogin ? '' : '<label class="field">Họ tên<input name="name" required maxlength="80" autocomplete="name"></label>'}
      <label class="field">Email<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
      <label class="field">Mật khẩu<input name="password" type="password" required minlength="${isLogin ? 1 : 8}" autocomplete="${isLogin ? 'current-password' : 'new-password'}">${isLogin ? '' : '<span class="hint">Tối thiểu 8 ký tự</span>'}</label>
      <button class="btn btn-primary btn-lg" style="width:100%">${isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
      <p class="muted center" style="margin:18px 0 0;font-size:.92rem">${isLogin
        ? `Chưa có tài khoản? <a href="${href(`/dang-ky?next=${encodeURIComponent(next)}`)}">Đăng ký</a>`
        : `Đã có tài khoản? <a href="${href(`/dang-nhap?next=${encodeURIComponent(next)}`)}">Đăng nhập</a>`}</p>
    </form></div>`;
    const form = document.getElementById('auth-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const errBox = document.getElementById('auth-err');
      errBox.innerHTML = '';
      btn.disabled = true;
      btn.textContent = 'Đang xử lý...';
      try {
        const r = await api(isLogin ? 'login' : 'register', {
          name: form.name ? form.name.value : '',
          email: form.email.value,
          password: form.password.value,
        });
        setToken(r.token);
        state.user = r.user;
        renderChrome();
        nav(next);
      } catch (x) {
        errBox.innerHTML = alertBox('alert-err', x.message);
        btn.disabled = false;
        btn.textContent = isLogin ? 'Đăng nhập' : 'Đăng ký';
      }
    });
  };
}

/* ================= yêu cầu đăng nhập ================= */
function needUser(ctx) {
  if (state.user) return true;
  nav(`/dang-nhap?next=${encodeURIComponent(ctx.full)}`);
  return false;
}

/* ================= tạo thiệp ================= */
function pageCreate(ctx) {
  if (!needUser(ctx)) return;
  setTitle('Tạo thiệp cưới');
  const mau = ctx.query.get('mau');
  let sel = mau && getTemplate(mau) ? mau : TEMPLATES[0].id;
  $app.innerHTML = `<div class="wrap section" style="max-width:980px">
    <div class="center" style="margin-bottom:30px"><h1>Tạo thiệp cưới</h1><p class="muted">Nhập tên, chọn mẫu rồi quét mã QR thanh toán. Phần còn lại chỉnh sửa trong trang quản lý.</p></div>
    <form id="create-form"><div id="create-err"></div>
      <div class="card" style="margin-bottom:24px"><h3>1. Tên cô dâu &amp; chú rể</h3>
        <div class="row2">
          <label class="field">Chú rể<input name="groom" required maxlength="60" placeholder="VD: Minh Khang"></label>
          <label class="field">Cô dâu<input name="bride" required maxlength="60" placeholder="VD: Thu Hà"></label>
        </div>
        <p class="muted" style="margin:0;font-size:.88rem">Bạn có thể bổ sung ngày cưới, địa điểm, ảnh... ở bước chỉnh sửa tiếp theo.</p></div>
      <h3>2. Chọn mẫu thiệp</h3>
      <div class="picker" id="picker"></div>
      <button class="btn btn-primary btn-lg">Tiếp tục thanh toán ${fmtVnd(PRICE)}</button>
      <p class="muted" style="font-size:.88rem;margin-top:12px">Bạn sẽ nhận mã QR chuyển khoản ${fmtVnd(PRICE)}. Thiệp được kích hoạt sau khi chúng mình xác nhận thanh toán.</p>
    </form></div>`;
  const form = document.getElementById('create-form');
  const picker = document.getElementById('picker');
  const drawPicker = () => {
    const g = lastWord(form.groom.value) || 'Khang';
    const b = lastWord(form.bride.value) || 'Hà';
    picker.innerHTML = TEMPLATES.map((t) => `<label class="pick"><input type="radio" name="template" value="${t.id}" ${sel === t.id ? 'checked' : ''}>${thumb(t, { groom: g, bride: b })}<span>${esc(t.name)}</span></label>`).join('');
  };
  drawPicker();
  picker.addEventListener('change', (e) => { if (e.target.name === 'template') sel = e.target.value; });
  form.groom.addEventListener('input', drawPicker);
  form.bride.addEventListener('input', drawPicker);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-lg');
    const errBox = document.getElementById('create-err');
    errBox.innerHTML = '';
    const groom = form.groom.value.trim();
    const bride = form.bride.value.trim();
    btn.disabled = true;
    btn.textContent = 'Đang tạo...';
    try {
      const r = await api('createInvitation', { template: sel, groom, bride, data: defaultData(groom, bride) });
      try { await api('createPayment', { id: r.id }); } catch { /* tạo lại được ở tab Thanh toán */ }
      nav(`/quan-ly/${r.id}?tab=thanh-toan`);
    } catch (x) {
      errBox.innerHTML = alertBox('alert-err', x.message);
      btn.disabled = false;
      btn.textContent = 'Tiếp tục thanh toán';
    }
  });
}

/* ================= danh sách thiệp của tôi ================= */
async function pageDashboard(ctx, rid) {
  if (!needUser(ctx)) return;
  setTitle('Thiệp của tôi');
  loading();
  const list = await api('listInvitations');
  if (rid !== routeId) return;
  $app.innerHTML = `<div class="wrap">
    <div class="dash-head"><div><h1 style="margin-bottom:4px">Thiệp của tôi</h1><p class="muted" style="margin:0">Xin chào, ${esc(state.user.name)}.</p></div>
      <a href="${href('/tao-thiep')}" class="btn btn-primary">+ Tạo thiệp mới</a></div>
    ${list.length === 0
      ? `<div class="empty"><h3>Bạn chưa có thiệp nào</h3><p class="muted">Tạo thiệp đầu tiên chỉ mất vài phút.</p><a href="${href('/tao-thiep')}" class="btn btn-primary">Tạo thiệp cưới</a></div>`
      : `<div class="inv-list">${list.map((inv) => {
        const tpl = getTemplate(inv.template) || getTemplate('toi-gian-do');
        const d = mergeData(inv.data);
        return `<div class="inv-item">${thumb(tpl, { groom: lastWord(d.groomName), bride: lastWord(d.brideName) })}
          <div><h3>${esc(d.groomName)} &amp; ${esc(d.brideName)}</h3>
            <p class="muted" style="margin:2px 0 6px;font-size:.85rem">${esc(tpl.name)}</p>
            ${statusBadge(inv)}
            <div class="actions"><a href="${href(`/quan-ly/${inv.id}`)}" class="btn btn-primary btn-sm">Chỉnh sửa</a>
              <a href="${esc(inviteUrl(inv.slug) + '&preview=1')}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Xem thiệp</a></div></div></div>`;
      }).join('')}</div>`}
  </div>`;
}

/* ================= ô tải ảnh ================= */
function mountImageField(el, label, name, value, onChange) {
  el.innerHTML = `${esc(label)}
    <div class="img-field"><div class="img-thumb">${value ? `<img src="${esc(value)}" alt="">` : 'Chưa có'}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn btn-ghost btn-sm" data-act="pick">${value ? 'Đổi ảnh' : 'Chọn ảnh'}</button>
        ${value ? '<button type="button" class="btn btn-danger btn-sm" data-act="clear">Xoá</button>' : ''}</div>
      <input type="file" accept="image/jpeg,image/png,image/webp" hidden></div>
    <input type="hidden" name="${name}" value="${esc(value)}"><span class="hint" style="color:#c0392b"></span>`;
  const file = el.querySelector('input[type=file]');
  const hint = el.querySelector('.hint');
  el.querySelector('[data-act=pick]').addEventListener('click', () => file.click());
  const clear = el.querySelector('[data-act=clear]');
  if (clear) clear.addEventListener('click', () => mountImageField(el, label, name, '', onChange));
  file.addEventListener('change', async () => {
    const f = file.files[0];
    file.value = '';
    if (!f) return;
    const pick = el.querySelector('[data-act=pick]');
    pick.disabled = true;
    pick.textContent = 'Đang tải...';
    try {
      const url = await uploadImage(f);
      mountImageField(el, label, name, url, onChange);
    } catch (x) {
      pick.disabled = false;
      pick.textContent = value ? 'Đổi ảnh' : 'Chọn ảnh';
      hint.textContent = x.message;
    }
  });
}

function mountGallery(el, photos) {
  const draw = () => {
    el.innerHTML = `Album ảnh (tối đa 12 ảnh)
      ${photos.length ? `<div class="gal-grid">${photos.map((u, i) => `<div class="gal-item"><img src="${esc(u)}" alt=""><button type="button" aria-label="Xoá ảnh" data-del="${i}">×</button></div>`).join('')}</div>` : ''}
      <div><button type="button" class="btn btn-ghost btn-sm" data-act="add" ${photos.length >= 12 ? 'disabled' : ''}>+ Thêm ảnh</button></div>
      <input type="file" multiple accept="image/jpeg,image/png,image/webp" hidden><span class="hint" style="color:#c0392b"></span>`;
    const file = el.querySelector('input[type=file]');
    const hint = el.querySelector('.hint');
    el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { photos.splice(Number(b.dataset.del), 1); draw(); }));
    el.querySelector('[data-act=add]').addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const files = Array.from(file.files || []).slice(0, 12 - photos.length);
      file.value = '';
      if (!files.length) return;
      const add = el.querySelector('[data-act=add]');
      add.disabled = true;
      add.textContent = 'Đang tải...';
      let err = '';
      for (const f of files) {
        try { photos.push(await uploadImage(f)); } catch (x) { err = x.message; }
      }
      draw();
      if (err) el.querySelector('.hint').textContent = err;
    });
  };
  draw();
  return () => photos.slice();
}

/* ================= trang chỉnh sửa thiệp ================= */
const TABS = [['noi-dung', 'Nội dung'], ['khach', 'Khách mời'], ['phan-hoi', 'Phản hồi'], ['thanh-toan', 'Thanh toán']];

async function pageManage(ctx, rid) {
  if (!needUser(ctx)) return;
  setTitle('Chỉnh sửa thiệp');
  const id = Number(ctx.params[0]);
  const tab = TABS.some(([k]) => k === ctx.query.get('tab')) ? ctx.query.get('tab') : 'noi-dung';
  loading();
  let m;
  try {
    m = await api('getManage', { id });
  } catch (x) {
    if (rid !== routeId) return;
    $app.innerHTML = `<div class="wrap" style="padding:40px 0">${alertBox('alert-err', x.message)}<p><a href="${href('/quan-ly')}">← Thiệp của tôi</a></p></div>`;
    return;
  }
  if (rid !== routeId) return;
  const inv = { ...m.invitation, data: mergeData(m.invitation.data) };
  const reload = () => router();

  $app.innerHTML = `<div class="wrap" style="padding-bottom:40px">
    <div class="dash-head" style="padding-bottom:10px">
      <div><p style="margin:0"><a href="${href('/quan-ly')}">← Thiệp của tôi</a></p>
        <h1 style="margin:6px 0 8px">${esc(inv.data.groomName)} &amp; ${esc(inv.data.brideName)}</h1>${statusBadge(inv)}</div>
      <div style="min-width:280px;flex:0 1 420px"><p class="muted" style="margin:0 0 6px;font-size:.82rem">Link thiệp chung</p>${linkBox(inviteUrl(inv.slug))}</div>
    </div>
    <nav class="tabs" aria-label="Quản lý thiệp">${TABS.map(([k, l]) => `<a href="${href(`/quan-ly/${inv.id}?tab=${k}`)}" class="${tab === k ? 'on' : ''}">${l}</a>`).join('')}</nav>
    <div id="tab"></div>
    ${tab === 'noi-dung' ? '<div style="margin-top:40px;text-align:center"><button type="button" class="btn btn-danger btn-sm" id="del-inv">Xoá thiệp này</button></div>' : ''}
  </div>`;
  bindCopy($app);
  const $tab = document.getElementById('tab');

  if (tab === 'noi-dung') mountEditor($tab, inv);
  if (tab === 'khach') mountGuests($tab, inv, m.guests, reload);
  if (tab === 'phan-hoi') mountResponses($tab, m.stats, m.wishes);
  if (tab === 'thanh-toan') mountPayment($tab, inv, m.payments, reload);

  const del = document.getElementById('del-inv');
  if (del) del.addEventListener('click', async () => {
    if (!confirm('Xoá thiệp này? Toàn bộ khách mời và phản hồi sẽ bị xoá và không thể khôi phục.')) return;
    del.disabled = true;
    try {
      await api('deleteInvitation', { id: inv.id });
      nav('/quan-ly');
    } catch (x) {
      alert(x.message);
      del.disabled = false;
    }
  });
}

function mountEditor($tab, inv) {
  const data = inv.data;
  const g = (name) => esc(data[name] ?? '');
  $tab.innerHTML = `<div class="editor">
    <form class="editor-form" id="editor-form">
      <div class="fieldset"><h3>Mẫu thiệp</h3>
        <div class="picker" style="grid-template-columns:repeat(4,1fr);margin-bottom:0">${TEMPLATES.map((t) => `<label class="pick"><input type="radio" name="template" value="${t.id}" ${inv.template === t.id ? 'checked' : ''}>${thumb(t, { groom: lastWord(data.groomName), bride: lastWord(data.brideName) })}<span style="font-size:.75rem">${esc(t.name)}</span></label>`).join('')}</div></div>

      <div class="fieldset"><h3>Cô dâu &amp; chú rể</h3>
        <div class="row2">
          <label class="field">Tên chú rể (hiển thị ngắn)<input name="groomName" value="${g('groomName')}" required maxlength="60"></label>
          <label class="field">Tên cô dâu (hiển thị ngắn)<input name="brideName" value="${g('brideName')}" required maxlength="60"></label>
          <label class="field">Họ tên đầy đủ chú rể<input name="groomFull" value="${g('groomFull')}" maxlength="80"></label>
          <label class="field">Họ tên đầy đủ cô dâu<input name="brideFull" value="${g('brideFull')}" maxlength="80"></label>
          <label class="field">Bố mẹ chú rể<textarea name="groomParents" rows="2" maxlength="200">${g('groomParents')}</textarea><span class="hint">Mỗi người một dòng</span></label>
          <label class="field">Bố mẹ cô dâu<textarea name="brideParents" rows="2" maxlength="200">${g('brideParents')}</textarea></label>
        </div>
      </div>

      <div class="fieldset"><h3>Thời gian &amp; địa điểm</h3>
        <div class="row2">
          <label class="field">Ngày cưới<input type="date" name="date" value="${g('date')}" required></label>
          <label class="field">Ngày âm lịch (tuỳ chọn)<input name="lunarDate" value="${g('lunarDate')}" maxlength="80" placeholder="Tức ngày 15 tháng 11 năm ..."></label>
          <label class="field">Giờ lễ thành hôn<input type="time" name="ceremonyTime" value="${g('ceremonyTime')}"></label>
          <label class="field">Giờ tiệc cưới<input type="time" name="partyTime" value="${g('partyTime')}"></label>
        </div>
        <label class="field">Tên địa điểm<input name="venue" value="${g('venue')}" maxlength="120"></label>
        <label class="field">Địa chỉ<input name="address" value="${g('address')}" maxlength="200"></label>
        <label class="field">Link Google Maps<input name="mapUrl" value="${g('mapUrl')}" maxlength="500" placeholder="https://maps.google.com/..."><span class="hint">Mở Google Maps, chọn Chia sẻ, sao chép liên kết rồi dán vào đây.</span></label></div>

      <div class="fieldset"><h3>Lời nhắn</h3>
        <label class="field">Câu trích dẫn<input name="quote" value="${g('quote')}" maxlength="200"></label>
        <label class="field">Chuyện của chúng mình<textarea name="story" rows="5" maxlength="1200">${g('story')}</textarea></label>
        <label class="field">Nhạc nền (link file .mp3, tuỳ chọn)<input name="music" value="${g('music')}" maxlength="500" placeholder="https://.../nhac.mp3"></label></div>

      <div class="fieldset"><h3>Hộp mừng cưới (tuỳ chọn)</h3>
        <div class="row2">${[['giftGroom', 'Chú rể'], ['giftBride', 'Cô dâu']].map(([p, t]) => `<div><b style="font-size:.9rem">${t}</b>
          <label class="field" style="margin-top:8px">Ngân hàng<input name="${p}_bank" value="${esc(data[p].bank)}" maxlength="60"></label>
          <label class="field">Số tài khoản<input name="${p}_number" value="${esc(data[p].number)}" maxlength="40" inputmode="numeric"></label>
          <label class="field">Chủ tài khoản<input name="${p}_holder" value="${esc(data[p].holder)}" maxlength="80"></label></div>`).join('')}</div></div>

      <div class="save-bar"><span style="font-size:.92rem" id="save-msg"><span class="muted">Nhớ bấm Lưu để cập nhật thiệp.</span></span>
        <button class="btn btn-primary" id="save-btn">Lưu thay đổi</button></div>
    </form>
    <aside class="preview"><p class="muted" style="font-size:.85rem;text-align:center">Xem trước (cập nhật sau khi lưu)</p>
      <div class="preview-frame"><iframe id="preview" title="Xem trước thiệp"></iframe></div></aside>
  </div>`;

  const form = document.getElementById('editor-form');
  const frame = document.getElementById('preview');
  let rev = 0;
  const loadPreview = () => { frame.src = `${inviteUrl(inv.slug)}&preview=1&r=${++rev}`; };
  loadPreview();


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    const msg = document.getElementById('save-msg');
    const v = (n) => form.elements[n].value.trim();
    const gift = (p) => ({ bank: v(`${p}_bank`), number: v(`${p}_number`), holder: v(`${p}_holder`) });
    const payload = {
      id: inv.id,
      template: form.elements.template.value,
      data: {
        groomName: v('groomName'), brideName: v('brideName'), groomFull: v('groomFull'), brideFull: v('brideFull'),
        groomParents: v('groomParents'), brideParents: v('brideParents'),
        date: v('date'), lunarDate: v('lunarDate'), ceremonyTime: v('ceremonyTime'), partyTime: v('partyTime'),
        venue: v('venue'), address: v('address'), mapUrl: v('mapUrl'),
        heroPhoto: '', groomPhoto: '', bridePhoto: '', gallery: [],
        quote: v('quote'), story: v('story'),
        giftGroom: gift('giftGroom'), giftBride: gift('giftBride'), music: v('music'),
      },
    };
    btn.disabled = true;
    btn.textContent = 'Đang lưu...';
    try {
      await api('saveInvitation', payload);
      msg.innerHTML = '<span style="color:#17653c">Đã lưu thay đổi.</span>';
      loadPreview();
    } catch (x) {
      msg.innerHTML = `<span style="color:#a8261c">${esc(x.message)}</span>`;
    }
    btn.disabled = false;
    btn.textContent = 'Lưu thay đổi';
  });
}

function mountGuests($tab, inv, guests, reload) {
  $tab.innerHTML = `<div style="display:grid;gap:22px">
    <div class="card"><h3>Thêm khách mời</h3>
      <p class="muted">Mỗi khách nhận một link riêng có tên của họ. Nhập mỗi người một dòng, ví dụ: <i>Anh Hùng</i>, <i>Chị Lan &amp; gia đình</i>.</p>
      <form id="guest-form"><div id="guest-err"></div>
        <label class="field"><textarea name="names" rows="5" placeholder="Anh Hùng&#10;Chị Lan &amp; gia đình&#10;Bạn Minh" required></textarea></label>
        <button class="btn btn-primary">Tạo link cho khách</button></form></div>
    ${guests.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Khách mời</th><th>Link riêng</th><th></th></tr></thead><tbody>
      ${guests.map((g) => `<tr><td style="font-weight:500">${esc(g.name)}</td><td style="min-width:260px">${linkBox(inviteUrl(inv.slug, g.token))}</td>
        <td><button class="btn btn-danger btn-sm" data-del="${g.id}">Xoá</button></td></tr>`).join('')}</tbody></table></div>` : ''}
  </div>`;
  bindCopy($tab);
  const form = document.getElementById('guest-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      await api('addGuests', { id: inv.id, names: form.names.value });
      reload();
    } catch (x) {
      document.getElementById('guest-err').innerHTML = alertBox('alert-err', x.message);
      btn.disabled = false;
    }
  });
  $tab.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
    b.disabled = true;
    try {
      await api('deleteGuest', { id: inv.id, guest: Number(b.dataset.del) });
      reload();
    } catch (x) {
      alert(x.message);
      b.disabled = false;
    }
  }));
}

function mountResponses($tab, s, list) {
  $tab.innerHTML = `<div>
    <div class="stat-row">
      <div class="stat"><b>${s.yes}</b><span>Xác nhận đến</span></div>
      <div class="stat"><b>${s.people}</b><span>Tổng số người</span></div>
      <div class="stat"><b>${s.no}</b><span>Không đến được</span></div>
    </div>
    ${list.length === 0
      ? '<div class="empty"><p class="muted">Chưa có phản hồi nào. Hãy gửi link thiệp cho khách mời.</p></div>'
      : `<div class="table-wrap"><table class="table"><thead><tr><th>Tên</th><th>Tham dự</th><th>Số người</th><th>Lời chúc</th><th>Thời gian</th></tr></thead><tbody>
        ${list.map((w) => `<tr><td style="font-weight:500">${esc(w.name)}</td>
          <td>${w.attending ? '<span class="badge badge-ok">Có</span>' : '<span class="badge badge-off">Không</span>'}</td>
          <td>${w.attending ? w.count : '-'}</td><td style="max-width:320px">${esc(w.message)}</td>
          <td style="white-space:nowrap">${fmtTime(w.created_at)}</td></tr>`).join('')}</tbody></table></div>`}
  </div>`;
}

function mountPayment($tab, inv, payments, reload) {
  const pending = payments.find((p) => p.status === 'pending');
  const paid = isPaid(inv);
  const { BANK_ID: bank, BANK_ACCOUNT: acc, BANK_HOLDER: holder } = CONFIG;
  const configured = bank && acc && acc !== '0123456789';
  $tab.innerHTML = `<div style="display:grid;gap:22px">
    ${paid ? `<div class="alert alert-ok" style="margin:0">Thiệp đã được kích hoạt đến ${new Date(inv.paid_until).toLocaleDateString('vi-VN')}. Cảm ơn bạn!</div>` : ''}
    ${!pending ? `<div class="card"><h3>${paid ? 'Gia hạn thiệp' : 'Kích hoạt thiệp'}</h3>
      <p class="muted">Phí ${fmtVnd(PRICE)} cho ${PAID_DAYS} ngày sử dụng, đầy đủ tính năng. Chọn mẫu thiệp ưng ý rồi quét mã QR để kích hoạt.</p>
      <div id="pay-err"></div><button class="btn btn-primary" id="pay-btn">Thanh toán ${fmtVnd(PRICE)}</button></div>` : ''}
    ${pending ? `<div class="card"><h3>Chuyển khoản ${fmtVnd(pending.amount)}</h3><div class="pay-grid">
      <div>${configured
        ? `<img class="qr" alt="Mã VietQR thanh toán" src="https://img.vietqr.io/image/${encodeURIComponent(bank)}-${encodeURIComponent(acc)}-compact2.png?amount=${pending.amount}&addInfo=${encodeURIComponent(pending.code)}&accountName=${encodeURIComponent(holder)}">`
        : alertBox('alert-info', 'Quản trị viên chưa cấu hình tài khoản nhận tiền (BANK_ID, BANK_ACCOUNT trong js/config.js).')}</div>
      <div><dl class="kv"><dt>Ngân hàng</dt><dd>${esc(bank.toUpperCase())}</dd><dt>Số tài khoản</dt><dd>${esc(acc)}</dd><dt>Chủ tài khoản</dt><dd>${esc(holder)}</dd>
        <dt>Số tiền</dt><dd>${fmtVnd(pending.amount)}</dd><dt>Nội dung CK</dt><dd>${esc(pending.code)}</dd></dl>
        <div class="alert alert-info" style="margin-top:18px">Vui lòng giữ nguyên nội dung chuyển khoản. Thiệp sẽ được kích hoạt sau khi chúng mình xác nhận đã nhận tiền (thường trong vài giờ). Cần hỗ trợ nhanh: Zalo ${esc(CONFIG.ZALO)}.</div></div>
    </div></div>` : ''}
    ${payments.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Mã</th><th>Số tiền</th><th>Trạng thái</th><th>Thời gian</th></tr></thead><tbody>
      ${payments.map((p) => `<tr><td>${esc(p.code)}</td><td>${fmtVnd(p.amount)}</td><td>${
        p.status === 'confirmed' ? '<span class="badge badge-ok">Đã xác nhận</span>'
          : p.status === 'pending' ? '<span class="badge badge-pending">Chờ xác nhận</span>'
            : '<span class="badge badge-off">Từ chối</span>'}</td><td>${fmtTime(p.created_at)}</td></tr>`).join('')}</tbody></table></div>` : ''}
  </div>`;
  const btn = document.getElementById('pay-btn');
  if (btn) btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      await api('createPayment', { id: inv.id });
      reload();
    } catch (x) {
      document.getElementById('pay-err').innerHTML = alertBox('alert-err', x.message);
      btn.disabled = false;
    }
  });
}

/* ================= quản trị ================= */
async function pageAdmin(ctx, rid) {
  if (!needUser(ctx)) return;
  if (!state.user.isAdmin) return nav('/');
  setTitle('Quản trị');
  loading();
  const r = await api('adminOverview');
  if (rid !== routeId) return;
  $app.innerHTML = `<div class="wrap" style="padding:40px 0"><h1>Quản trị</h1>
    <div class="stat-row">
      <div class="stat"><b>${r.users}</b><span>Người dùng</span></div>
      <div class="stat"><b>${r.invitations}</b><span>Thiệp đã tạo</span></div>
      <div class="stat"><b>${r.paid}</b><span>Thiệp đã kích hoạt</span></div>
    </div>
    <h3>Thanh toán</h3>
    ${r.payments.length === 0 ? '<div class="empty"><p class="muted">Chưa có giao dịch nào.</p></div>'
      : `<div class="table-wrap"><table class="table"><thead><tr><th>Mã CK</th><th>Người dùng</th><th>Thiệp</th><th>Số tiền</th><th>Thời gian</th><th>Trạng thái</th></tr></thead><tbody>
      ${r.payments.map((p) => `<tr><td style="font-weight:600">${esc(p.code)}</td>
        <td>${esc(p.name)}<br><span class="muted">${esc(p.email)}</span></td>
        <td><a href="${esc(inviteUrl(p.slug))}" target="_blank" rel="noopener">${esc(p.title)}</a></td>
        <td>${fmtVnd(p.amount)}</td><td>${fmtTime(p.created_at)}</td>
        <td>${p.status === 'pending'
          ? `<div style="display:flex;gap:6px"><button class="btn btn-primary btn-sm" data-pay="confirm" data-id="${p.id}">Xác nhận</button><button class="btn btn-danger btn-sm" data-pay="reject" data-id="${p.id}">Từ chối</button></div>`
          : p.status === 'confirmed' ? '<span class="badge badge-ok">Đã xác nhận</span>' : '<span class="badge badge-off">Từ chối</span>'}</td></tr>`).join('')}</tbody></table></div>`}
  </div>`;
  $app.querySelectorAll('[data-pay]').forEach((b) => b.addEventListener('click', async () => {
    b.disabled = true;
    try {
      await api(b.dataset.pay === 'confirm' ? 'confirmPayment' : 'rejectPayment', { payment: Number(b.dataset.id) });
      router();
    } catch (x) {
      alert(x.message);
      b.disabled = false;
    }
  }));
}

/* ================= 404 ================= */
function pageNotFound() {
  setTitle('Không tìm thấy trang');
  $app.innerHTML = `<div style="min-height:70vh;display:grid;place-items:center;text-align:center;padding:24px"><div>
    <h1>Không tìm thấy trang</h1><p class="muted">Đường dẫn bạn mở không tồn tại hoặc đã bị xoá.</p>
    <a href="${href('/')}" class="btn btn-primary">Về trang chủ</a></div></div>`;
}

/* ================= router ================= */
const ROUTES = [
  [/^\/$/, pageHome],
  [/^\/mau-thiep$/, pageTemplates],
  [/^\/mau-thiep\/([^/]+)\/demo$/, pageDemo],
  [/^\/bang-gia$/, pagePricing],
  [/^\/dang-nhap$/, pageAuth('login')],
  [/^\/dang-ky$/, pageAuth('register')],
  [/^\/tao-thiep$/, pageCreate],
  [/^\/quan-ly$/, pageDashboard],
  [/^\/quan-ly\/(\d+)$/, pageManage],
  [/^\/admin$/, pageAdmin],
];

async function router() {
  const rid = ++routeId;
  if (pageCleanup) { try { pageCleanup(); } catch { /* bỏ qua */ } pageCleanup = null; }
  unloadInvitationCss();
  document.body.style.overflow = '';

  const full = location.hash.slice(1) || '/';
  const qi = full.indexOf('?');
  const path = qi === -1 ? full : full.slice(0, qi);
  const query = new URLSearchParams(qi === -1 ? '' : full.slice(qi + 1));

  for (const [re, fn] of ROUTES) {
    const m = re.exec(path);
    if (!m) continue;
    try {
      await fn({ params: m.slice(1), query, full, path }, rid);
    } catch (x) {
      if (rid !== routeId) return;
      if (x.code === 'auth') {
        state.user = null;
        setToken('');
        renderChrome();
        return nav(`/dang-nhap?next=${encodeURIComponent(full)}`);
      }
      $app.innerHTML = `<div class="wrap" style="padding:40px 0">${alertBox('alert-err', x.message)}</div>`;
    }
    if (rid === routeId && !pageCleanup) window.scrollTo(0, 0);
    return;
  }
  pageNotFound();
}

async function boot() {
  if (getToken()) {
    try {
      state.user = await api('me');
    } catch (x) {
      if (x.code === 'auth') setToken('');
    }
  }
  renderChrome();
  window.addEventListener('hashchange', router);
  router();
}

boot();
