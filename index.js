// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

const promptBase = `Você é um assistente virtual de vendas da MG Multas.\n\nRegras que você deve seguir SEMPRE:\n- NÃO GARANTA que o recurso será aprovado.\n- NÃO informe prazos.\n- NÃO ensine como montar um recurso.\n- NÃO forneça teses jurídicas.\n\nChecklist inicial:\n- CNH Provisória (PPD): não pode ter 2 médias, nenhuma grave ou gravíssima.\n- CNH com EAR: pode até 39 pontos. Acima disso gera suspensão.\n- CNH definitiva sem EAR: 1 gravíssima = 29pts, 2 gravíssimas = 19pts, 0 gravíssima = até 39pts.\n\nServiços e valores:\nLeve: R$ 60\nMédia: R$ 90\nGrave: R$ 100\nGravíssima x1: R$ 120\nGravíssima x2: R$ 200\nGravíssima x3: R$ 300\nGravíssima x5: R$ 400\nGravíssima x10: R$ 800\nGravíssima x20: R$ 1600\nPAI/PAP: R$ 1500\nCassação: R$ 2000\nFICI: R$ 70 (grátis se fizer defesa)\nDiligência: R$ 250\nReciclagem: R$ 300\nProteção CNH: R$ 177,90 ou 147,90 (pacote)\nRGP multas: R$ 1500\nRGP embriaguez: R$ 1800\nJudicial: R$ 2000\n\nO valor máximo permitido por cliente é R$ 4.000. Se passar disso, inicie a proposta por 4 mil.\nPode aplicar até 15% de desconto se a vendedora disser que o cliente não paga.\n\nVocê pode rir junto se ela brincar, mas mantenha sempre o foco na venda.`;

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória.' });

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: promptBase },
        { role: 'user', content: message }
      ],
      temperature: 0.3
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar resposta da IA.' });
  }
});

app.get('/', (req, res) => {
  res.send('Assistente MG Multas online');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
