export interface Education {
  institution: string;
  degree: string;
  year?: string;
}

export interface Experience {
  company: string;
  role: string;
  duration?: string;
  description?: string;
}

export interface Project {
  name: string;
  description: string;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  sampleAnswer: string;
  concept: string;
}

export interface ResumeAnalysisReport {
  summary: string;
  atsScore: number;
  detectedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  areasForImprovement: string[];
  suggestedJobRoles: string[];
  contactInfo: ContactInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  technicalQuestions: InterviewQuestion[];
  hrQuestions: InterviewQuestion[];
  jdMatchRate?: number;
  missingJdKeywords?: string[];
  jdInterviewQuestions?: InterviewQuestion[];
  resumeText?: string;
}

export interface SavedScan {
  id: string;
  timestamp: number;
  fileName: string;
  report: ResumeAnalysisReport;
}
