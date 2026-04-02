import React, { useState } from "react";
import { Search, MapPin, Briefcase, Loader2, AlertCircle, CheckCircle2, FileJson, ExternalLink, RefreshCw, XCircle, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Job {
  JobId: string;
  JobTitle: string;
  Location: string;
  StartDate: string;
  EndDate: string;
  Status?: string;
  Reason?: string;
}

interface ScrapeResult {
  summary: {
    total: number;
    accepted: number;
    rejected: number;
  };
  accepted: Job[];
  rejected: Job[];
}

export default function App() {
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [activeTab, setActiveTab] = useState<"accepted" | "rejected">("accepted");

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/scrape?location=Dublin&page=1&pageSize=100");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentJobs = activeTab === "accepted" ? result?.accepted || [] : result?.rejected || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">JobsIreland Scraper <span className="text-blue-600">Stage 2.2 (Debug)</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FileJson className="w-4 h-4" />
              {showRaw ? "Hide JSON" : "View JSON"}
            </button>
            <button
              onClick={fetchJobs}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? "Scraping..." : "Run Scraper"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-2">
              {loading ? (
                <span className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Fetching...
                </span>
              ) : error ? (
                <span className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4" /> Error
                </span>
              ) : result ? (
                <span className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              ) : (
                <span className="text-slate-400 font-medium text-sm italic">Ready to start</span>
              )}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Fetched</p>
            <p className="text-2xl font-bold text-slate-900">{result?.summary.total || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Accepted</p>
            <p className="text-2xl font-bold text-slate-900">{result?.summary.accepted || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Rejected</p>
            <p className="text-2xl font-bold text-slate-900">{result?.summary.rejected || 0}</p>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Pipeline Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Job List */}
          <div className={`flex-1 space-y-6 ${showRaw ? 'lg:w-1/2' : 'w-full'}`}>
            {/* Tabs */}
            {result && (
              <div className="flex p-1 bg-slate-200 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab("accepted")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    activeTab === "accepted" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accepted ({result.summary.accepted})
                </button>
                <button
                  onClick={() => setActiveTab("rejected")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    activeTab === "rejected" ? "bg-white text-red-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Rejected ({result.summary.rejected})
                </button>
              </div>
            )}

            {currentJobs.length === 0 && !loading && !error && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No data in current view</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-1">Run the scraper to populate the pipeline.</p>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {currentJobs.map((job, idx) => (
                <motion.div
                  key={job.JobId || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`bg-white p-6 rounded-xl border shadow-sm transition-all group ${
                    activeTab === "accepted" ? "border-slate-200 hover:border-emerald-300" : "border-slate-200 hover:border-red-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {job.JobTitle || "Untitled Position"}
                    </h3>
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">
                      ID: {job.JobId}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {job.Location || "Dublin"}
                    </div>
                    {job.Reason && (
                      <div className="flex items-center gap-1.5 text-red-600 font-medium">
                        <XCircle className="w-4 h-4" />
                        {job.Reason}
                      </div>
                    )}
                    {job.Status && (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        {job.Status}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-400 flex flex-col">
                      <span>Starts: {job.StartDate || "N/A"}</span>
                      <span>Ends: {job.EndDate || "N/A"}</span>
                    </div>
                    <a
                      href={`https://jobsireland.ie/en-US/job-details?id=${job.JobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline"
                    >
                      View Original <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Raw JSON View */}
          <AnimatePresence>
            {showRaw && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:w-1/2 h-[calc(100vh-12rem)] sticky top-24"
              >
                <div className="bg-slate-900 rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
                  <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                    <span className="text-xs font-mono text-slate-400">pipeline_memory.json</span>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'scrape_result.json';
                        a.click();
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Export
                    </button>
                  </div>
                  <pre className="p-4 text-[10px] font-mono text-blue-300 overflow-auto flex-1 custom-scrollbar">
                    {result ? JSON.stringify(result, null, 2) : "// Run scraper to see pipeline data"}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
