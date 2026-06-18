# AI-Resume-Analyzer
An interactive, AI-powered platform that helps candidates audit their resumes against industry ATS (Applicant Tracking System) standards, assess job description matching alignment, and prepare for interviews with a live timed practice sandbox
Powered by **Google Gemini** & **Groq API** models.

---

## ✨ Features

* **Instant ATS Compatibility Score**: Real-time evaluation of resume layout, structure, and keyword density with an interactive dial.
* **Target Job Description (JD) Analyzer**: Paste any target role description to calculate a direct **JD Match %**, highlighting exactly what technologies/qualifications are missing.
* **Dual API Support**: Seamlessly works with either Google Gemini or Groq API pipelines based on key prefix detection.
* **JD-Tailored Interview Coach**: Generates 5 custom-tailored interview questions targeting the specific gaps between the candidate's resume and the job description.
* **Timed Interview Drill Sandbox**: Includes dedicated HR behavioral prep (using the STAR method) and technical question banks with model answers and response notebooks.
* **Local Scan Directory**: Automatically caches previous auditing sessions to browser localStorage for easy reference.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, TailwindCSS, Motion (for premium animations), Lucide React.
* **Backend**: Node.js, Express, `pdf-parse` (for parsing local PDFs).
* **AI Engine**: Google Gemini 2.5 Flash / Groq LLMs.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root folder and add your key:
```env
GEMINI_API_KEY="your-gemini-or-groq-key"
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to view the app.

---

## 📦 Cloud Deployment (Render / Railway)

1. Set the **Build Command** to: `npm install && npm run build`
2. Set the **Start Command** to: `npm start`
3. Add your `GEMINI_API_KEY` under the hosting environment variables configuration.
