import requests
import json
from bs4 import BeautifulSoup

def scrape_jobs():
    """
    Stage 1.1: HTML Parsing Scraper MVP for jobsireland.ie
    Parses HTML partial and extracts job details from hidden inputs.
    """
    url = "https://jobsireland.ie/Jobsireland.API/JobsIreland/BrowseJobs/43"
    params = {
        "location": "Dublin",
        "VacancyTypeId": 3,
        "page": 1,
        "pageSize": 100
    }
    
    # CRITICAL: Anti-Bot Headers
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Referer": "https://jobsireland.ie/",
        "Accept-Language": "en-US,en;q=0.9"
    }

    print(f"Fetching jobs from {url}...")
    
    try:
        response = requests.get(url, params=params, headers=headers)
        
        if response.status_code == 200:
            html = response.text
            soup = BeautifulSoup(html, "html.parser")
            
            jobs_list = []
            
            # Find all job containers
            containers = soup.find_all("div", class_="job-heading scheme-box")
            
            for container in containers:
                job = {
                    "JobId": container.find("input", id="JobId")["value"] if container.find("input", id="JobId") else None,
                    "JobTitle": container.find("input", id="JobTitle")["value"] if container.find("input", id="JobTitle") else None,
                    "Location": container.find("input", id="Location")["value"] if container.find("input", id="Location") else None,
                    "StartDate": container.find("input", id="StartDate")["value"] if container.find("input", id="StartDate") else None,
                    "EndDate": container.find("input", id="EndDate")["value"] if container.find("input", id="EndDate") else None,
                }
                jobs_list.append(job)
            
            # Save to raw_jobs.json
            with open("raw_jobs.json", "w", encoding="utf-8") as f:
                json.dump(jobs_list, f, indent=4)
            
            print(f"Jobs Found: {len(jobs_list)}")
            print("Clean data saved to 'raw_jobs.json'.")
            
        elif response.status_code == 403:
            print("!!! WARNING: 403 Forbidden !!!")
            print("Cloudflare/Bot protection detected. Your IP might be blocked or headers are insufficient.")
        else:
            print(f"HTTP Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    scrape_jobs()
