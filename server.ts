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
    const { location = "Dublin", page = 1, pageSize = 100 } = req.query;
    const url = `https://jobsireland.ie/Jobsireland.API/JobsIreland/BrowseJobs/43`;
    
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Referer": "https://jobsireland.ie/",
      "Accept-Language": "en-US,en;q=0.9"
    };

    const STOP_WORDS = [
      "cleaner", "cleaning", "caretaker", "janitor", "maintenance", 
      "grounds", "groundsworker", "gardener", "landscaping", 
      "delivery", "warehouse", "forklift", "courier", "labourer", 
      "construction", "cook", "kitchen", "catering", "chef", 
      "barista", "waiter", "waitress", "bartender", "bakery", 
      "cashier", "security guard", "guard", "hairdresser", 
      "beautician", "barber", "childcare", "childminder", 
      "early years", "sna", "special needs", "care assistant", 
      "carer", "healthcare assistant", "youth worker"
    ];

    try {
      const response = await axios.get(url, {
        params: {
          location,
          VacancyTypeId: 3,
          page,
          pageSize
        },
        headers
      });

      const html = response.data;
      const $ = cheerio.load(html);
      
      const accepted: any[] = [];
      const rejected: any[] = [];
      const allFetched: any[] = [];

      $(".job-heading.scheme-box").each((_, element) => {
        const $container = $(element);
        const jobTitle = ($container.find("#JobTitle").val() as string) || "Untitled";
        const job = {
          JobId: $container.find("#JobId").val(),
          JobTitle: jobTitle,
          Location: $container.find("#Location").val(),
          StartDate: $container.find("#StartDate").val(),
          EndDate: $container.find("#EndDate").val(),
        };

        allFetched.push(job);

        // Keyword Check (Regex with Word Boundaries)
        let matchedWord = null;
        const titleLower = jobTitle.toLowerCase();
        for (const word of STOP_WORDS) {
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedWord.toLowerCase()}\\b`, 'i');
          if (regex.test(titleLower)) {
            matchedWord = word;
            break;
          }
        }

        if (matchedWord) {
          rejected.push({ ...job, Reason: `Keyword Filter: ${matchedWord}` });
        } else {
          accepted.push({ ...job, Status: "Passed Stage 2 - Pending AI" });
        }
      });

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
