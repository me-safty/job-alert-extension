require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = process.env.GEMINI_API_KEY;

app.post("/gemini", async (req, res) => {
  const { description } = req.body || {};

  if (!API_KEY) {
    return res.status(400).json({ error: "❌ No Gemini API key provided" });
  }

  if (!description) {
    return res.status(400).json({ error: "❌ No description provided" });
  }

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" +
      API_KEY;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Write a professional and persuasive Upwork proposal in English based on this job description:\n\n"${description}"\n\nKeep it short, clear, and convincing.`,
            },
          ],
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("🔍 Gemini full response:\n", JSON.stringify(data, null, 2));

    const proposal =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ||
      data?.output_text ||
      "⚠️ No response from Gemini";

    res.json({ proposal });
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

app.listen(3000, () =>
  console.log("✅ Gemini proxy running on http://localhost:3000")
);
