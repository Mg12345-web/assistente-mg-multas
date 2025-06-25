// extractor.js
import fs from 'fs/promises';
import pdf from 'pdf-parse';

async function extrairInfrações() {
  const buffer = await fs.readFile('./MBVT20222.pdf');
  const data = await pdf(buffer);

  const linhas = data.text.split('\n');

  const resultados = [];
  const regex = /^(\d{3}-\d{2})\s+(.+?)\s+(Leve|Média|Grave|Gravíssima)$/;

  for (const linha of linhas) {
    const match = linha.match(regex);
    if (match) {
      resultados.push({
        codigo: match[1],
        descricao: match[2].trim(),
        gravidade: match[3]
      });
    }
  }

  await fs.writeFile('./mbft.json', JSON.stringify(resultados, null, 2), 'utf-8');
  console.log(`✅ Extração completa: ${resultados.length} infrações salvas em mbft.json`);
}

extrairInfrações().catch(console.error);
