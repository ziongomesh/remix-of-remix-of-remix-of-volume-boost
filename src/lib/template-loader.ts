// Template loader - busca templates do backend como base64 data URLs
// Cacheia na memória para não fazer múltiplas requisições

const templateCache = new Map<string, string>();

function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) {
    const base = envUrl.replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4000/api';
}

export async function loadTemplate(name: string): Promise<string> {
  if (templateCache.has(name)) {
    return templateCache.get(name)!;
  }

  const API_URL = getApiUrl();
  const response = await fetch(`${API_URL}/templates/${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error(`Template ${name} não encontrado`);
  
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  templateCache.set(name, dataUrl);
  return dataUrl;
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
