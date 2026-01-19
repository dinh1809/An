# TASK: Upgrade Job Crawler to v2.0 (Robust & Zero-Cost)

## CONTEXT
Our current `job_crawler.py` has two issues:
1.  **Fragile Selectors:** It fails to extract job descriptions from TopCV because it relies on specific CSS classes (which are dynamic/obfuscated).
2.  **Costly/Broken AI:** It tries to use Gemini API which is either costly or not configured, leading to "Mock Data" fallback.

## OBJECTIVES
Refactor `job_crawler.py` to be a **Robust, Zero-Cost Mining Engine**.

### 1. Fix Data Extraction (The "Robust" Part)
- **Do NOT** rely solely on specific class names like `.box-info-job`.
- **Strategy:** Use `BeautifulSoup` to parse the full HTML.
- **Heuristic:** Look for standard header texts common in Vietnamese JDs like "Mô tả công việc", "Yêu cầu ứng viên", "Quyền lợi". Extract the text following these headers.
- **Fallback:** If specific sections fail, grab the largest text block within the main container.

### 2. Implement Local Intelligence (The "Zero-Cost" Part)
- **Remove:** All Gemini/Google Generative AI API calls.
- **Add:** A `local_neuro_analyzer(text)` function using a weighted keyword dictionary.

#### Dictionary Logic (Vietnamese):
```python
NEURO_KEYWORDS = {
    "High_Focus": ["nhập liệu", "định kỳ", "lặp lại", "dữ liệu", "data entry", "kiên nhẫn"],
    "Visual_Detail": ["soi lỗi", "chi tiết", "kiểm thử", "tester", "qa", "qc", "đồ họa", "pixel"],
    "Logic_System": ["thuật toán", "backend", "logic", "hệ thống", "phân tích", "sql"],
    "Low_Social": ["remote", "tại nhà", "ít giao tiếp", "chat support", "không nghe gọi", "độc lập"]
}
```
**Scoring:**
- Count occurrences of keywords in the Job Description.
- Assign the trait with the highest count.
- `neuro_score = min(50 + (keyword_count * 10), 99)` (Base 50, max 99).

### 3. Output Format
Save to `jobs_data.json` with this structure:
```json
[
  {
    "title": "Fresher Tester (QA)",
    "company": "FPT Software",
    "description": "...",
    "tags": ["Visual_Detail", "Low_Social"],
    "neuro_score": 85,
    "url": "..."
  }
]
```

## ACTION
1. Rewrite `job_crawler.py` completely.
2. Run the script immediately to verify it extracts REAL descriptions (length > 200 chars).
