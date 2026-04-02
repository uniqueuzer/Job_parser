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
    "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin"
}

STOP_WORDS = [
    "cleaner", "cleaning", "caretaker", "janitor", "maintenance", 
    "grounds", "groundsworker", "gardener", "landscaping", 
    "delivery", "warehouse", "forklift", "courier", "labourer", 
    "construction", "cook", "kitchen", "catering", "chef", 
    "barista", "waiter", "waitress", "bartender", "bakery", 
    "cashier", "security guard", "guard", "hairdresser", 
    "beautician", "barber", "childcare", "childminder", 
    "early years", "sna", "special needs", "care assistant", 
    "carer", "healthcare assistant", "youth worker"
]
