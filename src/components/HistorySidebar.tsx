import React, { useState } from "react";
import { Search, Trash2, Calendar, FileText, ChevronRight, RefreshCw, Layers } from "lucide-react";
import { SavedScan } from "../types";

interface HistorySidebarProps {
  scans: SavedScan[];
  onSelectScan: (scan: SavedScan) => void;
  onDeleteScan: (id: string) => void;
  onNewScan: () => void;
  activeScanId?: string;
}

export default function HistorySidebar({
  scans = [],
  onSelectScan,
  onDeleteScan,
  onNewScan,
  activeScanId
}: HistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredScans = scans.filter((scan) => {
    const term = searchQuery.toLowerCase();
    const fileNameMatch = (scan.fileName || "").toLowerCase().includes(term);
    const summaryMatch = (scan.report?.summary || "").toLowerCase().includes(term);
    const nameMatch = (scan.report?.contactInfo?.name || "").toLowerCase().includes(term);
    const skillMatch = (scan.report?.detectedSkills || []).some(s => s && s.toLowerCase().includes(term));
    
    return fileNameMatch || summaryMatch || nameMatch || skillMatch;
  });

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="w-full flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-650" />
          Scans History Logs
        </h3>
        <button
          onClick={onNewScan}
          id="new-scan-sidebar-btn"
          className="p-1.5 hover:bg-slate-100 hover:text-indigo-600 rounded text-slate-500 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold px-2 border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            id="history-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates, skills, files..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Scans List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[220px]">
        {filteredScans.length > 0 ? (
          filteredScans.map((scan) => {
            const isActive = scan.id === activeScanId;
            const candidateName = scan.report?.contactInfo?.name || "Candidate Name";
            const role = scan.report?.suggestedJobRoles?.[0] || scan.fileName;

            return (
              <div
                key={scan.id}
                className={`p-3.5 transition-all text-left flex items-start justify-between gap-2 relative group hover:bg-slate-50/50 ${
                  isActive ? "bg-slate-50/80 border-l-3 border-indigo-600" : ""
                }`}
              >
                <div
                  className="flex-1 cursor-pointer min-w-0"
                  onClick={() => onSelectScan(scan)}
                  id={`history-scan-item-${scan.id}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {candidateName}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 font-bold font-mono border rounded-full ${scoreColor(scan.report?.atsScore || 0)}`}>
                      {scan.report?.atsScore || 0}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mb-1.5 font-sans">
                    {role} • <span className="font-mono text-slate-400">{scan.fileName}</span>
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(scan.timestamp)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteScan(scan.id);
                  }}
                  id={`delete-scan-btn-${scan.id}`}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-md text-slate-400 transition-all cursor-pointer"
                  title="Delete scan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
            <FileText className="w-8 h-8 text-slate-200 mb-2" />
            <span className="text-xs font-medium">No resume scans saved yet.</span>
          </div>
        )}
      </div>

      {scans.length > 0 && (
        <div className="p-3 bg-slate-50 text-[10px] text-slate-400 border-t border-slate-200 flex justify-between items-center">
          <span>Total Scans: {scans.length}</span>
          <span>Logs saved locally</span>
        </div>
      )}
    </div>
  );
}
