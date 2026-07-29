import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { blobs } = await list({ prefix: 'dados-estoque.json' });

    if (blobs.length === 0) {
      return res.status(200).json(null);
    }

    const resposta = await fetch(blobs[0].url, { cache: 'no-store' });
    const dados = await resposta.json();

    res.status(200).json(dados);
  } catch (e) {
    console.error('Erro ao carregar do Blob:', e);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
}
