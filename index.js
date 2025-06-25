// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const promptBase = `Você é um assistente virtual de vendas da MG Multas. [...] (mesma instrução)`;

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória.' });
  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: promptBase },
        { role: 'user', content: message }
      ],
      temperature: 0.3
    });
    res.json({ reply: chat.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar resposta da IA.' });
  }
});

app.get('/chat', (req, res) => {
  res.status(405).send('Use POST em /chat');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
