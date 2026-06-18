import React, { useState } from "react";
import { 
  Award, 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  TrendingUp, 
  FileText, 
  AlertTriangle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { ResumeAnalysisReport } from "../types";
import { motion } from "motion/react";

interface AtsDashboardProps {
  report: ResumeAnalysisReport;
  onAnalyzeJd?: (resumeText: string, jobDescription: string) => void;
}

export default function AtsDashboard({ report, onAnalyzeJd }: AtsDashboardProps) {
  const {
    summary,
    atsScore,
    detectedSkills = [],
    missingSkills = [],
    strengths = [],
    areasForImprovement = [],
    suggestedJobRoles = [],
    contactInfo = {},
    education = [],
    experience = [],
    projects = [],
    jdMatchRate,
    missingJdKeywords = [],
    resumeText
  } = report;

  const [localJd, setLocalJd] = useState("");
  const [showInput, setShowInput] = useState(false);

  const hasJd = typeof jdMatchRate === "number" && jdMatchRate !== null;

  // Gauge color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: "text-emerald-700", border: "border-emerald-200", progress: "#059669", bg: "bg-emerald-50" };
    if (score >= 60) return { text: "text-amber-700", border: "border-amber-200", progress: "#d97706", bg: "bg-amber-50" };
    return { text: "text-rose-700", border: "border-rose-200", progress: "#dc2626", bg: "bg-rose-50" };
  };

  const colors = getScoreColor(atsScore);

  return (
    <div className="space-y-8">
      {/* Upper Grid - Summary & ATS Score Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Dial Column */}
        <div className="flex flex-col gap-6">
          {/* ATS Score Dial */}
          <div id="ats-score-card" className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ATS Optimization Score</h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <motion.circle 
                  cx="64" 
                  cy="64" 
                  r="58" 
                  stroke={colors.progress} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="364.4" 
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * Math.min(Math.max(atsScore, 0), 100)) / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-3xl font-extrabold text-slate-800">{atsScore}<span className="text-sm text-slate-450 font-normal">/100</span></span>
            </div>
            <p className={`mt-4 text-sm font-semibold capitalize ${colors.text}`}>{atsScore >= 80 ? "Strong Match" : atsScore >= 60 ? "Good Potential" : "Needs Optimization"}</p>
          </div>

          {/* JD Match Input or Dial */}
          {(!hasJd || showInput) && onAnalyzeJd ? (
            <div id="jd-input-card" className="bg-white rounded-2xl border border-indigo-200 p-5 flex flex-col justify-between shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-650 animate-pulse" />
                  Target JD Matcher
                </h3>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Paste a job description to assess your match rate and generate customized interview prep.
                </p>
              </div>
              <textarea
                rows={4}
                value={localJd}
                onChange={(e) => setLocalJd(e.target.value)}
                placeholder="Paste Job Description requirements here..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[11px] focus:outline-hidden focus:border-indigo-500 font-sans leading-relaxed bg-white text-slate-700 resize-none"
              />
              <div className="flex gap-2">
                {showInput && (
                  <button
                    onClick={() => setShowInput(false)}
                    className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  disabled={!localJd.trim()}
                  onClick={async () => {
                    let textToAnalyze = resumeText || "";
                    if (!textToAnalyze) {
                      const parts = [
                        contactInfo.name || "",
                        contactInfo.email || "",
                        contactInfo.phone || "",
                        detectedSkills.length > 0 ? `Skills: ${detectedSkills.join(", ")}` : "",
                        experience.map(e => `${e.role || ""} at ${e.company || ""}\n${e.duration || ""}\n${e.description || ""}`).join("\n\n"),
                        projects.map(p => `${p.name || ""}\n${p.description || ""}`).join("\n\n"),
                        education.map(ed => `${ed.degree || ""} - ${ed.institution || ""} (${ed.year || ""})`).join("\n\n")
                      ].filter(Boolean);
                      textToAnalyze = parts.join("\n\n");
                    }
                    if (onAnalyzeJd) {
                      await onAnalyzeJd(textToAnalyze, localJd);
                    }
                    setShowInput(false);
                  }}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                >
                  Analyze Match
                </button>
              </div>
            </div>
          ) : (
            hasJd && (
              <div id="jd-score-card" className="bg-white rounded-2xl border border-indigo-200 p-6 flex flex-col items-center justify-center text-center shadow-sm flex-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 justify-center">
                  <Award className="w-4 h-4 text-indigo-650" />
                  JD Match Rate
                </h3>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <motion.circle 
                      cx="64" 
                      cy="64" 
                      r="58" 
                      stroke="#4f46e5" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="364.4" 
                      initial={{ strokeDashoffset: 364.4 }}
                      animate={{ strokeDashoffset: 364.4 - (364.4 * Math.min(Math.max(jdMatchRate || 0, 0), 100)) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold text-slate-800">{jdMatchRate}<span className="text-sm text-slate-450 font-normal">/100</span></span>
                </div>
                <p className="mt-4 text-sm font-semibold capitalize text-indigo-700">
                  {jdMatchRate >= 80 ? "Excellent Fit" : jdMatchRate >= 60 ? "Good Alignment" : "Gaps Detected"}
                </p>
                <button
                  onClick={() => setShowInput(true)}
                  className="mt-4 text-[9px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-all flex items-center gap-1 uppercase tracking-wider mx-auto border border-indigo-100 px-2.5 py-1 rounded bg-indigo-50/30 hover:bg-indigo-50"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Match Another Job
                </button>
              </div>
            )
          )}
        </div>

        {/* Executive Summary & Contact Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <FileText className="w-4.5 h-4.5" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Summary</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              {summary || "No executive summary parsed from the provided document content."}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Primary Details</span>
              <div className="flex items-center gap-2 text-sm text-slate-750">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{contactInfo.name || "Candidate Name Undetected"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {contactInfo.email && (
                <div className="flex items-center gap-1.5 text-slate-550 overflow-hidden text-ellipsis">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${contactInfo.email}`} className="hover:text-indigo-650 truncate font-mono">{contactInfo.email}</a>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center gap-1.5 text-slate-550 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo.linkedin && (
                <div className="flex items-center gap-1.5 text-slate-550 truncate">
                  <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{contactInfo.linkedin}</span>
                </div>
              )}
              {contactInfo.github && (
                <div className="flex items-center gap-1.5 text-slate-550 truncate">
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{contactInfo.github}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Matrix & Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Extracted & Missing Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <h3 className="text-sm font-bold text-slate-800">Key Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedSkills.length > 0 ? (
                detectedSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No skills parsed automatically.</span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <h3 className="text-sm font-bold text-slate-800 flex-1">Areas for Improvement / Missing Skills</h3>
            </div>
            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Your resume ranks excellently against standard industry keywords!</p>
            )}
          </div>

          {hasJd && missingJdKeywords.length > 0 && (
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <h3 className="text-sm font-bold text-slate-800 flex-1">Missing JD Keywords / Technologies</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingJdKeywords.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Strengths & Improvements Lists */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-505 bg-indigo-600"></div>
              <h3 className="text-sm font-bold text-slate-800">Analytical Highlights</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {strengths.length > 0 ? (
                strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                    <span>{str}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No highlighting aspects found.</li>
              )}
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <h3 className="text-sm font-bold text-slate-800">Actionable Feedback</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {areasForImprovement.length > 0 ? (
                areasForImprovement.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))
              ) : (
                <li className="text-emerald-600 italic">Perfect layout formatting! No critical errors identified.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested Careers Pathways */}
      {suggestedJobRoles.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Suggested Roles</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedJobRoles.map((role, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-150">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Structured Resume Sections extracted - Experience / projects / education */}
      <div className="space-y-6">
        <h3 className="font-display font-bold text-base text-slate-800 border-b border-slate-200 pb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Extracted Resume Components
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Work History */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Employment Record
            </h4>
            
            <div className="space-y-4">
              {experience && experience.length > 0 ? (
                experience.map((exp, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 relative overflow-hidden transition-all hover:shadow-md">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm md:text-base">{exp.role}</h5>
                        <p className="text-xs font-semibold text-indigo-600 font-sans">{exp.company}</p>
                      </div>
                      {exp.duration && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-semibold font-mono">
                          {exp.duration}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed pt-1 font-sans">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-450 italic">No structured experience parsed.</p>
              )}
            </div>
          </div>

          {/* Education & Projects Panel */}
          <div className="space-y-6">
            {/* Education */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                Education History
              </h4>
              <div className="space-y-3">
                {education && education.length > 0 ? (
                  education.map((edu, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 relative overflow-hidden transition-all hover:border-slate-300 shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                      <h5 className="font-bold text-slate-800 text-xs">{edu.degree}</h5>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">{edu.institution}</span>
                        {edu.year && <span className="text-slate-450 font-mono font-medium">{edu.year}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-450 italic">No education parsed.</p>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-slate-400" />
                Featured Projects
              </h4>
              <div className="space-y-3">
                {projects && projects.length > 0 ? (
                  projects.map((proj, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1.5 relative overflow-hidden transition-all hover:border-slate-305 shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                      <h5 className="font-bold text-slate-800 text-xs">{proj.name}</h5>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">
                        {proj.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-450 italic">No projects found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
