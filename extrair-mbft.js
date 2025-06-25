import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

const caminhoPDF = './MBVT20222.pdf';
const caminhoJSON = './mbft.json';

async function extrairInfraçõesDoPDF() {
  try {
    const buffer = await fs.readFile(caminhoPDF);
    const data = await pdfParse(buffer);
    const texto = data.text;

    const linhas = texto.split('\n');
    const infracoes = [];

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];

      // Regex que identifica linhas de infração com código no padrão "XXX-XX"
      const match = linha.match(/(\d{3}-\d{2})\s+-\s+(.*)/);
      if (match) {
        const codigo = match[1];
        const descricao = match[2].trim();

        // Procurar informações adicionais como gravidade, valor, pontuação
        const gravidade = linhas[i + 1]?.match(/Gravidade:\s+(.*)/)?.[1] || '';
        const valor = linhas[i + 2]?.match(/Valor:\s+(.*)/)?.[1] || '';
        const pontuacao = linhas[i + 3]?.match(/Pontuação:\s+(\d+)/)?.[1] || '';

        infracoes.push({
          codigo,
          descricao,
          gravidade,
          valor,
          pontuacao: parseInt(pontuacao || 0)
        });
      }
    }

    await fs.writeFile(caminhoJSON, JSON.stringify(infracoes, null, 2), 'utf-8');
    console.log(`✅ ${infracoes.length} infrações salvas no mbft.json`);
  } catch (err) {
    console.error('❌ Erro ao extrair infrações:', err.message);
  }
}

extrairInfraçõesDoPDF();
