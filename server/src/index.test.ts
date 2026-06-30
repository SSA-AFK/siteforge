import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { defaultSiteData } from '@siteforge/shared';
import { app } from './index.js';

describe('SiteForge API', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body.ok).toBe(true);
  });

  it('rejects invalid site payloads', async () => {
    const response = await request(app).put('/api/site/test-invalid').send({ bad: true }).expect(400);
    expect(response.body.error).toContain('Invalid');
  });

  it('disables static HTML file export', async () => {
    const response = await request(app)
      .post('/api/export/html')
      .send({ data: defaultSiteData, templateId: 'snowly' })
      .expect(410);

    expect(response.body.error).toContain('disabled');
  });

  it('publishes a site and returns an online URL', async () => {
    const publishResponse = await request(app)
      .post('/api/publish/site')
      .send({ data: defaultSiteData, templateId: 'snowly' })
      .expect(201);

    expect(publishResponse.body.url).toContain('/sites/');
    expect(publishResponse.body.siteId).toContain('snowly');

    const url = new URL(publishResponse.body.url);
    const pageResponse = await request(app).get(url.pathname).expect(200);
    expect(pageResponse.text).toContain('<!doctype html>');
    expect(pageResponse.text).toContain(defaultSiteData.user.displayName);
  });

  it('uploads image binaries and returns a public URL', async () => {
    const response = await request(app)
      .post('/api/upload')
      .set('Content-Type', 'image/png')
      .set('X-Filename', 'sample.png')
      .send(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
      .expect(201);

    expect(response.body.url).toContain('/uploads/');
    expect(response.body.fileName).toMatch(/sample\.png$/);
    expect(response.body.contentType).toBe('image/png');
  });

  it('uploads video binaries and returns a public URL', async () => {
    const response = await request(app)
      .post('/api/upload')
      .set('Content-Type', 'video/mp4')
      .set('X-Filename', 'demo.mp4')
      .send(Buffer.from([0x00, 0x00, 0x00, 0x18]))
      .expect(201);

    expect(response.body.url).toContain('/uploads/');
    expect(response.body.fileName).toMatch(/demo\.mp4$/);
    expect(response.body.contentType).toBe('video/mp4');
  });

  it('returns mock AI response', async () => {
    const response = await request(app)
      .post('/api/ai/chat')
      .send({ message: '完善简介', currentData: defaultSiteData })
      .expect(200);

    expect(response.body.actions).toEqual([]);
  });
});
