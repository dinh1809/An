import os
import requests
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(dotenv_path=dotenv_path)

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

SQL_COMMAND = """
-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    partner_name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    salary_range TEXT,
    neuro_traits TEXT[],
    neuro_score INT DEFAULT 50,
    external_url TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Conditional drop first to avoid errors if re-running)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.opportunities;
CREATE POLICY "Enable read access for all users" 
ON public.opportunities FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert for service_role only" ON public.opportunities;
CREATE POLICY "Enable insert for service_role only" 
ON public.opportunities FOR INSERT 
TO service_role 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for service_role only" ON public.opportunities;
CREATE POLICY "Enable update for service_role only" 
ON public.opportunities FOR UPDATE 
TO service_role 
USING (true);
"""

def init_db():
    print("--- ATTEMPTING REMOTE MIGRATION ---")
    
    # Try to execute via Supabase SQL API (Available on Project Settings -> SQL Editor -> extensions? No, usually REST doesn't allow RAW SQL)
    # Actually, Supabase REST API does NOT support raw SQL execution directly for security.
    # We traditionally need the Postgres connection string (pyscopg2) or use the CLI.
    
    # Since we don't have the Postgres Password (only Service Key), direct connection is hard.
    # However, we can use the `rpc` function if we had a stored procedure to exec sql, which we don't.
    
    print("⚠️  REMOTE SQL EXECUTION LIMITATION: Cannot run raw 'CREATE TABLE' via standard REST API without a specific stored procedure.")
    print("⚠️  MANUAL ACTION REQUIRED: Please copy the SQL below and run it in your Supabase Dashboard > SQL Editor.")
    print("\n" + "="*40)
    print(SQL_COMMAND)
    print("="*40 + "\n")
    
    # Check if table exists just in case
    try:
        check_url = f"{url}/rest/v1/opportunities?select=count"
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Range": "0-0"
        }
        resp = requests.get(check_url, headers=headers)
        if resp.status_code == 200 or resp.status_code == 206:
            print("✅ Status Check: Table 'active' seems to EXIST already (Response 200/206).")
            return True
        else:
            print(f"❌ Status Check: Table probably does NOT exist (Response {resp.status_code}).")
            return False
    except Exception as e:
        print(f"❌ Connection Check Failed: {e}")
        return False

if __name__ == "__main__":
    init_db()
