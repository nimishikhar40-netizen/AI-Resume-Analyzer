import React, { useState } from "react";
import { 
  HelpCircle, 
  MessageSquareCode, 
  UserSquare, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  BookOpen, 
  PenTool, 
  ArrowRight, 
  Sparkles,
  Award,
  Maximize2
} from "lucide-react";
import { InterviewQuestion } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface InterviewGeneratorProps {
  technicalQuestions: InterviewQuestion[];
  hrQuestions: InterviewQuestion[];
  jdInterviewQuestions?: InterviewQuestion[];
}

export default function InterviewGenerator({ 
  technicalQuestions = [], 
  hrQuestions = [], 
  jdInterviewQuestions = [] 
}: InterviewGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"tech" | "hr" | "jd">("tech");
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  
  // Custom draft notebook
  const [userDrafts, setUserDrafts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("resume_analyzer_user_drafts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Simulator mode
  const [simulatorMode, setSimulatorMode] = useState<boolean>(false);
  const [simQuestionType, setSimQuestionType] = useState<"tech" | "hr" | "jd">("tech");
  const [simIndex, setSimIndex] = useState<number>(0);

  const questionsList = activeTab === "tech" 
    ? technicalQuestions 
    : activeTab === "hr" 
      ? hrQuestions 
      : jdInterviewQuestions;

  const simQuestions = simQuestionType === "tech" 
    ? technicalQuestions 
    : simQuestionType === "hr" 
      ? hrQuestions 
      : jdInterviewQuestions;

  const currentSimQuestion = simQuestions[simIndex];

  const handleSaveDraft = (qId: string, text: string) => {
    const updated = { ...userDrafts, [qId]: text };
    setUserDrafts(updated);
    localStorage.setItem("resume_analyzer_user_drafts", JSON.stringify(updated));
  };

  const toggleExpand = (id: number) => {
    if (expandedQuestionId === id) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(id);
    }
  };

  const startSimulator = (type: "tech" | "hr" | "jd") => {
    setSimQuestionType(type);
    setSimIndex(0);
    setSimulatorMode(true);
  };

  const hasJdQuestions = jdInterviewQuestions && jdInterviewQuestions.length > 0;

  return (
    <div className="space-y-6">
      {/* Upper Mode Switcher - Classic Book Practice vs Mock Simulation */}
      {!simulatorMode ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Immersive Mock Practice Arena
            </h3>
            <p className="text-sm text-slate-600 max-w-xl font-sans">
              Switch from passive viewing to active simulation! Practice answering candidate questions in our timed mock wizard and self-assess against model solutions.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <button
              onClick={() => startSimulator("tech")}
              id="start-simulator-tech-btn"
              className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Practice Tech Questions
            </button>
            <button
              onClick={() => startSimulator("hr")}
              id="start-simulator-hr-btn"
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-indigo-600" />
              Practice HR Questions
            </button>
            {hasJdQuestions && (
              <button
                onClick={() => startSimulator("jd")}
                id="start-simulator-jd-btn"
                className="px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-indigo-600 animate-pulse" />
                Practice JD Questions
              </button>
            )}
          </div>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {simulatorMode ? (
          /* Interview Simulator View */
          <motion.div
            key="simulator"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-2xl border border-indigo-600 shadow-lg p-6 md:p-8 space-y-6 relative overflow-hidden"
          >
            <div id="simulator-header" className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">
                  Active Practice: {simQuestionType === "tech" ? "Technical" : "Behavioral/HR"}
                </span>
              </div>
              <button
                onClick={() => setSimulatorMode(false)}
                id="quit-simulator-btn"
                className="text-xs font-semibold text-slate-500 hover:text-slate-850 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-all cursor-pointer"
              >
                Quit Simulator
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Completed: {Math.round((simIndex / simQuestions.length) * 100)}%</span>
                <span className="font-mono">Question {simIndex + 1} of {simQuestions.length}</span>
              </div>
              <div className="w-full bg-slate-150 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${((simIndex + 1) / simQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Screen */}
            <div className="py-6 space-y-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                {currentSimQuestion?.concept || "Key Aptitude Core"}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight leading-snug">
                "{currentSimQuestion?.question}"
              </h2>
            </div>

            {/* Practice Pad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  Your Draft Notebook Response
                </label>
                <textarea
                  id={`sim-draft-area-${simQuestionType}-${simIndex}`}
                  rows={8}
                  value={userDrafts[`${simQuestionType}_${currentSimQuestion?.id}`] || ""}
                  onChange={(e) => handleSaveDraft(`${simQuestionType}_${currentSimQuestion?.id}`, e.target.value)}
                  placeholder={
                    simQuestionType === "hr"
                      ? "Structure your answer here! We suggest using the STAR format:\n• Situation: Outline the context.\n• Task: Briefly explain the goal.\n• Action: Detail the specific steps you took.\n• Result: Detail values, metrics, and positive outcomes..."
                      : "Jot down your architectural code layout, core definitions, frameworks, and key technical factors..."
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed bg-white text-slate-700"
                />
                <span className="text-xs text-slate-400 italic">Saved dynamically to your profile logs.</span>
              </div>

              {/* Answer comparison */}
              <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 tracking-widest uppercase">
                    <CheckCircle className="w-4 h-4" />
                    Ideal Solution Guidelines
                  </div>
                  <div className="text-xs font-sans text-slate-600 leading-relaxed max-h-[190px] overflow-y-auto pr-2 whitespace-pre-line">
                    {currentSimQuestion?.sampleAnswer}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Evaluate your response based on the checklists.</span>
                  <span className="font-semibold text-emerald-600">Sample Answer Key Injected</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t border-slate-150 border-slate-200 pt-5 flex justify-between items-center gap-4">
              <button
                disabled={simIndex === 0}
                onClick={() => setSimIndex((prev) => prev - 1)}
                id="sim-prev-btn"
                className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 select-none cursor-pointer"
              >
                Previous
              </button>

              {simIndex < simQuestions.length - 1 ? (
                <button
                  onClick={() => setSimIndex((prev) => prev + 1)}
                  id="sim-next-btn"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs select-none inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setSimulatorMode(false)}
                  id="sim-complete-btn"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs select-none inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  Complete Sandbox!
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Normal Book Practice View */
          <motion.div
            key="practice-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Tab switchers */}
            <div className="flex border-b border-slate-200">
              <button
                id="tech-practice-tab-btn"
                onClick={() => {
                  setActiveTab("tech");
                  setExpandedQuestionId(null);
                }}
                className={`flex items-center gap-2.5 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  activeTab === "tech"
                    ? "border-indigo-600 text-indigo-600 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-800"
                }`}
              >
                <MessageSquareCode className="w-4.5 h-4.5" />
                Technical Practice ({technicalQuestions.length})
              </button>
              <button
                id="hr-practice-tab-btn"
                onClick={() => {
                  setActiveTab("hr");
                  setExpandedQuestionId(null);
                }}
                className={`flex items-center gap-2.5 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  activeTab === "hr"
                    ? "border-indigo-600 text-indigo-600 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-800"
                }`}
              >
                <UserSquare className="w-4.5 h-4.5" />
                Behavioral Prep ({hrQuestions.length})
              </button>
              {hasJdQuestions && (
                <button
                  id="jd-practice-tab-btn"
                  onClick={() => {
                    setActiveTab("jd");
                    setExpandedQuestionId(null);
                  }}
                  className={`flex items-center gap-2.5 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeTab === "jd"
                      ? "border-indigo-600 text-indigo-600 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-800"
                  }`}
                >
                  <Award className="w-4.5 h-4.5" />
                  JD-Tailored Prep ({jdInterviewQuestions.length})
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questionsList.map((q, idx) => {
                const uniqueKey = `${activeTab}_${q.id}`;
                const isExpanded = expandedQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className={`bg-white border rounded-2xl overflow-hidden transition-all duration-150 ${
                      isExpanded ? "border-indigo-600 shadow-sm" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Header trigger */}
                    <div
                      id={`question-header-trigger-${activeTab}-${q.id}`}
                      onClick={() => toggleExpand(q.id)}
                      className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="w-6 h-6 bg-indigo-50 text-indigo-700 flex-shrink-0 rounded-full flex items-center justify-center font-mono text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] uppercase font-bold tracking-widest rounded border border-slate-200">
                            {q.concept || "Aptitude Domain"}
                          </span>
                          <h4 className="text-slate-800 font-bold text-sm md:text-base leading-snug">
                            {q.question}
                          </h4>
                        </div>
                      </div>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Expandable answers / notepad content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 border-t border-slate-150 bg-slate-50/20 space-y-5">
                        {/* Sample solution area */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-display">Model Sample Answer</label>
                          <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                            {q.sampleAnswer}
                          </div>
                        </div>

                        {/* Notepad response log */}
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <PenTool className="w-3.5 h-3.5" />
                            Draft Practice Answer
                          </label>
                          <textarea
                            id={`draft-area-${activeTab}-${q.id}`}
                            rows={4}
                            value={userDrafts[uniqueKey] || ""}
                            onChange={(e) => handleSaveDraft(uniqueKey, e.target.value)}
                            placeholder="Write your answer draft here to practice. Your answers are stored locally so you can return to them later!"
                            className="w-full bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed text-slate-700"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
