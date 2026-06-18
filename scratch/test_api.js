const resumeText = `Emily Chen
Full Stack Developer
Email: emily.chen@email.com
Experience:
- Developed React applications with TypeScript and TailwindCSS.
- Managed Node.js backends and built APIs.
Skills: React, TypeScript, Node.js, HTML, CSS`;

const jobDescription = "data scientist";

async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescription })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 1000));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

run();
