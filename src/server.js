const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const { AzureOpenAI } = require("openai");

dotenv.config();

const requiredEnvVars = [
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_KEY",
  "AZURE_OPENAI_API_VERSION",
  "AZURE_OPENAI_DEPLOYMENT_NAME",
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  process.exit(1);
}

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
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
});

function getTextFromMessageContent(content) {
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((item) => (item?.type === "text" ? item.text : ""))
      .join(" ")
      .trim();
  }

  return "";
}

async function createChatCompletion(messages, maxCompletionTokens) {
  return client.chat.completions.create({
    messages,
    max_completion_tokens: maxCompletionTokens,
  });
}

// Smartbot-AI endpoint
app.post("/api/chat", async (req, res) => {
  const { message, systemPrompt } = req.body;

  if (!message || !String(message).trim()) {
    return res.status(400).json({
      error: "Please enter a question.",
    });
  }

  const messages = [
    {
      role: "system",
      content: systemPrompt || "You are a helpful FAQ assistant.",
    },
    { role: "user", content: message },
  ];

  try {
    let response = await createChatCompletion(messages, 1500);
    let reply = getTextFromMessageContent(
      response?.choices?.[0]?.message?.content,
    );
    const finishReason = response?.choices?.[0]?.finish_reason;

    if (!reply || finishReason === "length") {
      response = await createChatCompletion(messages, 2500);
      reply = getTextFromMessageContent(
        response?.choices?.[0]?.message?.content,
      );
    }

    if (!reply) {
      return res.status(502).json({
        error: "The model returned an empty response. Please try again.",
      });
    }

    res.json({
      reply,
    });
  } catch (error) {
    console.error("Azure OpenAI chat error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Smartbot-AI running at http://localhost:${PORT}`);
});
