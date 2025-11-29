import nodemailer from 'nodemailer';
import process from 'process';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server ready to send emails');
  }
});

const EmailService = {
  /**
   * @param {string} email
   * @param {string} otp 
   * @returns {Promise<boolean>}
   */
  sendOTP: async (email, otp) => {
    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Coffee Shop',
          address: process.env.SMTP_USER
        },
        to: email,
        subject: 'Reset Password - Kode OTP Anda',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background-color: #6F4E37;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 5px 5px;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #6F4E37;
                text-align: center;
                padding: 20px;
                background-color: #f5f5f5;
                border-radius: 5px;
                letter-spacing: 5px;
                margin: 20px 0;
              }
              .warning {
                color: #d9534f;
                font-size: 14px;
                margin-top: 20px;
              }
              .footer {
                text-align: center;
                color: #777;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reset Password</h1>
              </div>
              <div class="content">
                <p>Halo,</p>
                <p>Anda telah melakukan request reset password. Berikut adalah kode OTP Anda:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p>Kode OTP ini berlaku selama <strong>5 menit</strong>.</p>
                <p>Masukkan kode ini di aplikasi untuk melanjutkan proses reset password.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Reset Password - Coffee Shop
          
          Kode OTP Anda: ${otp}
          
          Kode ini berlaku selama 5 menit.
          
          Jika Anda tidak melakukan request ini, abaikan email ini.
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Gagal mengirim email OTP');
    }
  }
};

export default EmailService;