import requests
import json
import os
import re
import time
from bs4 import BeautifulSoup
from config import API_URL, PAYLOAD, HEADERS, STOP_WORDS

def load_json(filename):
    """Loads a JSON file or returns an empty list if not found."""
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            return []
    return []

def save_json(filename, data):
    """Saves data to a JSON file with indentation."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def run_scraper():
    # 1. Load Memory
    accepted = load_json("accepted.json")
    rejected = load_json("rejected.json")
    
    # Extract a set of all existing JobIds for fast O(1) deduplication
    existing_ids = set(job.get("JobId") for job in accepted + rejected if job.get("JobId"))
    
    # 2. Setup Stateful Session
    session = requests.Session()
    session.headers.update(HEADERS)
    
    print("Capturing initial session cookies...")
    try:
        init_resp = session.get("https://jobsireland.ie/", timeout=10)
        print(f"Initial cookie capture status: {init_resp.status_code}")
    except Exception as e:
        print(f"Warning: Could not capture initial cookies: {e}")

    # 3. Fetch Data (Pagination Loop)
    params = PAYLOAD.copy()
    page = int(params.get("page", 1))
    
    total_fetched_this_run = 0
    total_skipped = 0
    total_rejected = 0
    total_accepted = 0
    total_available = None
    
    print(f"Starting Stage 2.2 Pipeline (Autonomous Debugging)...")
    
    while True:
        print(f"\n--- Fetching Page {page} ---")
        # Update params with current page
        params["page"] = page
        
        try:
            # DEBUG: Log exact URL and params
            response = session.get(API_URL, params=params, timeout=15)
            print(f"DEBUG: URL: {response.url}")
            print(f"DEBUG: Status: {response.status_code}")
            print(f"DEBUG: Response Length: {len(response.text)} bytes")
            
            if response.status_code != 200:
                print(f"STOP: Received status {response.status_code}. Breaking loop.")
                break

            html = response.text
            soup = BeautifulSoup(html, "html.parser")
            
            # Find all job containers
            containers = soup.find_all("div", class_="job-heading scheme-box")
            print(f"DEBUG: Found {len(containers)} job containers on this page.")
            
            # Extract totalCount if not already known
            if total_available is None:
                total_count_input = soup.find("input", class_="totalCount")
                if total_count_input and total_count_input.get("value"):
                    total_available = int(total_count_input.get("value"))
                    print(f"DEBUG: Total available jobs (from HTML): {total_available}")
                else:
                    print("DEBUG: Could not find 'totalCount' hidden input.")

            if not containers:
                print(f"STOP: No more jobs found on Page {page}. Breaking loop.")
                break
                
            # 4. Filter Loop
            for container in containers:
                job_id = container.find("input", id="JobId")["value"] if container.find("input", id="JobId") else None
                
                # Rule 0 (Validation)
                if not job_id:
                    continue
                
                total_fetched_this_run += 1
                    
                job_title = container.find("input", id="JobTitle")["value"] if container.find("input", id="JobTitle") else "Untitled"
                location = container.find("input", id="Location")["value"] if container.find("input", id="Location") else "N/A"
                start_date = container.find("input", id="StartDate")["value"] if container.find("input", id="StartDate") else "N/A"
                end_date = container.find("input", id="EndDate")["value"] if container.find("input", id="EndDate") else "N/A"
                
                # Rule 1 (Deduplication)
                if job_id in existing_ids:
                    total_skipped += 1
                    continue
                
                job_data = {
                    "JobId": job_id,
                    "JobTitle": job_title,
                    "Location": location,
                    "StartDate": start_date,
                    "EndDate": end_date
                }
                
                # Rule 2 (Keyword Check with Regex Word Boundaries)
                matched_word = None
                title_lower = job_title.lower()
                for word in STOP_WORDS:
                    # Use regex word boundaries \b to prevent false positives (e.g., "cook" matching "cookbook")
                    pattern = rf"\b{re.escape(word.lower())}\b"
                    if re.search(pattern, title_lower):
                        matched_word = word
                        break
                
                if matched_word:
                    job_data["Reason"] = f"Keyword Filter: {matched_word}"
                    rejected.append(job_data)
                    total_rejected += 1
                else:
                    job_data["Status"] = "Passed Stage 2 - Pending AI"
                    accepted.append(job_data)
                    total_accepted += 1
                
                # Add to existing_ids to prevent duplicates within the same run
                existing_ids.add(job_id)
            
            # 5. Save Memory (Save after each page to prevent data loss)
            save_json("accepted.json", accepted)
            save_json("rejected.json", rejected)
            
            # Check if we should stop based on total_available
            if total_available is not None and total_fetched_this_run >= total_available:
                print(f"STOP: Fetched {total_fetched_this_run} jobs, which matches/exceeds total available ({total_available}).")
                break

            # Anti-DDoS Delay
            print("DEBUG: Sleeping for 2 seconds...")
            time.sleep(2)
            
            # Increment page for next iteration
            page += 1
            
        except Exception as e:
            print(f"STOP: An error occurred on Page {page}: {e}")
            break
            
    # 6. Final Console Output
    print("-" * 30)
    print("AGGREGATE RUN SUMMARY:")
    print(f"Total Pages Fetched: {page}")
    print(f"Total Jobs Fetched:  {total_fetched_this_run}")
    print(f"Skipped (Dupes):     {total_skipped}")
    print(f"Newly Rejected:      {total_rejected}")
    print(f"Newly Accepted:      {total_accepted}")
    print("-" * 30)

if __name__ == "__main__":
    run_scraper()
