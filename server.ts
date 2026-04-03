import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import * as cheerio from "cheerio";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Scraper API Endpoint (Stage 2: Filtering and Memory)
  app.get("/api/scrape", async (req, res) => {
    const { location = "Dublin", pageSize = 100 } = req.query;
    const url = `https://jobsireland.ie/Jobsireland.API/JobsIreland/BrowseJobs/43`;
    
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Referer": "https://jobsireland.ie/",
      "Accept-Language": "en-US,en;q=0.9",
      "X-Requested-With": "XMLHttpRequest"
    };

    const TIER1_EXACT_PHRASES = [
      "security guard", "security officer", "security patrol", "night watch",
      "delivery driver", "delivery rider", "van driver", "multi-drop",
      "warehouse operative", "warehouse assistant", "warehouse worker", "stores person", "forklift",
      "cleaning operative", "cleaning assistant", "window cleaner",
      "care assistant", "healthcare assistant", "home care", "childcare", "special needs assistant",
      "kitchen assistant", "catering assistant", "food prep", "sous chef", "head chef",
      "general operative", "labourer", "site worker", "cleaner", "barista", "waiter", "waitress", "bartender"
    ];

    const TIER2_WHITELIST = [
      "data", "software", "developer", "engineer", "cloud", "devops", "cyber", 
      "network", "infrastructure", "system", "database", "architect",
      "machine learning", "ai ", "artificial intelligence", "ux", "ui", "design", "product",
      "manager", "lead", "agile", "scrum", "analyst", "analytics", "crm", "erp", 
      "finance", "accountant", "hr", "marketing", "seo", "director"
    ];

    const TIER3_ROOT_WORDS = [
      "clean", "caretak", "janitor", "ground", "garden", "landscap",
      "cook", "cater", "baker", "cashier", "hair", "beauti", "barber", "maintain", "maintenance"
    ];

    try {
      const accepted: any[] = [];
      const rejected: any[] = [];
      const allFetched: any[] = [];
      const existingIds = new Set<string>();
      
      let currentPage = 1;
      
      // We'll use a single axios instance to maintain cookies (stateful session)
      const instance = axios.create({ headers });
      
      // Preliminary request to capture cookies
      try {
        await instance.get("https://jobsireland.ie/");
      } catch (e) {
        console.warn("Could not capture initial cookies");
      }

      while (true) {
        console.log(`Fetching Page ${currentPage}...`);
        const response = await instance.get(url, {
          params: {
            location,
            VacancyTypeId: 3,
            page: currentPage,
            pageSize
          }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        
        const containers = $(".job-heading.scheme-box");
        
        if (containers.length === 0) {
          console.log(`No more jobs found on Page ${currentPage}. Breaking loop.`);
          break;
        }

        containers.each((_, element) => {
          const $container = $(element);
          const jobId = $container.find("#JobId").val() as string;
          
          if (!jobId) return;
          
          const jobTitle = ($container.find("#JobTitle").val() as string) || "Untitled";
          const job = {
            JobId: jobId,
            JobTitle: jobTitle,
            Location: $container.find("#Location").val(),
            StartDate: $container.find("#StartDate").val(),
            EndDate: $container.find("#EndDate").val(),
          };

          allFetched.push(job);

          // Deduplication
          if (existingIds.has(jobId)) {
            return;
          }
          existingIds.add(jobId);

          // 3-Tier Keyword Check
          const titleLower = jobTitle.toLowerCase();

          // Tier 1 Check
          const tier1Match = TIER1_EXACT_PHRASES.find(phrase => titleLower.includes(phrase));
          if (tier1Match) {
            rejected.push({ ...job, Reason: `Tier 1 Blacklist: ${tier1Match}` });
            return;
          }

          // Tier 2 Check
          const tier2Match = TIER2_WHITELIST.find(word => titleLower.includes(word));
          if (tier2Match) {
            accepted.push({ ...job, Status: `Immunity Granted - Pending AI: ${tier2Match}` });
            return;
          }

          // Tier 3 Check
          let tier3Match = null;
          for (const word of TIER3_ROOT_WORDS) {
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedWord}`, 'i');
            if (regex.test(titleLower)) {
              tier3Match = word;
              break;
            }
          }

          if (tier3Match) {
            rejected.push({ ...job, Reason: `Tier 3 Root Match: ${tier3Match}` });
          } else {
            accepted.push({ ...job, Status: "Passed All Filters - Pending AI" });
          }
        });

        // Anti-DDoS Delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        currentPage++;
      }

      res.json({
        summary: {
          total: allFetched.length,
          accepted: accepted.length,
          rejected: rejected.length
        },
        accepted,
        rejected
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        res.status(403).json({ error: "Cloudflare/Bot protection block (403 Forbidden)" });
      } else {
        res.status(500).json({ error: error.message || "Failed to fetch jobs" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
