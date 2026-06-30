import type { SiteData } from '@siteforge/shared';

export async function publishSite(data: SiteData, templateId: string) {
  const response = await fetch('/api/publish/site', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, templateId })
  });

  if (!response.ok) {
    throw new Error('发布失败，请确认后端服务正在运行。');
  }

  return response.json() as Promise<{ ok: true; siteId: string; url: string }>;
}
