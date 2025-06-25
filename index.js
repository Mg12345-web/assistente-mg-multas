import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { carregarJSONMBFT, buscarInfraMBFT } from './mbft-helper.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let mbftDados = [];

async function carregarMBFT() {
  try {
    const jsonPath = path.resolve('./mbft.json');
    const file = await fs.readFile(jsonPath, 'utf-8');
    mbftDados = JSON.parse(file);
    console.log(`✅ MBFT carregado com ${mbftDados.length} infrações.`);
  } catch (error) {
    console.error("❌ Erro ao carregar mbft.json:", error);
  }
}

function buscarNoMBFT(termo) {
  if (!termo || mbftDados.length === 0) return null;

  const termoLower = termo.toLowerCase();

  const resultado = mbftDados.find(item =>
    item.codigo === termo ||
    item.descricao.toLowerCase().includes(termoLower)
  );

  if (resultado) {
    return `📘 Infração encontrada no MBFT:
- Código: ${resultado.codigo}
- Descrição: ${resultado.descricao}
- Gravidade: ${resultado.gravidade}
- Pontuação: ${resultado.pontuacao}
- Valor: ${resultado.valor}`;
  }

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
    const infra = buscarInfraMBFT(message);
    if (infra) {
      return res.json({
        reply: `📘 Achei essa infração no MBFT:\n\n🆔 Código: ${infra.codigo}\n📝 Descrição: ${infra.descricao}\n⚠️ Gravidade: ${infra.gravidade}\n💸 Valor: ${infra.valor}\n📊 Pontuação: ${infra.pontuacao}`
      });
    }

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
  await carregarJSONMBFT();
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
