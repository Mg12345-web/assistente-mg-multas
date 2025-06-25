import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let textoMBFT = '';

async function carregarMBFT() {
  try {
    const buffer = await fs.readFile('./MBVT20222.pdf');
    const data = await pdf(buffer);
    textoMBFT = data.text;
    console.log("✅ MBFT carregado com sucesso.");
  } catch (error) {
    console.error("Erro ao carregar MBFT:", error);
  }
}

async function buscarNoMBFT(termo) {
  if (!textoMBFT) return null;
  const regex = new RegExp(`\\b${termo}\\b[\\s\\S]{0,800}`, 'i');
  const match = textoMBFT.match(regex);
  if (match) return `📘 Achei essa referência no MBFT:\n\n${match[0].trim()}`;
  return null;
}

const promptBase = `Você é um assistente virtual de vendas da MG Multas.

Regras que você deve seguir SEMPRE:
- NÃO GARANTA que o recurso será aprovado.
- NÃO informe prazos.
- NÃO ensine como montar um recurso.
- NÃO forneça teses jurídicas.

Checklist inicial:
- CNH Provisória (PPD): não pode ter 2 médias, nenhuma grave ou gravíssima.
- CNH com EAR: pode até 39 pontos. Acima disso gera suspensão.
- CNH definitiva sem EAR: 1 gravíssima = 29pts, 2 gravíssimas = 19pts, 0 gravíssima = até 39pts.

Serviços e valores:
Leve: R$ 60
Média: R$ 90
Grave: R$ 100
Gravíssima x1: R$ 120
Gravíssima x2: R$ 200
Gravíssima x3: R$ 300
Gravíssima x5: R$ 400
Gravíssima x10: R$ 800
Gravíssima x20: R$ 1600
PAI/PAP: R$ 1500
Cassação: R$ 2000
FICI: R$ 70 (grátis se fizer defesa)
Diligência: R$ 250
Reciclagem: R$ 300
Proteção CNH: R$ 177,90 ou 147,90 (pacote)
RGP multas: R$ 1500
RGP embriaguez: R$ 1800
Judicial: R$ 2000

O valor máximo permitido por cliente é R$ 4.000. Se passar disso, inicie a proposta por 4 mil.
Pode aplicar até 15% de desconto se a vendedora disser que o cliente não paga.

Você pode rir junto se ela brincar, mas mantenha sempre o foco na venda.`;

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória.' });

  try {
    const respostaMBFT = await buscarNoMBFT(message);
    if (respostaMBFT) return res.json({ reply: respostaMBFT });

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
    console.error("Erro no /chat:", err);
    res.status(500).json({ error: 'Erro ao gerar resposta.' });
  }
});

app.get('/', (req, res) => {
  res.send('Assistente MG Multas online');
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await carregarMBFT();
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
