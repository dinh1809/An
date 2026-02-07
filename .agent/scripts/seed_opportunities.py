import json
import os
import asyncio
import requests
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(dotenv_path=dotenv_path)
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in .env")
    exit(1)

# Using raw REST API to bypass library conflicts
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

async def seed_opportunities():
    try:
        with open('jobs_data.json', 'r', encoding='utf-8') as f:
            jobs = json.load(f)
        
        print(f"Loaded {len(jobs)} jobs from file.")
        
        count = 0
        skipped = 0
        
        for job in jobs:
            # Check duplicates via GET
            check_url = f"{url}/rest/v1/opportunities?title=eq.{requests.utils.quote(job['title'])}&partner_name=eq.{requests.utils.quote(job['company'])}&select=id"
            existing = requests.get(check_url, headers=headers)
            
            if existing.status_code == 200 and len(existing.json()) > 0:
                print(f"Skipping duplicate: {job['title']}")
                skipped += 1
                continue
            
            # Map data
            data = {
                "title": job['title'],
                "description": job['description_snippet'] if len(job.get('description_snippet', '')) > 0 else "No description",
                "partner_name": job['company'],
                "neuro_traits": job.get('tags', []),
                "neuro_score": job.get('neuro_score', 50),
                "external_url": job['url'],
                "status": "ACTIVE"
            }
            
            insert_url = f"{url}/rest/v1/opportunities"
            result = requests.post(insert_url, headers=headers, json=data)
            
            if result.status_code in [200, 201]:
                count += 1
                print(f"Inserted: {job['title']}")
            else:
                print(f"Failed to insert {job['title']}: {result.text}")
            
        print(f"\nSeed Complete! Inserted: {count}, Skipped: {skipped}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(seed_opportunities())
