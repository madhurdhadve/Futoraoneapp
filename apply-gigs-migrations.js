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
        let value = parts.slice(1).join('=').trim();
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

async function applyMigrations() {
    console.log('🚀 Starting migration application via exec_sql...');

    const migrations = [
        '20251212220000_add_founders_corner.sql',
        '20251212221500_add_gig_marketplace.sql',
        '20251214000001_add_applications_tables.sql',
        '20251217000001_monetization_schema.sql'
    ];

    for (const filename of migrations) {
        console.log(`\n📄 Processing ${filename}...`);
        const filePath = path.join(__dirname, 'supabase', 'migrations', filename);

        try {
            let sql = fs.readFileSync(filePath, 'utf-8');

            // Basic cleanup for montezation schema mismatch
            if (filename === '20251217000001_monetization_schema.sql') {
                sql = sql.replace(/REFERENCES public\.gigs\(id\)/g, 'REFERENCES public.gig_listings(id)');
            }

            console.log(`Executing SQL from ${filename}...`);
            const { error } = await supabase.rpc('exec_sql', { query: sql });

            if (error) {
                console.error(`❌ Error executing ${filename}:`, error.message);
                // Try executing line by line if it's a multi-statement issue
                console.log('Attempting to execute statement by statement...');
                const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
                for (let stmt of statements) {
                    const { error: stmtError } = await supabase.rpc('exec_sql', { query: stmt + ';' });
                    if (stmtError) {
                        console.warn(`  ⚠️ Statement failed: ${stmtError.message}`);
                    }
                }
            } else {
                console.log(`✅ ${filename} applied successfully!`);
            }
        } catch (err) {
            console.error(`❌ Failed to read or process ${filename}:`, err.message);
        }
    }

    console.log('\n✨ Migrations finished!');
}

applyMigrations().catch(console.error);
