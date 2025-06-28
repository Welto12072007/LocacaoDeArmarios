import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // For development, use Ethereal Email (fake SMTP)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  // For production, use real SMTP
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@lockersys.com',
      to: email,
      subject: 'LockerSys - Recuperação de Senha',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Recuperação de Senha - LockerSys</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LockerSys</h1>
              <p>Sistema de Gestão de Armários</p>
            </div>
            
            <div class="content">
              <h2>Recuperação de Senha</h2>
              <p>Olá,</p>
              <p>Você solicitou a recuperação de senha para sua conta no LockerSys.</p>
              <p>Clique no botão abaixo para redefinir sua senha:</p>
              
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
              
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px;">${resetUrl}</p>
              
              <p><strong>Este link expira em 30 minutos.</strong></p>
              
              <p>Se você não solicitou esta recuperação, ignore este email.</p>
            </div>
            
            <div class="footer">
              <p>© 2024 LockerSys. Todos os direitos reservados.</p>
              <p>Este é um email automático, não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Reset password email sent:', info.messageId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('❌ Error sending reset password email:', error);
    throw new Error('Failed to send reset password email');
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@lockersys.com',
      to: email,
      subject: 'Bem-vindo ao LockerSys!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bem-vindo ao LockerSys</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LockerSys</h1>
              <p>Sistema de Gestão de Armários</p>
            </div>
            
            <div class="content">
              <h2>Bem-vindo, ${name}!</h2>
              <p>Sua conta foi criada com sucesso no LockerSys.</p>
              <p>Agora você pode acessar o sistema e gerenciar armários, alunos e locações.</p>
              <p>Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.</p>
            </div>
            
            <div class="footer">
              <p>© 2024 LockerSys. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email, it's not critical
  }
};