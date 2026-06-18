import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure high payload limits for supporting large resume attachment uploads (PDFs)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Requests will fail until injected.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for resume analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { resumeText, fileData, fileName, mimeType, jobDescription } = req.body;

      if (!resumeText && !fileData) {
        return res.status(400).json({ error: "Missing input. Please upload a resume file or paste the resume text." });
      }

      let extractedText = resumeText || "";

      if (fileData) {
        const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        try {
          const { PDFParse } = pdf;
          const parser = new PDFParse(new Uint8Array(buffer));
          const pdfData = await parser.getText();
          extractedText = pdfData.text;
        } catch (pdfError: any) {
          console.error("PDF parsing failed:", pdfError);
          throw new Error(`Failed to extract text from PDF: ${pdfError.message}`);
        }
      }

      let parsedData: any;

      if (apiKey && apiKey.startsWith("gsk_")) {
        console.log("Dispatching Groq API analytical request...");
        
        const systemInstruction = `You are an elite Resume Reviewer and Technical Interview Coach.
Analyze the candidate's resume and generate a JSON report containing custom interview prep tailored precisely to their details.
You must return a JSON object with the following fields:
1. 'summary' - executive summary of the candidate's profile.
2. 'atsScore' - realistic score from 0 to 100 assessing layout suitability, impact words, and skill density.
3. 'detectedSkills' - extracted skills from their text.
4. 'missingSkills' - key tools or skills they should add to excel in their target role.
5. 'strengths' - 3 to 5 key competencies.
6. 'areasForImprovement' - actionable, high-impact resume improvements.
7. 'suggestedJobRoles' - job titles they fit well.
8. 'contactInfo' - object with properties: name, email, phone, linkedin, github.
9. 'education' - array of objects, each with: institution, degree, year.
10. 'experience' - array of objects, each with: company, role, duration, description.
11. 'projects' - array of objects, each with: name, description.
12. 'technicalQuestions' - EXACTLY 10 rich, challenging mechanical/system/domain questions focused on their technology stack or industry with clear and technical sample answers. Each object has: id, question, sampleAnswer, concept.
13. 'hrQuestions' - EXACTLY 5 behavioral questions (leadership, conflict resolution, work ethic) with complete answers framed under professional structure (like the STAR method). Each object has: id, question, sampleAnswer, concept.
14. 'jdMatchRate' - realistic matching score from 0 to 100 against target Job Description, or null if no Job Description is provided.
15. 'missingJdKeywords' - array of skills/technologies/qualifications in Job Description but missing/weak in resume, or empty array if none or no Job Description provided.
16. 'jdInterviewQuestions' - EXACTLY 5 custom questions derived from resume/Job Description alignment and gaps, or empty array if no Job Description provided. Each object has: id, question, sampleAnswer, concept.

Ensure all fields are fully populated and the response is strict JSON. Do not include markdown wraps or any text outside the JSON object.`;

        let promptText = `Analyze this resume document thoroughly.
${fileData ? `File name of uploaded resume: "${fileName || "Uploaded Resume"}".` : ""}
Resume Content:
---
${extractedText}
---
Using your professional knowledge as a Head Recruiter and ATS Auditor, produce a structured analysis of this document. Extract the contact details, education, experience, and projects, evaluate the ATS Compatibility score, identify missing tech skills, list strengths, provide constructive improvements, suggest fitting roles, and generate exactly 10 technical and exactly 5 behavioral interview prep questions.`;

        if (jobDescription) {
          promptText += `\n\nAdditionally, a target Job Description has been provided:
---
${jobDescription}
---
Please evaluate how well the candidate's resume matches this target Job Description. Calculate the 'jdMatchRate' score, extract the 'missingJdKeywords', and generate exactly 5 custom 'jdInterviewQuestions' tailored specifically to address gaps or highlight relevant matching experience.`;
        } else {
          promptText += `\n\nNo target Job Description was provided. Please set 'jdMatchRate' to null, 'missingJdKeywords' to an empty array [], and 'jdInterviewQuestions' to an empty array [].`;
        }

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: promptText }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          })
        });

        if (!groqResponse.ok) {
          const errText = await groqResponse.text();
          throw new Error(`Groq API returned error status ${groqResponse.status}: ${errText}`);
        }

        const groqJson = await groqResponse.json();
        const rawText = groqJson.choices?.[0]?.message?.content;
        if (!rawText) {
          throw new Error("Empty response received from Groq API.");
        }
        parsedData = JSON.parse(rawText.trim());
      } else {
        const contents: any[] = [];
        let promptText = "";

        if (fileData) {
          // Clean base64 uri scheme if present
          const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
          contents.push({
            inlineData: {
              mimeType: mimeType || "application/pdf",
              data: base64Data
            }
          });
          promptText = `Analyze this resume document thoroughly.
File name of uploaded resume: "${fileName || "Uploaded Resume"}".
Using your professional knowledge as a Head Recruiter and ATS Auditor, produce a structured analysis of this document. Extract the contact details, education, experience, and projects, evaluate the ATS Compatibility score, identify missing tech skills, list strengths, provide constructive improvements, suggest fitting roles, and generate exactly 10 technical and exactly 5 behavioral interview prep questions.`;
        } else {
          promptText = `Analyze this raw text resume thoroughly:
---
${extractedText}
---
Using your professional knowledge as a Head Recruiter and ATS Auditor, produce a structured analysis of this document. Extract the contact details, education, experience, and projects, evaluate the ATS Compatibility score, identify missing tech skills, list strengths, provide constructive improvements, suggest fitting roles, and generate exactly 10 technical and exactly 5 behavioral interview prep questions.`;
        }

        if (jobDescription) {
          promptText += `\n\nAdditionally, a target Job Description has been provided:
---
${jobDescription}
---
Please evaluate how well the candidate's resume matches this target Job Description. Calculate the 'jdMatchRate' score, extract the 'missingJdKeywords', and generate exactly 5 custom 'jdInterviewQuestions' tailored specifically to address gaps or highlight relevant matching experience.`;
        } else {
          promptText += `\n\nNo target Job Description was provided. Please set 'jdMatchRate' to null, 'missingJdKeywords' to an empty array [], and 'jdInterviewQuestions' to an empty array [].`;
        }

        contents.push({ text: promptText });

        console.log("Dispatching Gemini API analytical request...");

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: `You are an elite Resume Reviewer and Technical Interview Coach.
Analyze the candidate's resume and generate a JSON report containing custom interview prep tailored precisely to their details.
Ensure you return:
1. 'atsScore' - realistic score from 0 to 100 assessing layout suitability, impact words, and skill density.
2. 'detectedSkills' - extracted skills from their text.
3. 'missingSkills' - key tools or skills they should add to excel in their target role.
4. 'strengths' - 3 to 5 key competencies.
5. 'areasForImprovement' - actionable, high-impact resume improvements.
6. 'suggestedJobRoles' - job titles they fit well.
7. 'technicalQuestions' - EXACTLY 10 rich, challenging mechanical/system/domain questions focused on their technology stack or industry with clear and technical sample answers.
8. 'hrQuestions' - EXACTLY 5 behavioral questions (leadership, conflict resolution, work ethic) with complete answers framed under professional structure (like the STAR method).
Format everything strictly to the requested JSON responseSchema. Do not include markdown wraps or anything outside the JSON structure.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                atsScore: { type: Type.INTEGER },
                detectedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedJobRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                contactInfo: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    linkedin: { type: Type.STRING },
                    github: { type: Type.STRING }
                  }
                },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      institution: { type: Type.STRING },
                      degree: { type: Type.STRING },
                      year: { type: Type.STRING }
                    },
                    required: ["institution", "degree"]
                  }
                },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      company: { type: Type.STRING },
                      role: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["company", "role"]
                  }
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "description"]
                  }
                },
                technicalQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      question: { type: Type.STRING },
                      sampleAnswer: { type: Type.STRING },
                      concept: { type: Type.STRING }
                    },
                    required: ["id", "question", "sampleAnswer", "concept"]
                  }
                },
                hrQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      question: { type: Type.STRING },
                      sampleAnswer: { type: Type.STRING },
                      concept: { type: Type.STRING }
                    },
                    required: ["id", "question", "sampleAnswer", "concept"]
                  }
                },
                jdMatchRate: { type: Type.INTEGER },
                missingJdKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                jdInterviewQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      question: { type: Type.STRING },
                      sampleAnswer: { type: Type.STRING },
                      concept: { type: Type.STRING }
                    },
                    required: ["id", "question", "sampleAnswer", "concept"]
                  }
                }
              },
              required: [
                "summary",
                "atsScore",
                "detectedSkills",
                "missingSkills",
                "strengths",
                "areasForImprovement",
                "suggestedJobRoles",
                "contactInfo",
                "education",
                "experience",
                "projects",
                "technicalQuestions",
                "hrQuestions",
                "jdMatchRate",
                "missingJdKeywords",
                "jdInterviewQuestions"
              ]
            }
          }
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Empty response received from the Gemini analysis model.");
        }

        parsedData = JSON.parse(rawText.trim());
      }
      
      parsedData.resumeText = extractedText;
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error analyzing resume:", error);
      res.status(500).json({ error: error.message || "Failed to analyze resume. Please double check file formatting!" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server started on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
