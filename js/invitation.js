import { api } from './api.js';
import { divider, esc, floralCorner, fmtDateVi, hyMark, safeImg, safeUrl, varStyle } from './lib.js';

const lines = (text) =>
  String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `<span>${esc(l)}</span>`).join('');

function portrait(src, name, layout) {
  const s = safeImg(src);
  return `<div class="portrait portrait-${layout}">${
    s ? `<img src="${esc(s)}" alt="${esc(name)}" loading="lazy">` : `<div class="portrait-ph">${esc(name.trim().charAt(0).toUpperCase())}</div>`
  }</div>`;
}

function giftCard(title, g) {
  if (!g || !String(g.number || '').trim()) return '';
  return `<div class="gift-card"><h4>${esc(title)}</h4><p class="bank">${esc(g.bank)}</p><p class="acc">${esc(g.number)}</p><p class="holder">${esc(g.holder)}</p>
    <button type="button" class="copy-btn" data-copy="${esc(String(g.number).replace(/\s/g, ''))}">Sao chép</button></div>`;
}

const reveal = (inner) => `<div class="reveal">${inner}</div>`;

/**
 * Hiển thị thiệp vào `root`. Trả về hàm dọn dẹp (gỡ timer, sự kiện).
 * opts: { tpl, data, slug, guest, wishes, skipCover, rsvpDisabled }
 */
export function renderInvitation(root, { tpl, data, slug, guest, wishes = [], skipCover = false, rsvpDisabled = false }) {
  const L = tpl.layout;
  const d = fmtDateVi(data.date);
  // Giao diện thiệp không hiển thị ảnh chân dung, ảnh bìa hoặc album ảnh.
  const hero = '';
  const gallery = [];
  const map = safeUrl(data.mapUrl);
  const music = safeUrl(data.music);
  const target = `${data.date}T${data.partyTime || data.ceremonyTime || '09:00'}:00`;
  const hasGift = String(data.giftGroom?.number || '').trim() || String(data.giftBride?.number || '').trim();
  const wishList = wishes.filter((w) => String(w.message || '').trim()).slice(0, 30);

  const cover = `<div class="cover-content">
    ${L === 'hy' ? hyMark(96) : ''}
    <p class="kicker">Thiệp mời cưới</p>
    <h1 class="names"><span>${esc(data.groomName)}</span><i>&amp;</i><span>${esc(data.brideName)}</span></h1>
    <p class="cover-date">${esc(d.long)}</p>
    ${guest ? `<p class="cover-guest">Trân trọng kính mời<b>${esc(guest.name)}</b></p>` : ''}
  </div>`;

  root.innerHTML = `<div class="inv inv-${L}" style="${varStyle(tpl.vars)}">
  <div class="inv-shell js-ready">
    ${skipCover ? '' : `<div class="cover" role="dialog" aria-label="Thiệp mời"><div class="cover-inner">${cover}<button type="button" class="btn-open">Mở thiệp</button></div></div>`}
    ${music ? `<audio src="${esc(music)}" loop preload="none"></audio>${skipCover ? '<button type="button" class="music-btn" aria-label="Bật/tắt nhạc">♫</button>' : ''}` : ''}

    <header class="hero">
      ${L === 'floral' ? floralCorner('tl') + floralCorner('br') : ''}
      <div class="hero-inner">
        ${L === 'hy' ? hyMark(110) : ''}
        <p class="kicker">We are getting married</p>
        <h1 class="names big"><span>${esc(data.groomName)}</span><i>&amp;</i><span>${esc(data.brideName)}</span></h1>
        <p class="hero-date">${d.day} · ${d.month} · ${d.year}</p>
      </div>
      <div class="scroll-hint" aria-hidden="true">⌄</div>
    </header>

    <section class="sec invite">${reveal(`
      <p class="kicker">Trân trọng kính mời</p>
      <h2 class="guest-name">${esc(guest ? guest.name : 'Quý khách')}</h2>
      ${divider(L)}
      <p class="lead">Tới dự buổi tiệc chung vui cùng gia đình chúng tôi nhân dịp lễ thành hôn của hai con.</p>
      ${data.quote ? `<blockquote class="quote">“${esc(data.quote)}”</blockquote>` : ''}`)}</section>

    <section class="sec couple">${reveal(`
      <h2 class="sec-title">Cô Dâu &amp; Chú Rể</h2>
      ${divider(L)}
      <div class="couple-grid">
        <div class="person"><h3>${esc(data.groomFull)}</h3><p class="role">Chú rể</p>
          <p class="parents"><small>Con của</small>${lines(data.groomParents)}</p></div>
        <div class="heart" aria-hidden="true">♥</div>
        <div class="person"><h3>${esc(data.brideFull)}</h3><p class="role">Cô dâu</p>
          <p class="parents"><small>Con của</small>${lines(data.brideParents)}</p></div>
      </div>`)}</section>

    <section class="sec event">${reveal(`
      <h2 class="sec-title">Thời Gian &amp; Địa Điểm</h2>
      ${divider(L)}
      <div class="date-card"><span class="wd">${esc(d.weekday)}</span><span class="dd">${d.day}</span><span class="mm">Tháng ${d.month} · ${d.year}</span>${data.lunarDate ? `<em>${esc(data.lunarDate)}</em>` : ''}</div>
      <div class="countdown" aria-label="Đếm ngược đến ngày cưới">${['Ngày', 'Giờ', 'Phút', 'Giây'].map((l) => `<div class="cd-item"><b>--</b><span>${l}</span></div>`).join('')}</div>
      <div class="timeline">
        ${data.ceremonyTime ? `<div class="tl-item"><b>${esc(data.ceremonyTime)}</b><span>Lễ thành hôn</span></div>` : ''}
        ${data.partyTime ? `<div class="tl-item"><b>${esc(data.partyTime)}</b><span>Tiệc cưới</span></div>` : ''}
      </div>
      <div class="venue"><h3>${esc(data.venue)}</h3><p>${esc(data.address)}</p>
        ${map ? `<a class="btn-map" href="${esc(map)}" target="_blank" rel="noopener noreferrer">Xem bản đồ</a>` : ''}</div>`)}</section>

    ${String(data.story || '').trim() ? `<section class="sec story">${reveal(`<h2 class="sec-title">Chuyện Của Chúng Mình</h2>${divider(L)}<p class="story-text">${esc(data.story)}</p>`)}</section>` : ''}

    ${gallery.length ? `<section class="sec album">${reveal(`<h2 class="sec-title">Album Ảnh Cưới</h2>${divider(L)}
      <div class="gallery">${gallery.map((p, i) => `<button type="button" class="g-item" data-idx="${i}" aria-label="Xem ảnh ${i + 1}"><img src="${esc(p)}" alt="Ảnh cưới ${i + 1}" loading="lazy"></button>`).join('')}</div>
      <div class="lb-slot"></div>`)}</section>` : ''}

    ${hasGift ? `<section class="sec gift">${reveal(`<h2 class="sec-title">Hộp Mừng Cưới</h2>${divider(L)}
      <p class="lead">Sự hiện diện của bạn là niềm vui lớn nhất. Nếu muốn gửi lời chúc qua món quà nhỏ, bạn có thể dùng thông tin dưới đây.</p>
      <div class="gift-grid">${giftCard('Mừng chú rể', data.giftGroom)}${giftCard('Mừng cô dâu', data.giftBride)}</div>`)}</section>` : ''}

    <section class="sec rsvp" id="rsvp">${reveal(`<h2 class="sec-title">Xác Nhận Tham Dự</h2>${divider(L)}
      <p class="lead">Hãy cho chúng mình biết bạn có thể đến để chuẩn bị chu đáo hơn nhé.</p>
      <div class="rsvp-slot"></div>`)}</section>

    ${wishList.length ? `<section class="sec wishes">${reveal(`<h2 class="sec-title">Lời Chúc</h2>${divider(L)}
      <ul class="wish-list">${wishList.map((w) => `<li><b>${esc(w.name)}</b><p>${esc(w.message)}</p></li>`).join('')}</ul>`)}</section>` : ''}

    <footer class="inv-footer">
      <p class="thanks">Xin chân thành cảm ơn!</p>
      <p class="names small">${esc(data.groomName)} &amp; ${esc(data.brideName)}</p>
      <a href="./index.html" class="made">Tạo thiệp cưới online tại Duyên Thư</a>
    </footer>
  </div>
</div>`;

  const cleanups = [];
  const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); cleanups.push(() => el.removeEventListener(ev, fn, opt)); };

  /* --- màn hình mở thiệp + nhạc --- */
  const audio = root.querySelector('audio');
  const cover$ = root.querySelector('.cover');
  let musicBtn = root.querySelector('.music-btn');
  const setPlaying = (p) => { if (musicBtn) { musicBtn.classList.toggle('on', p); musicBtn.textContent = p ? '♪' : '♫'; } };
  function toggleMusic() {
    if (!audio) return;
    if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
    else { audio.pause(); setPlaying(false); }
  }
  if (musicBtn) on(musicBtn, 'click', toggleMusic);
  if (cover$) {
    document.body.style.overflow = 'hidden';
    cleanups.push(() => { document.body.style.overflow = ''; });
    on(root.querySelector('.btn-open'), 'click', () => {
      cover$.remove();
      document.body.style.overflow = '';
      window.scrollTo({ top: 0 });
      if (audio) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'music-btn';
        b.setAttribute('aria-label', 'Bật/tắt nhạc');
        b.textContent = '♫';
        root.querySelector('.inv-shell').appendChild(b);
        musicBtn = b;
        on(b, 'click', toggleMusic);
        audio.play().then(() => setPlaying(true)).catch(() => {});
      }
    });
  }

  /* --- hiện dần khi cuộn --- */
  const reveals = root.querySelectorAll('.reveal');
  if (typeof IntersectionObserver === 'undefined') reveals.forEach((r) => r.classList.add('in'));
  else {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach((r) => io.observe(r));
    cleanups.push(() => io.disconnect());
  }

  /* --- đếm ngược --- */
  const cd = root.querySelector('.countdown');
  if (cd) {
    const t = new Date(target).getTime();
    const tick = () => {
      const diff = isNaN(t) ? null : Math.max(0, t - Date.now());
      const parts = diff === null ? ['--', '--', '--', '--'] : [
        Math.floor(diff / 86400000), Math.floor((diff % 86400000) / 3600000), Math.floor((diff % 3600000) / 60000), Math.floor((diff % 60000) / 1000),
      ].map((n) => String(n).padStart(2, '0'));
      cd.querySelectorAll('b').forEach((b, i) => { b.textContent = parts[i]; });
    };
    tick();
    const iv = setInterval(tick, 1000);
    cleanups.push(() => clearInterval(iv));
  }

  /* --- sao chép số tài khoản --- */
  root.querySelectorAll('.copy-btn').forEach((btn) => {
    on(btn, 'click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Đã chép ✓';
        setTimeout(() => { btn.textContent = 'Sao chép'; }, 1800);
      } catch { /* bỏ qua */ }
    });
  });

  /* --- album + lightbox --- */
  const slot = root.querySelector('.lb-slot');
  if (slot && gallery.length) {
    let idx = null;
    const show = (i) => {
      idx = i;
      if (idx === null) { slot.innerHTML = ''; return; }
      slot.innerHTML = `<div class="lightbox" role="dialog" aria-modal="true">
        <button type="button" class="lb-close" aria-label="Đóng">×</button>
        <button type="button" class="lb-nav prev" aria-label="Ảnh trước">‹</button>
        <img src="${esc(gallery[idx])}" alt="">
        <button type="button" class="lb-nav next" aria-label="Ảnh sau">›</button></div>`;
    };
    const step = (n) => show((idx + n + gallery.length) % gallery.length);
    root.querySelectorAll('.g-item').forEach((b) => on(b, 'click', () => show(Number(b.dataset.idx))));
    on(slot, 'click', (e) => {
      if (idx === null) return;
      if (e.target.closest('.lb-close')) show(null);
      else if (e.target.closest('.prev')) step(-1);
      else if (e.target.closest('.next')) step(1);
      else if (e.target.classList.contains('lightbox')) show(null);
    });
    on(window, 'keydown', (e) => {
      if (idx === null) return;
      if (e.key === 'Escape') show(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }

  /* --- form RSVP --- */
  const rsvpSlot = root.querySelector('.rsvp-slot');
  rsvpSlot.innerHTML = `<form class="rsvp-form">
    <input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
    <label>Tên của bạn<input name="name" required maxlength="80" value="${esc(guest?.name || '')}" placeholder="Nhập họ tên" ${rsvpDisabled ? 'disabled' : ''}></label>
    <div class="radio-row" role="radiogroup" aria-label="Bạn có tham dự không">
      <label class="on"><input type="radio" name="attending" value="1" checked ${rsvpDisabled ? 'disabled' : ''}>Mình sẽ đến</label>
      <label><input type="radio" name="attending" value="0" ${rsvpDisabled ? 'disabled' : ''}>Rất tiếc, không đến được</label>
    </div>
    <label class="count-wrap">Số người tham dự<select name="count" ${rsvpDisabled ? 'disabled' : ''}>${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1} người</option>`).join('')}</select></label>
    <label>Lời chúc gửi đến cô dâu chú rể<textarea name="message" rows="3" maxlength="500" placeholder="Chúc hai bạn trăm năm hạnh phúc..." ${rsvpDisabled ? 'disabled' : ''}></textarea></label>
    <p class="form-error" hidden></p>
    <button type="submit" class="btn-send" ${rsvpDisabled ? 'disabled' : ''}>${rsvpDisabled ? 'Bản xem thử' : 'Gửi phản hồi'}</button>
  </form>`;
  const form = rsvpSlot.querySelector('form');
  const countWrap = form.querySelector('.count-wrap');
  form.querySelectorAll('input[name=attending]').forEach((r) => on(r, 'change', () => {
    const v = form.attending.value;
    form.querySelectorAll('.radio-row label').forEach((l) => l.classList.toggle('on', l.querySelector('input').value === v));
    countWrap.hidden = v !== '1';
  }));
  on(form, 'submit', async (e) => {
    e.preventDefault();
    if (rsvpDisabled) return;
    const btn = form.querySelector('.btn-send');
    const err = form.querySelector('.form-error');
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Đang gửi...';
    try {
      await api('submitRsvp', {
        slug,
        guest: guest?.token || '',
        website: form.website.value,
        name: form.name.value,
        attending: form.attending.value,
        count: form.count.value,
        message: form.message.value,
      });
      rsvpSlot.innerHTML = '<div class="rsvp-done"><b>Cảm ơn bạn!</b><p>Chúng mình đã nhận được phản hồi và lời chúc của bạn.</p></div>';
    } catch (x) {
      err.textContent = x.message;
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Gửi phản hồi';
    }
  });

  return () => cleanups.forEach((fn) => fn());
}
