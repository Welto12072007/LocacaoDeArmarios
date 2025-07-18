export const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const edgeFunctionUrl = 'https://xkxdxatygoyoaifcfgcu.functions.supabase.co/send-reset-email';

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` // se necessário
      },
      body: JSON.stringify({
        email,
        resetUrl
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send reset password email via Edge Function');
    }

    console.log('✅ Reset password email sent via Edge Function');
    return true;
  } catch (error) {
    console.error('❌ Error sending reset password email:', error);
    throw new Error('Failed to send reset password email');
  }
};

export const sendWelcomeEmail = async (email, name) => {
  // Se quiser implementar via Edge Function, faça algo similar ao reset
  // Caso não use mais, pode remover esta função
};
