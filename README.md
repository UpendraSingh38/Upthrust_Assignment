Upthrust_Assignment — Mini Workflow Automation with AI Agent:-

This project is a mini workflow automation app where users can enter a prompt, and the system generates a result by combining an AI response with data from a third-party API.

Supported actions:-

🌦 Weather — via OpenWeatherMap API

💻 GitHub — fetch trending repositories

📰 News — via GNews API

Tech Stack:-


Backend: Node.js, Express, Google Gemini API

Frontend: React (Vite), TailwindCSS

APIs Used:


Google Gemini (gemini-pro)

OpenWeatherMap (Weather data)

GitHub API (Trending repos)

GNews API (Top headlines)

Setup Instructions:-


cd Upthrust_Assignment
Backend Setup
cd backend
npm install
cp .env.example .env


Example .env

PORT=4000

# Gemini AI Studio
GEMINI_API_KEY=your_google_ai_studio_api_key

# Weather API (OpenWeatherMap)
OPENWEATHER_API_KEY=your_openweathermap_api_key

# GitHub Token (optional for higher rate limits)
GITHUB_TOKEN=your_github_pat

# GNews API
GNEWS_API_KEY=your_gnews_api_key

# Mock mode (use fake responses without real API calls)
MOCK=false


Run Backend

npm run start
# or (with auto-reload using nodemon)
npm run dev
Backend runs on: 👉 http://localhost:4000

Frontend Setup
cd frontend
npm install
cp .env.example .env
Example .env

VITE_BACKEND_URL=http://localhost:4000
Run Frontend

npm run dev
Frontend runs on: 👉 http://localhost:5173


🚀 Example Usage


Request (Weather)


POST /run-workflow

{

  "prompt": "Write a tweet about today’s weather in Delhi",
  
  "action": "weather",
  
  "params": { "city": "Delhi" }

}

Response

{

  "ai_response": "Sunny vibes, perfect for tea",
  
  "api_response": "light sunny in Delhi, 37°C",
  
  "final_result": "Sunny vibes, perfect for tea , light sunny in Delhi, 37°C #weather"

}
