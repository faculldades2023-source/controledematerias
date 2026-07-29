import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const dados = req.body;

    await put('dados-estoque.json', JSON.stringify(dados), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Erro ao salvar no Blob:', e);
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
}
