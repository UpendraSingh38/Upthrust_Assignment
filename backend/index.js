import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MOCK = process.env.MOCK === "true";

// ------------------ Gemini AI Agent ------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


async function callAI(prompt) {
  if (MOCK) return "Mock: Perfect day to chill!";
  try {
    const result = await model.generateContent(
      `${prompt}\nKeep it short (tweet-sized).`
    );
    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini Error:", err.message);
    return "Gemini API Error.";
  }
}

// ------------------ Weather API ------------------
async function callWeather(city = "Delhi") {
  if (MOCK) return "Mock: Sunny in Delhi, 32°C";
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${key}`;
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j.message || "Weather API error");
    return `${j.weather[0].description} in ${j.name}, ${Math.round(
      j.main.temp
    )}°C`;
  } catch (err) {
    console.error("Weather Error:", err.message);
    return "Weather API Error.";
  }
}

// ------------------ GitHub API ------------------
async function callGithubTrending() {
  if (MOCK) return "Mock: repo1, repo2, repo3";
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const iso = since.toISOString().split("T")[0];
    const url = `https://api.github.com/search/repositories?q=created:>${iso}&sort=stars&order=desc&per_page=5`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
    });
    const j = await res.json();
    return j.items
      ?.slice(0, 3)
      .map((i) => `${i.full_name} (${i.stargazers_count}★)`)
      .join("; ");
  } catch (err) {
    console.error("GitHub Error:", err.message);
    return "GitHub API Error.";
  }
}

// ------------------ News API (Placeholder) ------------------
async function callNews() {
  if (MOCK) return "Mock: Breaking News - AI takes over!";

  try {
    const key = process.env.GNEWS_API_KEY;
    const url = `https://gnews.io/api/v4/top-headlines?token=${key}&lang=en&country=in&max=3`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "News API error");

    // Take top 3 headlines
    return data.articles
      .map((a) => a.title)
      .join("; ");
  } catch (err) {
    console.error("GNews API Error:", err.message);
    return "GNews API Error.";
  }
}


// ------------------ Main Workflow Endpoint ------------------
app.post("/run-workflow", async (req, res) => {
  try {
    const { prompt, action, params } = req.body;

    // Step 1: AI Response
    const ai_response = await callAI(prompt);

    // Step 2: API Response
    let api_response = "";
    if (action === "weather") {
      api_response = await callWeather(params?.city || "Delhi");
    } else if (action === "github") {
      api_response = await callGithubTrending();
    } else if (action === "news") {
      api_response = await callNews();
    } else {
      api_response = "Unknown action.";
    }

    // Step 3: Combine Results
    const final_result = `${ai_response} ${api_response} #${action}`;

    res.json({ ai_response, api_response, final_result });
  } catch (err) {
    console.error("Workflow Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------ History (in-memory store) ------------------
let history = [];
app.get("/history", (req, res) => {
  res.json(history.slice(-10).reverse());
});

app.post("/run-workflow", async (req, res, next) => {
  try {
    const response = await callAI(req.body.prompt);
    history.push({ ...req.body, response, created_at: new Date() });
    res.json(response);
  } catch (err) {
    next(err);
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Gemini Backend running on http://localhost:${PORT}`)
);
