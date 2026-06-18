import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  Layers, 
  HelpCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  GraduationCap,
  MessageSquareCode,
  Share2
} from "lucide-react";
import { ResumeAnalysisReport, SavedScan } from "./types";
import ResumeUploader from "./components/ResumeUploader";
import AtsDashboard from "./components/AtsDashboard";
import InterviewGenerator from "./components/InterviewGenerator";
import HistorySidebar from "./components/HistorySidebar";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeReport, setActiveReport] = useState<ResumeAnalysisReport | null>(null);
  const [activeScanId, setActiveScanId] = useState<string | undefined>(undefined);
  const [scans, setScans] = useState<SavedScan[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("Initializing Engine...");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "interview">("report");
  const [pastedName, setPastedName] = useState<string>("");

  // Loading phase progression messages
  const stages = [
    "Uploading and reading document payload...",
    "Extracting academic and stack skills...",
    "Benchmarking ATS layout standards...",
    "Generating deep technical job-related interview questions...",
    "Crafting situational behavioral interview prep solutions...",
    "Finalizing highly tailored evaluation sheet..."
  ];

  // Load Saved Scans on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("resume_analyzer_saved_scans");
      if (saved) {
        const parsed = JSON.parse(saved) as SavedScan[];
        setScans(parsed);
        // Load the most recent scan if available
        if (parsed.length > 0) {
          setActiveReport(parsed[0].report);
          setActiveScanId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Local storage loads failed:", e);
    }
  }, []);

  // Interval stage cycles
  useEffect(() => {
    let stageIndex = 0;
    let timer: NodeJS.Timeout;

    if (isLoading) {
      setLoadingStage(stages[0]);
      timer = setInterval(() => {
        stageIndex = (stageIndex + 1) % stages.length;
        setLoadingStage(stages[stageIndex]);
      }, 2500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  const saveScanReport = (fileName: string, report: ResumeAnalysisReport) => {
    const newScan: SavedScan = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      fileName: fileName,
      report: report
    };

    const updated = [newScan, ...scans.filter(s => s.id !== activeScanId)];
    setScans(updated);
    setActiveReport(report);
    setActiveScanId(newScan.id);
    localStorage.setItem("resume_analyzer_saved_scans", JSON.stringify(updated));
  };

  const handleAnalyzeText = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed report generation. Check Gemini API key configuration.");
      }

      const report = await response.json() as ResumeAnalysisReport;
      const candidateName = report.contactInfo?.name || "Pasted Profile";
      saveScanReport(`${candidateName.replace(/\s+/g, "_")}_resume.txt`, report);
      setActiveTab("report");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFile = async (base64Data: string, fileName: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileData: base64Data, 
          fileName: fileName, 
          mimeType: mimeType 
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed file analysis. Ensure the file conforms to standard text format.");
      }

      const report = await response.json() as ResumeAnalysisReport;
      saveScanReport(fileName, report);
      setActiveTab("report");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during file analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeJd = async (resumeText: string, jobDescription: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed JD analysis.");
      }

      const newReport = await response.json() as ResumeAnalysisReport;
      setActiveReport(newReport);

      if (activeScanId) {
        const updatedScans = scans.map(s => {
          if (s.id === activeScanId) {
            return { ...s, report: newReport };
          }
          return s;
        });
        setScans(updatedScans);
        localStorage.setItem("resume_analyzer_saved_scans", JSON.stringify(updatedScans));
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during JD analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryScan = (scan: SavedScan) => {
    setActiveReport(scan.report);
    setActiveScanId(scan.id);
    setActiveTab("report");
  };

  const handleDeleteScan = (id: string) => {
    const updated = scans.filter((s) => s.id !== id);
    setScans(updated);
    localStorage.setItem("resume_analyzer_saved_scans", JSON.stringify(updated));

    if (activeScanId === id) {
      if (updated.length > 0) {
        setActiveReport(updated[0].report);
        setActiveScanId(updated[0].id);
      } else {
        setActiveReport(null);
        setActiveScanId(undefined);
      }
    }
  };

  const handleNewScan = () => {
    setActiveReport(null);
    setActiveScanId(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 text-slate-800">
      {/* Dynamic Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Briefcase className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-base text-slate-850 tracking-tight leading-none mb-1">
                AI Resume Analyzer
              </h1>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase font-mono">
                Interactive interview prep deck generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scans.length > 0 && activeReport && (
              <button
                onClick={handleNewScan}
                id="header-analyze-new-btn"
                className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                Audit New Resume
              </button>
            )}
            <span className="text-[9px] bg-slate-100 text-slate-500 font-extrabold px-2 py-1 rounded-md font-mono uppercase tracking-wider border border-slate-200">
              v1.0 Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* Immersive Loading Screen */
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="min-h-[480px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-100 max-w-2xl mx-auto my-12"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 relative border border-indigo-100">
                <Loader2 className="w-8 h-8 animate-spin" />
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25" />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Scanning Candidate Dossier
              </h2>
              <p className="text-sm text-slate-500 mb-8 max-w-md font-sans">
                We are parsing structural formatting and formulating customized HR / Domain questionnaires using our matching neural models. This takes a few moments.
              </p>

              {/* Progress Stage Text bubble */}
              <div className="px-5 py-3 bg-slate-50 rounded-xl border border-slate-200 max-w-sm w-full">
                <span className="text-xs font-mono font-bold text-indigo-600 animate-pulse block">
                  {loadingStage}
                </span>
              </div>
            </motion.div>
          ) : error ? (
            /* Error Display Block */
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-red-200 rounded-3xl p-8 max-w-md mx-auto text-center space-y-6 my-12 shadow-md"
            >
              <div className="w-14 h-14 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-800">Analysis Halted</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                id="dismiss-error-btn"
                className="px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all shadow-sm cursor-pointer"
              >
                Try Again
              </button>
            </motion.div>
          ) : !activeReport ? (
            /* Empty State / Initial Uploader View */
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Product Hero Banner */}
              <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-widest border border-indigo-100">
                  ⭐ Gemini-2.5-Flash Powered Evaluation
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-none">
                  Instant ATS Auditing & Interview Drill Sandbox
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-sans">
                  Audit your resumes against enterprise ATS compatibility standards, extract rich profile component databases, and prepare answers to generated interview lists.
                </p>
              </div>

              {scans.length > 0 ? (
                /* Split screen representation when historical logs exist, providing easy selection */
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1">
                    <HistorySidebar
                      scans={scans}
                      onSelectScan={handleSelectHistoryScan}
                      onDeleteScan={handleDeleteScan}
                      onNewScan={handleNewScan}
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <ResumeUploader
                      onAnalyzeText={handleAnalyzeText}
                      onAnalyzeFile={handleAnalyzeFile}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              ) : (
                /* Pure standalone uploader layout when first starting */
                <ResumeUploader
                  onAnalyzeText={handleAnalyzeText}
                  onAnalyzeFile={handleAnalyzeFile}
                  isLoading={isLoading}
                />
              )}
            </motion.div>
          ) : (
            /* Full active workspace dashboard reporting area */
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start"
            >
              {/* Left sidebar - Historical Scans logs directory */}
              <div className="lg:col-span-1">
                <HistorySidebar
                  scans={scans}
                  onSelectScan={handleSelectHistoryScan}
                  onDeleteScan={handleDeleteScan}
                  onNewScan={handleNewScan}
                  activeScanId={activeScanId}
                />
              </div>

              {/* Center - Right Active report workspace */}
              <div className="lg:col-span-3 space-y-6">
                {/* Back Link block & Workspace Tab switchers */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
                  <button
                    onClick={handleNewScan}
                    id="back-to-auditor-btn"
                    className="text-xs font-bold text-slate-400 hover:text-indigo-650 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    New Auditing Session
                  </button>

                  <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-auto">
                    <button
                      id="view-report-tab-btn"
                      onClick={() => setActiveTab("report")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                        activeTab === "report"
                          ? "bg-white text-slate-800 shadow-sm border border-slate-100"
                          : "text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      ATS Audit Report
                    </button>
                    <button
                      id="view-interview-tab-btn"
                      onClick={() => setActiveTab("interview")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                        activeTab === "interview"
                          ? "bg-white text-slate-800 shadow-sm border border-slate-100"
                          : "text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      <MessageSquareCode className="w-3.5 h-3.5" />
                      Interview Prep Sandbox
                    </button>
                  </div>
                </div>

                {/* Sub-workspace navigation rendering */}
                <div>
                  {activeTab === "report" ? (
                    <AtsDashboard report={activeReport} onAnalyzeJd={handleAnalyzeJd} />
                  ) : (
                    <InterviewGenerator
                      technicalQuestions={activeReport.technicalQuestions}
                      hrQuestions={activeReport.hrQuestions}
                      jdInterviewQuestions={activeReport.jdInterviewQuestions}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Credentials */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-16 text-center text-xs text-slate-400 font-semibold font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>AI Resume Assistant &copy; 2026. Powered by Google Gemini.</span>
          <div className="flex gap-4 tracking-wider uppercase text-[10px]">
            <a href="#" className="hover:text-indigo-650">Terms</a>
            <span className="text-slate-200">|</span>
            <a href="#" className="hover:text-indigo-650">Privacy</a>
            <span className="text-slate-200">|</span>
            <span>Online Mode Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
