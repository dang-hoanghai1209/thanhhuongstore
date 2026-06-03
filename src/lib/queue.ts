import Queue from 'bull';
import nodemailer from 'nodemailer';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Setup Bull Queue with exponential retry policy
export const emailQueue = new Queue('email-delivery', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5 seconds initial delay
    },
    removeOnComplete: true, // Auto clean up successful tasks
  },
});

// Configure Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const SMTP_FROM = process.env.SMTP_FROM || 'Thanh Hương Store <no-reply@thanhhuongstore.vn>';

// Worker processing logic
if (process.env.START_EMAIL_WORKER === 'true') {
  console.log('Registering email worker tasks...');

  emailQueue.process(5, async (job) => {
    const { type, data } = job.data;
    let htmlContent = '';
    let subject = '';

    switch (type) {
      case 'order-confirmation':
        subject = `[Thanh Hương Store] Xác nhận đơn hàng #${data.orderNumber}`;
        htmlContent = `
          <h2>Cảm ơn bạn đã mua sắm tại Thanh Hương Store!</h2>
          <p>Xin chào ${data.customerName},</p>
          <p>Đơn hàng <strong>#${data.orderNumber}</strong> của bạn đã được tiếp nhận thành công.</p>
          <p>Tổng thanh toán: <strong>${data.totalAmount.toLocaleString()}đ</strong></p>
          <p>Chúng tôi sẽ xử lý và liên hệ với bạn trong thời gian sớm nhất.</p>
        `;
        break;

      case 'order-status-update':
        subject = `[Thanh Hương Store] Cập nhật đơn hàng #${data.orderNumber}`;
        htmlContent = `
          <p>Xin chào ${data.firstName},</p>
          <p>Đơn hàng <strong>#${data.orderNumber}</strong> đã chuyển sang trạng thái: <strong>${data.statusLabel}</strong>.</p>
        `;
        break;

      case 'password-reset':
        subject = '[Thanh Hương Store] Yêu cầu đặt lại mật khẩu';
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${data.resetToken}`;
        htmlContent = `
          <p>Xin chào ${data.firstName},</p>
          <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu cho tài khoản Thanh Hương Store.</p>
          <p>Vui lòng click vào link dưới đây để tiếp tục (hết hạn trong 1 giờ):</p>
          <a href="${resetLink}" target="_blank">${resetLink}</a>
        `;
        break;

      case 'wholesale-approved':
        subject = '[Thanh Hương Store] Chúc mừng! Hồ sơ bán sỉ (B2B) đã được duyệt';
        htmlContent = `
          <p>Xin chào ${data.firstName},</p>
          <p>Đại diện của doanh nghiệp <strong>${data.companyName}</strong>,</p>
          <p>Hồ sơ đăng ký tài khoản bán sỉ (B2B) của bạn đã được ban quản trị Thanh Hương Store phê duyệt.</p>
          <p>Bây giờ bạn có thể đăng nhập để hưởng mức giá ưu đãi sỉ và chiết khấu bậc thang.</p>
        `;
        break;

      case 'low-stock-alert':
        subject = '[Thanh Hương Store - Alert] Cảnh báo sản phẩm sắp hết hàng';
        const itemsList = data.variants
          .map((v: any) => `<li>Variant [SKU: ${v.sku}] - ${v.name} (Tồn kho: ${v.stock})</li>`)
          .join('');
        htmlContent = `
          <h3>Cảnh báo tồn kho thấp!</h3>
          <p>Các phân loại sản phẩm sau đang ở mức tồn kho dưới hạn mức an toàn:</p>
          <ul>${itemsList}</ul>
        `;
        break;

      default:
        throw new Error(`Unknown job email type: ${type}`);
    }

    // Send email using SMTP
    await transporter.sendMail({
      from: SMTP_FROM,
      to: data.to,
      subject,
      html: htmlContent,
    });
    
    console.log(`[Email Queue] Successfully sent email type: ${type} to ${data.to}`);
  });
}
