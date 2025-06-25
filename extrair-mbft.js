// script para extrair infrações do MBFT (versão inicial, ajustável)
import fs from 'fs';
import pdf from 'pdf-parse';

async function extrairInfracoes(caminhoPDF) {
  const buffer = fs.readFileSync(caminhoPDF);
  const data = await pdf(buffer);
  const texto = data.text;

  // Regex genérico baseado no padrão visual dos exemplos
  const padrao = /Código do Enquadramento:\s*(\d{3}-\d{2})[\s\S]*?Tipificação Resumida:\s*(.*?)\s*Amparo Legal:[\s\S]*?Gravidade:\s*(.*?)\s*Penalidade:[\s\S]*?Valor:\s*R\$\s*([\d,.]+)/g;

  const infracoes = [];
  let match;

  while ((match = padrao.exec(texto)) !== null) {
    infracoes.push({
      codigo: match[1],
      descricao: match[2],
      gravidade: match[3],
      valor: `R$ ${match[4]}`
    });
  }

  fs.writeFileSync('mbft.json', JSON.stringify(infracoes, null, 2), 'utf-8');
  console.log(`✅ ${infracoes.length} infrações extraídas para mbft.json.`);
}

extrairInfracoes('MBVT20222.pdf');
