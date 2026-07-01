import cors from 'cors';
import express from 'express';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultSiteData, type AIChatRequest, type SiteData } from '@siteforge/shared';
import { renderStaticHtml } from './renderStaticHtml.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');
const publicDir = path.resolve(__dirname, '..', 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const sitesDir = path.join(publicDir, 'sites');

app.use(cors());
app.use('/uploads', express.static(uploadsDir));
app.use('/sites', express.static(sitesDir));
app.post('/api/upload', express.raw({ type: ['image/*', 'video/*'], limit: '80mb' }), async (request, response) => {
  try {
    if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
      response.status(400).json({ error: 'Expected a non-empty media upload body' });
      return;
    }

    const contentType = request.get('content-type') || '';
    const extension = extensionForContentType(contentType);
    if (!extension) {
      response.status(415).json({ error: 'Only common image and video files are supported' });
      return;
    }

    await mkdir(uploadsDir, { recursive: true });
    const originalName = sanitizeFileName(request.get('x-filename') || `upload${extension}`);
    const baseName = originalName.replace(/\.[a-z0-9]+$/i, '') || 'media';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, request.body);

    const url = `${request.protocol}://${request.get('host')}/uploads/${fileName}`;
    response.status(201).json({ url, fileName, size: request.body.length, contentType });
  } catch {
    response.status(500).json({ error: 'Upload failed while saving the file' });
  }
});
app.use(express.json({ limit: '4mb' }));

function sitePath(userId: string) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(dataDir, `${safeUserId}.json`);
}

function extensionForContentType(contentType: string) {
  const normalized = contentType.split(';')[0]?.trim().toLowerCase();
  const extensions: Record<string, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'video/quicktime': '.mov'
  };
  return extensions[normalized] || '';
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isSiteData(value: unknown): value is SiteData {
  const data = value as Partial<SiteData>;
  return Boolean(data && data.user && data.config && Array.isArray(data.projects) && Array.isArray(data.experiences) && Array.isArray(data.skills) && (data.awards === undefined || Array.isArray(data.awards)) && Array.isArray(data.socialLinks) && (data.videos === undefined || Array.isArray(data.videos)));
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'siteforge-server' });
});

app.get('/api/site/:userId', async (request, response) => {
  try {
    const raw = await readFile(sitePath(request.params.userId), 'utf8');
    response.json(JSON.parse(raw));
  } catch {
    response.json(defaultSiteData);
  }
});

app.put('/api/site/:userId', async (request, response) => {
  if (!isSiteData(request.body)) {
    response.status(400).json({ error: 'Invalid SiteData payload' });
    return;
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(sitePath(request.params.userId), JSON.stringify(request.body, null, 2), 'utf8');
  response.json({ ok: true });
});

app.post('/api/export/html', (request, response) => {
  response.status(410).json({ error: 'HTML file export is disabled. Use /api/publish/site for an online URL.' });
});

app.post('/api/publish/site', async (request, response) => {
  const body = request.body as { data?: unknown; templateId?: string };
  if (!isSiteData(body.data) || !body.templateId) {
    response.status(400).json({ error: 'Expected { data: SiteData, templateId: string }' });
    return;
  }

  try {
    const html = renderStaticHtml(body.data, body.templateId);
    const baseSlug = sanitizeFileName(`${body.data.user.username || body.data.user.displayName || 'site'}-${body.templateId}`).toLowerCase() || 'site';
    const siteId = `${baseSlug}-${Date.now().toString(36)}`;
    const siteDir = path.join(sitesDir, siteId);
    await mkdir(siteDir, { recursive: true });
    await writeFile(path.join(siteDir, 'index.html'), html, 'utf8');

    const url = `${request.protocol}://${request.get('host')}/sites/${siteId}/`;
    response.status(201).json({ ok: true, siteId, url });
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Publish failed' });
  }
});

app.post('/api/ai/chat', (request, response) => {
  const body = request.body as Partial<AIChatRequest>;
  if (!body.message || !body.currentData || !isSiteData(body.currentData)) {
    response.status(400).json({ error: 'Expected AIChatRequest' });
    return;
  }

  response.json({
    reply: 'AI 接口已预留。首版先使用手动配置面板，后续可在这里接入 OpenAI 并返回结构化 actions。',
    actions: []
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`SiteForge API listening on http://localhost:${port}`);
  });
}

export { app };
