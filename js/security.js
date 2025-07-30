// backend/server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors()); // Allow frontend access
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  const { promptText, selectedModel, width, height } = req.body;

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${selectedModel}`,
      { inputs: promptText, parameters: { width, height } },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        responseType: "arraybuffer", // get image as binary
      }
    );

    // Send image back as base64
    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    res.json({ image: `data:image/png;base64,${base64Image}` });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
