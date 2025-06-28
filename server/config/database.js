import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please set up Supabase connection.');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize database with tables and policies
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('📋 Tables not found. Please run the migration to create tables.');
      console.log('💡 The migration file has been created in supabase/migrations/');
      return;
    }

    if (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }

    // Check if default admin user exists
    const { data: existingAdmin, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@lockers.com')
      .single();

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ Error checking admin user:', adminError);
      throw adminError;
    }

    if (!existingAdmin) {
      // Password: admin123 (hashed with bcrypt cost 12)
      const hashedPassword = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G';
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email: 'admin@lockers.com',
            password: hashedPassword,
            role: 'admin'
          }
        ]);

      if (insertError) {
        console.error('❌ Error creating admin user:', insertError);
        throw insertError;
      }
      
      console.log('✅ Default admin user created');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};