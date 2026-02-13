import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Map of allowed template names to file paths (relative to project root)
const TEMPLATE_MAP: Record<string, string> = {
  'limpa1.png': 'src/assets/templates/limpa1.png',
  'limpa-1.png': 'src/assets/templates/limpa-1.png',
  'limpa1-2.png': 'src/assets/templates/limpa1-2.png',
  'limpa2.png': 'src/assets/templates/limpa2.png',
  'limpa2-2.png': 'src/assets/templates/limpa2-2.png',
  'limpa3.png': 'src/assets/templates/limpa3.png',
  'limpa3-2.png': 'src/assets/templates/limpa3-2.png',
  'rg-frente.png': 'src/assets/templates/rg-frente.png',
  'rg-verso.png': 'src/assets/templates/rg-verso.png',
  'rg-verso-template.png': 'src/assets/templates/rg-verso-template.png',
  'rg-pdf-bg.png': 'src/assets/templates/rg-pdf-bg.png',
  'matrizcha.png': 'src/assets/templates/matrizcha.png',
  'matrizcha2.png': 'src/assets/templates/matrizcha2.png',
  'qrcode-sample.png': 'src/assets/templates/qrcode-sample.png',
  'qrcode-sample-rg.png': 'src/assets/templates/qrcode-sample-rg.png',
  'cha-sample-foto.png': 'src/assets/templates/cha-sample-foto.png',
};

// Serve template images by name
router.get('/:name', (req, res) => {
  const name = req.params.name;
  const relativePath = TEMPLATE_MAP[name];

  if (!relativePath) {
    return res.status(404).json({ error: 'Template não encontrado' });
  }

  // Resolve path relative to project root (server runs from /server, project root is parent)
  const filePath = path.resolve(process.cwd(), '..', relativePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado', path: relativePath });
  }

  // Set cache headers (templates rarely change)
  res.set('Cache-Control', 'public, max-age=86400'); // 24h
  res.set('Access-Control-Allow-Origin', '*');

  const ext = path.extname(name).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };
  res.set('Content-Type', mimeMap[ext] || 'application/octet-stream');
  res.sendFile(filePath);
});

export default router;
