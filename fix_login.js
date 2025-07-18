console.log('🔍 Testando conexão básica...');

// Importar dependências
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Configurar Supabase
const supabaseUrl = 'https://xkxdxatygoyoaifcfgcu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreGR4YXR5Z295b2FpZmNmZ2N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTEzNTAwMCwiZXhwIjoyMDY2NzExMDAwfQ.gBS_4NBNox7Q9ew__t2qcv5Zje07dxQqpNTtGcMOQqY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLogin() {
  try {
    console.log('✅ Conectando ao Supabase...');
    
    const email = 'wellington12072007@gmail.com';
    const senha = 'Kaue2019@';
    
    // Buscar usuário
    console.log('� Buscando usuário:', email);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.log('❌ Erro:', error.message);
      return;
    }
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado!');
    console.log('- Failed attempts:', user.failed_login_attempts);
    console.log('- Locked until:', user.locked_until);
    
    // Desbloquear conta
    console.log('🔧 Desbloqueando conta...');
    const { error: updateError } = await supabase
      .from('users')
      .update({
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq('email', email);
    
    if (updateError) {
      console.log('❌ Erro ao desbloquear:', updateError.message);
    } else {
      console.log('✅ Conta desbloqueada!');
    }
    
    // Testar senha
    console.log('🔑 Testando senha...');
    const isValid = await bcrypt.compare(senha, user.password);
    console.log('Resultado:', isValid ? '✅ SENHA CORRETA' : '❌ SENHA INCORRETA');
    
    if (!isValid) {
      console.log('🔧 Atualizando senha...');
      const newHash = await bcrypt.hash(senha, 12);
      const { error: pwdError } = await supabase
        .from('users')
        .update({ password: newHash })
        .eq('email', email);
      
      if (pwdError) {
        console.log('❌ Erro ao atualizar senha:', pwdError.message);
      } else {
        console.log('✅ Senha atualizada!');
      }
    }
    
    console.log('\n🎉 PRONTO! Tente fazer login agora com:');
    console.log('Email: wellington12072007@gmail.com');
    console.log('Senha: Kaue2019@');
    
  } catch (err) {
    console.error('💥 Erro:', err.message);
  }
}

fixLogin();
