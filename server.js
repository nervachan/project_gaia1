const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/src", express.static(path.join(__dirname, "src")));

// ✅ Add this route for testing
app.get("/ping", (req, res) => {
  res.send("Server is alive");
});

// Hugging Face API route
app.post("/api/generate", async (req, res) => {
  const { promptText, selectedModel, width, height } = req.body;

  try {
    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: promptText,
        parameters: { width, height }
      })
    });

    if (!hfResponse.ok) {
      const err = await hfResponse.json();
      return res.status(hfResponse.status).json({ error: err.error || "Failed from Hugging Face" });
    }

    const buffer = await hfResponse.buffer();
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
    res.json({ image: base64Image });

  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fallback for frontend routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
