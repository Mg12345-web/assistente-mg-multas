import fs from 'fs/promises';

let baseMBFT = [];

export async function carregarJSONMBFT(caminho = './mbft.json') {
  try {
    const data = await fs.readFile(caminho, 'utf-8');
    baseMBFT = JSON.parse(data);
    console.log(`✅ MBFT carregado com ${baseMBFT.length} infrações.`);
  } catch (error) {
    console.error('Erro ao carregar mbft.json:', error);
  }
}

export function buscarInfraMBFT(termo) {
  const termoNormalizado = termo.toLowerCase();
  return baseMBFT.find((item) => {
    return (
      item.codigo.toLowerCase().includes(termoNormalizado) ||
      item.descricao.toLowerCase().includes(termoNormalizado)
    );
  });
}
