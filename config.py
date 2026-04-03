# config.py

API_URL = "https://jobsireland.ie/Jobsireland.API/JobsIreland/BrowseJobs/43"

PAYLOAD = {
    "CareerlevelId": "-1",
    "keyWord": "",
    "location": "Dublin",
    "page": 1,
    "pageSize": 10,
    "vacancyId": "undefined",
    "VacancyTypeId": "3",
    "RemoteOrBlendedJobType": "-1",
    "NaceCode": "-1"
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://jobsireland.ie/",
    "Accept-Language": "en-US,en;q=0.9",
    "X-Requested-With": "XMLHttpRequest",
    "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin"
}

# Tier 1: Exact Phrase Blacklist (Kill immediately)
TIER1_EXACT_PHRASES = [
    "security guard", "security officer", "security patrol", "night watch",
    "delivery driver", "delivery rider", "van driver", "multi-drop",
    "warehouse operative", "warehouse assistant", "warehouse worker", "stores person", "forklift",
    "cleaning operative", "cleaning assistant", "window cleaner",
    "care assistant", "healthcare assistant", "home care", "childcare", "special needs assistant",
    "kitchen assistant", "catering assistant", "food prep", "sous chef", "head chef",
    "general operative", "labourer", "site worker", "cleaner", "barista", "waiter", "waitress", "bartender"
]

# Tier 2: Whitelist / Immunity (Save immediately, send to AI)
TIER2_WHITELIST = [
    "data", "software", "developer", "engineer", "cloud", "devops", "cyber", 
    "network", "infrastructure", "system", "database", "architect",
    "machine learning", "ai ", "artificial intelligence", "ux", "ui", "design", "product",
    "manager", "lead", "agile", "scrum", "analyst", "analytics", "crm", "erp", 
    "finance", "accountant", "hr", "marketing", "seo", "director"
]

# Tier 3: Broad Root Blacklist (Kill by root word, if no immunity)
TIER3_ROOT_WORDS = [
    "clean", "caretak", "janitor", "ground", "garden", "landscap",
    "cook", "cater", "baker", "cashier", "hair", "beauti", "barber", "maintain", "maintenance"
]
