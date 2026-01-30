import os
import json
import time
import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import re

# --- CONFIGURATION ---
TARGET_URL = "https://www.topcv.vn/tim-viec-lam-tester"

NEURO_KEYWORDS = {
    "High_Focus": ["nhập liệu", "định kỳ", "lặp lại", "dữ liệu", "data entry", "kiên nhẫn"],
    "Visual_Detail": ["soi lỗi", "chi tiết", "kiểm thử", "tester", "qa", "qc", "đồ họa", "pixel"],
    "Logic_System": ["thuật toán", "backend", "logic", "hệ thống", "phân tích", "sql"],
    "Low_Social": ["remote", "tại nhà", "ít giao tiếp", "chat support", "không nghe gọi", "độc lập"]
}

def local_neuro_analyzer(text: str) -> dict:
    """
    Analyzes job description text using keyword weighting essentially cost-free.
    """
    text_lower = text.lower()
    scores = {trait: 0 for trait in NEURO_KEYWORDS}
    total_hits = 0

    for trait, keywords in NEURO_KEYWORDS.items():
        for keyword in keywords:
            count = text_lower.count(keyword.lower())
            if count > 0:
                scores[trait] += count
                total_hits += count

    # Determine primary tag
    if total_hits == 0:
        primary_tag = "General"
        neuro_score = 50 # Neutral
    else:
        primary_tag = max(scores, key=scores.get)
        # Cap score at 99, base 50
        neuro_score = min(50 + (total_hits * 5), 99) 

    # Get all tags with at least 1 hit
    active_tags = [trait for trait, score in scores.items() if score > 0]
    if not active_tags:
        active_tags = ["General"]

    return {
        "tags": active_tags,
        "primary_tag": primary_tag,
        "neuro_score": neuro_score,
        "keyword_hits": total_hits
    }

def extract_job_content(soup: BeautifulSoup) -> str:
    """
    Robust extraction strategy for TopCV and similar sites.
    """
    # Strategy 1: Look for known container headers and extract siblings
    headers = ["Mô tả công việc", "Yêu cầu ứng viên", "Quyền lợi"]
    content_parts = []
    
    # Try to find specific sections usually present in TopCV
    # Note: TopCV structure is complex, often using h3 or h4 for headers
    for header in headers:
        # Find element containing the header text
        header_el = soup.find(lambda tag: tag.name in ['h3', 'h4', 'strong', 'b'] and header in tag.get_text())
        if header_el:
            # Get the content following this header until the next header?
            # Simpler: Get the parent's text or the next sibling div
            # TopCV specific: The header is usually inside a .job-data-item or similar wrapper
            # Let's try to get the parent div text
            parent = header_el.find_parent('div')
            if parent:
                content_parts.append(parent.get_text(separator="\n", strip=True))
    
    if content_parts:
        return "\n".join(content_parts)

    # Strategy 2: Fallback - Get the largest text block in the generic container
    # Known container classes for TopCV
    potential_containers = soup.select('.job-data, .job-description, #job-description-text')
    
    best_text = ""
    for container in potential_containers:
        text = container.get_text(separator="\n", strip=True)
        if len(text) > len(best_text):
            best_text = text
            
    if len(best_text) > 100:
        return best_text

    return "Description extraction failed."

async def main():
    jobs_data = []
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True) # Headless for speed
        page = await browser.new_page()
        
        print(f"🚀 Navigating to {TARGET_URL}...")
        await page.goto(TARGET_URL)
        
        # Wait for list to load
        try:
            # Wait for job titles
            await page.wait_for_selector(".job-list-search-result, .job-item", timeout=10000)
        except:
             print("⚠️ List selector timeout. Proceeding with available DOM...")

        # Collect Links
        # TopCV selector strategy
        job_links = await page.locator(".job-list-search-result .job-item .title a").all()
        
        # Fallback if specific structure failed
        if not job_links:
             job_links = await page.locator("h3 a").all()

        print(f"🔎 Found {len(job_links)} potential jobs. Processing top 5...")
        
        # Limit processing
        targets = job_links[:5]
        
        for i, link in enumerate(targets):
            url = await link.get_attribute("href")
            # TopCV links might be relative or absolute, usually absolute
            
            print(f"   [{i+1}/5] Processing: {url}...")
            
            try:
                # Open separate tab/page for job detail to preserve list state if needed (though we have URLs)
                job_page = await browser.new_page()
                await job_page.goto(url)
                
                # Wait for body
                await job_page.wait_for_load_state("domcontentloaded")
                
                content = await job_page.content()
                soup = BeautifulSoup(content, 'html.parser')
                
                # Metadata
                title_el = soup.select_one("h1, .job-detail-title")
                title = title_el.get_text(strip=True) if title_el else "Unknown Title"
                
                company_el = soup.select_one(".company-name, .company-title")
                company = company_el.get_text(strip=True) if company_el else "Unknown Company"

                # Extract Description
                description_text = extract_job_content(soup)
                
                # Analyze Locally
                analysis = local_neuro_analyzer(description_text)
                
                job_record = {
                    "title": title,
                    "company": company,
                    "description_snippet": description_text[:200] + "...", # Preview
                    "full_description_length": len(description_text),
                    "tags": analysis["tags"],
                    "primary_tag": analysis["primary_tag"],
                    "neuro_score": analysis["neuro_score"],
                    "url": url
                }
                
                jobs_data.append(job_record)
                await job_page.close()
                time.sleep(1) # Rate limit politeness

            except Exception as e:
                print(f"❌ Error scraping {url}: {e}")

        await browser.close()

    # Save Data
    output_file = "jobs_data.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(jobs_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Success! {len(jobs_data)} jobs saved to {output_file}")
    
    # Print preview for User Verification
    print("\n--- PREVIEW OF CAPTURED DATA ---")
    for job in jobs_data[:3]:
        print(f"\n[JOB] {job['title']} @ {job['company']}")
        print(f"   Score: {job['neuro_score']} | Tags: {job['tags']}")
        print(f"   Desc Snippet: {job['description_snippet']}")

if __name__ == "__main__":
    asyncio.run(main())
