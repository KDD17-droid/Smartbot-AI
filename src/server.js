const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const { AzureOpenAI } = require("openai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  process.env.ALLOWED_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// Azure OpenAI client
const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_KEY,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
});

// Smartbot-AI endpoint
app.post("/api/chat", async (req, res) => {
  const { message, systemPrompt } = req.body;

  try {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful FAQ assistant.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 500,
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Smartbot-AI running at http://localhost:${PORT}`);
});
