// ====== CẤU HÌNH WEBSITE (sửa file này) ======
export const CONFIG = {
  // Dán URL Web App của Google Apps Script vào đây (xem README, bước 3).
  // Dạng: https://script.google.com/macros/s/AKfycb.../exec
  API_URL: '',

  SITE_NAME: 'Duyên Lành',

  // Giá & thời hạn (nhớ sửa cùng giá trị ở đầu file apps-script/Code.gs)
  PRICE: 99000,
  TRIAL_DAYS: 3,
  PAID_DAYS: 365,

  // Tài khoản nhận tiền (VietQR). BANK_ID theo vietqr.io: vcb, tcb, mb, acb, bidv, vietinbank, tpbank...
  BANK_ID: 'vcb',
  BANK_ACCOUNT: '0123456789',
  BANK_HOLDER: 'NGUYEN VAN A',
};
