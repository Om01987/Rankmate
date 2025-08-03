// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow JSON bodies & CORS
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3001", // React dev server
  "https://rankmate-frontend.onrender.com", // your deployed frontend URL
];

// app.use(
//   cors({
//     origin: "http://localhost:3001",
//     / // React dev server
//     credentials: false,
//   })
// );

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3001", // React dev server
//       "https://rankmate-frontend.onrender.com", // your deployed frontend URL
//     ],
//     credentials: false,
//   })
// );

app.use(
  cors({
    origin(origin, callback) {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        // echo back the origin
        return callback(null, origin);
      }

      // otherwise block it
      return callback(new Error("CORS policy: Origin not allowed"), false);
    },
    credentials: false,
    optionsSuccessStatus: 200,
  })
);

app.post("/fetch-rrb", async (req, res) => {
  const { url } = req.body;

  console.log("Proxy received URL:", req.body.url);

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    // Add headers to mimic a real browser request
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow", // explicitly follow redirects (301, 302, 307 etc)
      follow: 20, // maximum number of redirects to follow
      timeout: 20000, // increase timeout to 20 seconds
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    res.setHeader("Content-Type", "text/html");
    res.send(data);
  } catch (err) {
    console.error("Proxy fetch error:", err);
    res.status(500).json({
      error: "Failed to fetch the provided URL",
      details: err.message,
    });
  }
});

// Image proxy endpoint to handle CORS issues
app.post("/proxy-image", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    // const response = await fetch(url, {
    //   headers: {
    //     "User-Agent":
    //       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    //     Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
    //     "Accept-Language": "en-US,en;q=0.5",
    //     Connection: "keep-alive",
    //   },
    //   timeout: 8000, // 8 second timeout for images
    // });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
      },
      redirect: "follow", // follow redirects
      follow: 20,
      timeout: 15000, // increase timeout since images may be slower
    });

    if (!response.ok) {
      console.error(
        "Image fetch failed:",
        response.status,
        response.statusText
      );
      return res.status(response.status).json({
        error: "Failed to fetch image",
        details: response.statusText,
      });
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.buffer();

    res.set("Content-Type", contentType);
    res.send(buffer);
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).json({
      error: "Failed to fetch image",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// A simple root route
app.get("/", (req, res) => {
  res.send("RankMate Proxy Server is running. Use /health or /fetch-rrb.");
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
