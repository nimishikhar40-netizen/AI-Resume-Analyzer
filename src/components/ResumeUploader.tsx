import React, { useState, useRef } from "react";
import { Upload, FileText, Clipboard, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ResumeUploaderProps {
  onAnalyzeText: (text: string) => void;
  onAnalyzeFile: (base64Data: string, fileName: string, mimeType: string) => void;
  isLoading: boolean;
}

const SAMPLE_RESUMES = {
  softwareEngineer: `EMILY CHEN - FULL STACK DEVELOPER
emily.chen@email.com | +1 (555) 019-2834 | linkedin.com/in/emilychen | github.com/emilychen

SUMMARY
Passionate Full Stack Engineer with 4+ years of experience building secure, scalable product architectures with React, Node.js, and TypeScript. Expert at optimizing user dashboards and structuring databases for peak performance.

EDUCATION
B.S. in Computer Science - University of California, Berkeley (2017 - 2021)

EXPERIENCE
Software Engineer | TechNova Solutions (2021 - Present)
• Built real-time notification engine using WebSockets, reducing payload latency by 35%.
• Architected complex internal dashboards with React and Redux, boosting system operational speed.
• Implemented automated integration tests, reaching 88% overall code test coverage.

Junior Developer | DevStudio Inc (2020 - 2021)
• Refactored legacy REST APIs in Express.js in favor of TypeScript integrations.
• Collaborated closely with design team to develop modular, accessible reusable UI components.

PROJECTS
MedSync App - Responsive Healthcare Portal
• Programmed real-time patient booking platform with secure end-to-end encryption.
• Integrated Google Calendar API sync to decrease scheduled check-in dropouts.

STRIKE Engine - Multiplayer RPG Canvas
• Developed responsive game engine render loops using high performance HTML5 Canvas.`,

  uxDesigner: `MARCUS VANCE - LEAD PRODUCT DESIGNER
marcus.vance@design.co | +1 (555) 728-1933 | linkedin.com/in/marcusvance | dribbble.com/marcusvd

SUMMARY
User-centric Product Designer with 6+ years of experience leading cross-functional teams in constructing intricate mobile apps, SaaS tools, and web dashboards. Passionate about design systems, responsive usability, and typography pairing.

EDUCATION
B.A. in Interaction Design - Savannah College of Art and Design (SCAD) (2015 - 2019)

SKILLS
Figma, Adobe Creative Suite, Design Systems, HTML/CSS, Wireframing, Rapid Prototyping, User Testing, Branding.

EXPERIENCE
Lead UX Designer | AlphaSaaS Corp (2021 - Present)
• Restructured user checkout flows, resulting in a 24% increase in sales conversions.
• Created unified design system referenced by 20+ engineering and product stakeholders.
• Conducted over 60 remote user usability tests to iterate on core product functionality.

UX Designer | CreativePixel Studio (2019 - 2021)
• Delivered premium wireframes, blueprints, and interactive prototypes for clients.
• Collaborated on detailed aesthetic design standards for high-growth consumer apps.`,

  marketingSpecialist: `SARAH JENKINS - GROWTH MARKETING SPECIALIST
sarah.j@growthmail.com | +1 (555) 233-4901 | linkedin.com/in/sarahjenkinsgrowth

SUMMARY
Results-driven Growth Marketer with 5 years of experience scaling consumer subscription programs and high-spend search engine marketing campaigns. Expert in user acquisition, lifecycle funnels, and data analytics dashboards.

EDUCATION
B.B.A. in Marketing - University of Texas at Austin (2016 - 2020)

SKILLS
SEO/SEM, Google Analytics, Google Ads, SQL, HubSpot, Meta Ads Manager, A/B Testing, Email Campaign Strategy.

EXPERIENCE
Growth Marketing Manager | SubScribe Media (2022 - Present)
• Managed $80K monthly marketing budget, optimizing CPA down by 18% across major paid channels.
• Orchestrated referral discount programs driving 14,000+ new customer signups.
• Setup rigorous customer segment tracking pipelines using Google Analytics and Mixpanel.

Senior Marketing Analyst | ClickValue Agencies (2020 - 2022)
• Coordinated A/B landing page testing variations, lifting baseline click-through rates by 12%.
• Configured automated behavior-based email pipelines targeting lapsed subscribers.`
};

export default function ResumeUploader({ onAnalyzeText, onAnalyzeFile, isLoading }: ResumeUploaderProps) {
  const [pasteMode, setPasteMode] = useState<boolean>(false);
  const [resumeText, setResumeText] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setFileError(null);
    const validMimes = ["application/pdf", "text/plain"];
    if (!validMimes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".pdf")) {
      setFileError("Supported formats are PDF (.pdf) and plain text (.txt).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFileError("File exceeds 8MB size limit. Please upload a smaller version.");
      return;
    }

    const reader = new FileReader();
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) onAnalyzeText(text);
      };
      reader.readAsText(file);
    } else {
      // PDF - read base64 data URL
      reader.onload = (e) => {
        const base64WithScheme = e.target?.result as string;
        if (base64WithScheme) {
          onAnalyzeFile(base64WithScheme, file.name, file.type || "application/pdf");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    onAnalyzeText(resumeText);
  };

  const loadSample = (key: keyof typeof SAMPLE_RESUMES) => {
    setPasteMode(true);
    setResumeText(SAMPLE_RESUMES[key]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 mb-8 p-1 bg-slate-50 rounded-lg w-fit mx-auto">
        <button
          id="upload-file-tab-btn"
          onClick={() => setPasteMode(false)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
            !pasteMode
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
        <button
          id="paste-text-tab-btn"
          onClick={() => setPasteMode(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
            pasteMode
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clipboard className="w-4 h-4" />
          Paste Resume Text
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!pasteMode ? (
          <motion.div
            key="file-upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            <div
              id="file-dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[340px] ${
                dragActive
                  ? "border-indigo-650 bg-indigo-50/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
              onClick={handleButtonClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-indigo-650 mb-6 group-hover:scale-105 transition-transform border border-slate-100">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Drag and drop your resume file here
              </h3>
              <p className="text-slate-400 text-sm max-w-sm mb-6">
                Supports professional PDF (.pdf) and Plain Text (.txt) formats, up to 8MB.
              </p>

              <button
                type="button"
                id="select-file-btn"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 inline-flex items-center gap-2 cursor-pointer transition-all"
                disabled={isLoading}
              >
                Choose File
              </button>
            </div>

            {fileError && (
              <div id="upload-error-banner" className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmitText}
            key="text-paste"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Resume Copy-Paste Clipboard
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {resumeText.length > 0 ? `${resumeText.split(/\s+/).filter(Boolean).length} words` : "Empty clipboard"}
                </span>
              </div>
              <textarea
                id="resume-pasted-textarea"
                rows={12}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the full content of your resume (Summary, Skills, Education, Professional Experience, Projects)..."
                className="w-full px-5 py-4 focus:outline-hidden text-slate-600 placeholder-slate-400 text-sm font-mono leading-relaxed resize-none focus:ring-0 focus:border-transparent bg-white"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="submit-pasted-resume-btn"
                disabled={isLoading || !resumeText.trim()}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 shadow-md shadow-indigo-100 inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Pasted Resume
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Sample Resumes Section */}
      <div className="mt-12 text-center">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          No Resume On Hand? Test Instantly With These Samples:
        </h4>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            id="load-sample-dev-btn"
            disabled={isLoading}
            onClick={() => loadSample("softwareEngineer")}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Software Engineer
          </button>
          <button
            id="load-sample-designer-btn"
            disabled={isLoading}
            onClick={() => loadSample("uxDesigner")}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Product Designer
          </button>
          <button
            id="load-sample-marketer-btn"
            disabled={isLoading}
            onClick={() => loadSample("marketingSpecialist")}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Growth Marketer
          </button>
        </div>
      </div>
    </div>
  );
}
