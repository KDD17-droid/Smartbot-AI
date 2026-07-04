# Smartbot-AI 🤖

Ask it anything. It only answers what you tell it to.

Smartbot-AI is a smart FAQ assistant built on Azure OpenAI. Give it a system prompt, define its scope, and it answers questions within that context only.

---

## What it does

- Chat interface powered by Azure OpenAI (GPT-4.1-nano)
- Customisable system prompt — define who the bot is and what it knows
- Real-time responses via Azure OpenAI API

---

## Stack

- Azure OpenAI (GPT-4.1-nano, Sweden Central)
- Node.js + Express
- Vanilla JS frontend

---

## Run it locally

```
git clone https://github.com/saishagoel27/FAQ-Bot
cd Smartbot-AI
npm install
```

Create a `.env` file:

```
AZURE_OPENAI_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

Then:

```
npm start
```

Open `http://localhost:3000`

---

## Get your Azure OpenAI key

1. Go to portal.azure.com
2. Create an Azure OpenAI resource
3. Go to Azure AI Foundry → Deploy gpt-4.1-nano
4. Copy endpoint and key into `.env`

---
