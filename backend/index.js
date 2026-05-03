require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: "You are Sattva, a peaceful mindfulness guide. Your responses should be poetic, calming, and rooted in Zen philosophy. Use metaphors related to nature (rivers, clouds, lotuses, mountains). Keep responses concise (2-3 sentences). Help users find peace and mindfulness.",
});

app.use(cors());
app.use(express.json());

// Mock Database (In-memory)
let journals = [];
const wisdom = [
  { id: 1, verseNumber: 1, verse: "Mind precedes all mental states. Mind is their chief; they are all mind-wrought.", interpretation: "Our thoughts shape our reality. Watch them carefully." },
  { id: 2, verseNumber: 5, verse: "Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased.", interpretation: "Only love and compassion can dissolve conflict." },
  { id: 3, verseNumber: 81, verse: "As a solid rock is not shaken by the wind, even so the wise are not ruffled by praise or blame.", interpretation: "Find stability within yourself that the world cannot touch." },
  { id: 4, verseNumber: 103, verse: "Greater in battle than the man who would conquer a thousand-thousand men, is he who would conquer just one — himself.", interpretation: "Self-mastery is the greatest victory one can achieve." },
  { id: 5, verseNumber: 160, verse: "One is one's own refuge, who else could be the refuge?", interpretation: "You possess the light you seek. Look inward." },
  { id: 6, verseNumber: 197, verse: "Happy indeed we live, friendly amidst the hostile. Amidst hostile men we dwell free from hatred.", interpretation: "Carry your own inner peace into every environment." },
  { id: 7, verseNumber: 204, verse: "Health is the greatest gift, contentment the greatest wealth, a trusted friend the best relative, Nibbana the greatest bliss.", interpretation: "True wealth is measured by the peace in your heart." },
  { id: 8, verseNumber: 277, verse: "All conditioned things are impermanent — when one sees this with wisdom, one turns away from suffering.", interpretation: "Understand that everything changes, and find peace in that flow." },
  { id: 9, verseNumber: 387, verse: "The sun shines by day, the moon shines by night. But the Buddha shines resplendent all day and all night by the power of his holiness.", interpretation: "Inner radiance is the only light that never fades." }
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: "Sattva Backend — Peace begins with a single line of code." });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

// Diagnostic endpoint - test if Gemini works at all
app.get('/api/test-ai', async (req, res) => {
  try {
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);
    console.log("API Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    console.log("API Key first 10:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : "N/A");
    
    const result = await model.generateContent("Say hello in one word.");
    const response = await result.response;
    const text = response.text();
    res.json({ success: true, text: text, model: "gemini-2.0-flash" });
  } catch (error) {
    console.error("Test AI Error:", error.message);
    console.error("Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ 
      success: false, 
      error: error.message,
      status: error.status,
      statusText: error.statusText
    });
  }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  
  console.log("Chat request received. Message:", message);
  console.log("History length:", history ? history.length : 0);
  if (history && history.length > 0) {
    console.log("First history role:", history[0].role);
  }
  
  try {
    // Filter history to ensure it starts with 'user' role
    let cleanHistory = (history || []).filter(h => h && h.parts && h.parts.length > 0);
    // Remove leading 'model' messages
    while (cleanHistory.length > 0 && cleanHistory[0].role === 'model') {
      cleanHistory.shift();
    }
    
    const chat = model.startChat({
      history: cleanHistory,
    });

    const result = await chat.sendMessageStream(message);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    res.end();
  } catch (error) {
    console.error("AI Error:", error.message);
    console.error("Error status:", error.status);
    console.error("Error statusText:", error.statusText);
    if (!res.headersSent) {
      res.status(500).json({ error: "The clouds are too thick to see the moon. (AI Error)", details: error.message });
    } else {
      res.end();
    }
  }
});

// Wisdom Endpoint
app.get('/api/wisdom', (req, res) => {
  const randomVerse = wisdom[Math.floor(Math.random() * wisdom.length)];
  res.json(randomVerse);
});

// Journal Endpoints
app.get('/api/journal', (req, res) => {
  res.json(journals);
});

app.post('/api/journal', (req, res) => {
  const { content, emotion } = req.body;
  const newEntry = {
    id: Date.now(),
    content,
    emotion,
    timestamp: new Date().toISOString()
  };
  journals.push(newEntry);
  res.status(201).json(newEntry);
});

app.listen(PORT, () => {
  console.log(`Server flowing on port ${PORT}`);
});
