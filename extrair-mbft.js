// extrair-mbft.js
import fs from 'fs/promises';
import pdf from 'pdf-parse';

const caminhoPDF = './MBVT20222.pdf';
const caminhoJSON = './mbft.json';

function extrairInfrações(texto) {
  const linhas = texto.split('\n');
  const regex = /(\d{3}-\d{2})\s*-\s*(.*?)\s*Gravidade:\s*(.*?)\s*Valor:\s*R\$\s*([\d,]+)\s*Pontos:\s*(\d+)/gi;

  const resultado = [];
  let textoUnificado = linhas.join(' ').replace(/\s+/g, ' ');

  let match;
  while ((match = regex.exec(textoUnificado)) !== null) {
    resultado.push({
      codigo: match[1],
      descricao: match[2].trim(),
      gravidade: match[3].trim(),
      valor: `R$ ${match[4]}`,
      pontuacao: parseInt(match[5])
    });
  }

  return resultado;
}

(async () => {
  try {
    const buffer = await fs.readFile(caminhoPDF);
    const data = await pdf(buffer);

    const infracoes = extrairInfrações(data.text);

    await fs.writeFile(caminhoJSON, JSON.stringify(infracoes, null, 2), 'utf8');
    console.log(`✅ ${infracoes.length} infrações salvas no mbft.json.`);
  } catch (err) {
    console.error('Erro ao extrair MBFT:', err);
  }
})();
