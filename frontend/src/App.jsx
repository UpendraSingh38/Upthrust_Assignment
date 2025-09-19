

import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [action, setAction] = useState("weather");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    if (!prompt.trim()) {
      setError("Prompt cannot be empty");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const payload = { prompt, action, params: {} };
      if (action === "weather") payload.params.city = city || "Delhi";

      const res = await fetch(`${BACKEND_URL}/run-workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Server error");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Mini Workflow Automation</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              placeholder={`e.g. "Write a tweet about today's weather in Mumbai"`}
            ></textarea>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 p-2"
              >
                <option value="weather">Weather</option>
                <option value="github">GitHub (trending)</option>
                <option value="news">News</option>
              </select>
            </div>

            {action === "weather" && (
              <div className="w-1/3">
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Delhi"
                  className="mt-1 block w-full rounded-md border-gray-200 p-2"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-full text-white ${
                loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Running..." : "Run Workflow"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPrompt("");
                setCity("");
                setResult(null);
                setError("");
              }}
              className="px-3 py-2 rounded-full border"
            >
              Reset
            </button>

            <div className="text-sm text-slate-500 ml-auto">
              Backend:{" "}
              <code className="bg-slate-100 px-2 py-0.5 rounded">{BACKEND_URL}</code>
            </div>
          </div>
        </form>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        {result && (
          <div className="mt-6 bg-slate-50 border rounded-lg p-4">
            <h3 className="font-medium">Result</h3>
            <div className="mt-2 text-slate-800">
              <strong>AI:</strong> {result.ai_response}
            </div>
            <div className="mt-1 text-slate-800">
              <strong>API:</strong> {result.api_response}
            </div>
            <div className="mt-1 text-slate-900 font-semibold">
              <strong>Final:</strong> {result.final_result}
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-slate-400">
          Tips: Make sure backend CORS allows this origin. If backend is on different host,
          set VITE_BACKEND_URL in .env.
        </div>
      </div>
    </div>
  );
}
