import fs from 'fs/promises';

let baseMBFT = [];

export async function carregarJSONMBFT(caminho = './mbft.json') {
  try {
    const data = await fs.readFile(caminho, 'utf-8');
    baseMBFT = JSON.parse(data);

    if (!Array.isArray(baseMBFT)) {
      throw new Error('Formato inválido: o conteúdo do JSON não é um array.');
    }

    console.log(`✅ MBFT carregado com ${baseMBFT.length} infrações.`);
  } catch (error) {
    console.error('❌ Erro ao carregar mbft.json:', error.message);
    baseMBFT = [];
  }
}

export function buscarInfraMBFT(termo) {
  if (!termo || baseMBFT.length === 0) return null;

  const termoNormalizado = termo.toLowerCase();
  return baseMBFT.find((item) =>
    item.codigo.toLowerCase().includes(termoNormalizado) ||
    item.descricao.toLowerCase().includes(termoNormalizado)
  );
}
