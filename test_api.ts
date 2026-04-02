import axios from "axios";

async function test() {
  const url = "https://jobsireland.ie/Jobsireland.API/JobsIreland/BrowseJobs/43";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://jobsireland.ie/",
    "Accept-Language": "en-US,en;q=0.9"
  };

  try {
    console.log("Testing API...");
    const response = await axios.get(url, {
      params: {
        location: "Dublin",
        VacancyTypeId: 3,
        page: 1,
        pageSize: 100
      },
      headers
    });
    console.log("Status:", response.status);
    console.log("Data type:", typeof response.data);
    console.log("First 100 chars:", response.data.substring(0, 100));
    try {
        const parsed = JSON.parse(response.data);
        console.log("Parsed keys:", Object.keys(parsed));
    } catch (e) {
        console.log("Failed to parse as JSON");
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }
  }
}

test();
