import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listUsers() {
    const { data, error } = await supabase.from('profiles').select('username, full_name, xp, level').order('xp', { ascending: false });
    if (error) console.log('ERROR:', error);
    else {
        console.log('USERS:', data);
    }
}
listUsers();
