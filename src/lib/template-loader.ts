// Template loader - carrega templates do bundle (importados como módulos ES6)
// Não faz requisições HTTP - templates ficam embutidos no JS bundle
// e NÃO aparecem no Network tab do navegador

const templateCache = new Map<string, string>();

// Mapeamento de templates para imports dinâmicos do bundle
const templateImports: Record<string, () => Promise<{ default: string }>> = {
  'limpa1.png': () => import('../assets/templates/limpa1.png'),
  'limpa-1.png': () => import('../assets/templates/limpa-1.png'),
  'limpa1-2.png': () => import('../assets/templates/limpa1-2.png'),
  'limpa2.png': () => import('../assets/templates/limpa2.png'),
  'limpa2-2.png': () => import('../assets/templates/limpa2-2.png'),
  'limpa3.png': () => import('../assets/templates/limpa3.png'),
  'limpa3-2.png': () => import('../assets/templates/limpa3-2.png'),
  'matrizcha.png': () => import('../assets/templates/matrizcha.png'),
  'matrizcha2.png': () => import('../assets/templates/matrizcha2.png'),
  'rg-frente.png': () => import('../assets/templates/rg-frente.png'),
  'rg-verso.png': () => import('../assets/templates/rg-verso.png'),
  'rg-pdf-bg.png': () => import('../assets/templates/rg-pdf-bg.png'),
  'rg-verso-template.png': () => import('../assets/templates/rg-verso-template.png'),
  'base.png': () => import('../assets/templates/base.png'),
  'qrcode-sample.png': () => import('../assets/templates/qrcode-sample.png'),
  'qrcode-sample-rg.png': () => import('../assets/templates/qrcode-sample-rg.png'),
  'cha-sample-foto.png': () => import('../assets/templates/cha-sample-foto.png'),
};

export async function loadTemplate(name: string): Promise<string> {
  if (templateCache.has(name)) {
    return templateCache.get(name)!;
  }

  const importer = templateImports[name];
  if (!importer) {
    throw new Error(`Template ${name} não encontrado no bundle`);
  }

  const module = await importer();
  const url = module.default;

  // Convert to blob URL to avoid showing in Network as identifiable asset
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    templateCache.set(name, blobUrl);
    return blobUrl;
  } catch {
    // Fallback: use the bundled URL directly
    templateCache.set(name, url);
    return url;
  }
}

// Pre-load multiple templates at once
export async function preloadTemplates(names: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  await Promise.all(
    names.map(async (name) => {
      results[name] = await loadTemplate(name);
    })
  );
  return results;
}
