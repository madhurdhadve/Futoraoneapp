import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.join(__dirname, '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error('Could not read .env file');
    process.exit(1);
}

const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        // Join the rest back in case value contains =
        let value = parts.slice(1).join('=').trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        env[key] = value;
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyAdminFix() {
    console.log('🔧 Applying Admin RLS fix...');

    const sqlQueries = [
        // Drop existing policies if they exist to avoid errors
        `DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;`,
        `DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;`,

        // Create new policies
        `CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);`,
        `CREATE POLICY "Admins can delete any profile" ON public.profiles FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);`
    ];

    for (const query of sqlQueries) {
        console.log(`Executing: ${query}`);
        const { error } = await supabase.rpc('exec_sql', { query });
        if (error) {
            console.error(`❌ Error: ${error.message}`);
            // If exec_sql doesn't exist, we might be in trouble, but let's try.
        } else {
            console.log('✅ Success');
        }
    }
}

applyAdminFix().catch(console.error);
