import type { Award, Project, SiteData, SocialLink, VideoItem } from '@siteforge/shared';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sortByOrder<T extends { displayOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function socialLabel(link: SocialLink) {
  return escapeHtml(link.platform || link.icon || 'Link');
}

function escapeHtmlWithBreaks(value: unknown) {
  return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

function experiencePeriod(startDate: string, endDate?: string, isCurrent?: boolean) {
  return `${startDate || '开始时间'} - ${isCurrent ? 'Now' : endDate || '结束时间'}`;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url);
}

function elenaHighlightedHeroTitle(text: string) {
  const keyword = '创意和技术';
  if (!text.includes(keyword)) {
    return escapeHtml(text);
  }

  const [before, after] = text.split(keyword);
  return `${escapeHtml(before)}<span>${escapeHtml(keyword)}</span>${escapeHtml(after)}`;
}

function projectCard(project: Project, primaryColor: string, index = 0) {
  const animation = index % 2 === 0 ? 'fade-right' : 'fade-left';
  const delay = (index % 3) * 100;
  const gallery = [...(project.images ?? [])]
    .filter((image) => image.imageUrl)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 4)
    .map((image) => `<figure><button class="image-preview-trigger" type="button" data-preview-src="${escapeHtml(image.imageUrl)}" data-preview-alt="${escapeHtml(image.caption || project.title)}" aria-label="预览 ${escapeHtml(image.caption || project.title)}"><img src="${escapeHtml(image.imageUrl)}" alt="${escapeHtml(image.caption || project.title)}" /></button>${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ''}</figure>`)
    .join('');

  return `
    <article class="card project-card" data-aos="${animation}" style="transition-delay:${delay}ms">
      ${project.coverImage ? `<button class="image-preview-trigger" type="button" data-preview-src="${escapeHtml(project.coverImage)}" data-preview-alt="${escapeHtml(project.title)}" aria-label="Preview ${escapeHtml(project.title)}"><img src="${escapeHtml(project.coverImage)}" alt="${escapeHtml(project.title)}" /></button>` : '<div class="media-placeholder">Select a cover image</div>'}
      <div class="project-body">
        <span class="pill">${escapeHtml(project.category)}</span>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        ${project.role || project.tools || project.startDate ? `<div class="tags">${project.role ? `<span>${escapeHtml(project.role)}</span>` : ''}${project.tools ? `<span>${escapeHtml(project.tools)}</span>` : ''}${project.startDate ? `<span>${escapeHtml(project.startDate)}${project.endDate ? ` - ${escapeHtml(project.endDate)}` : ''}</span>` : ''}</div>` : ''}
        ${project.content ? `<p>${escapeHtml(project.content)}</p>` : ''}
        ${gallery ? `<div class="gallery">${gallery}</div>` : ''}
        <div class="project-actions">
          ${project.projectUrl ? `<a class="link" href="${escapeHtml(project.projectUrl)}" style="color:${primaryColor}">View project</a>` : ''}
          ${project.githubUrl ? `<a class="source" href="${escapeHtml(project.githubUrl)}">Source</a>` : ''}
        </div>
      </div>
    </article>`;
}

function videoCard(video: VideoItem, index = 0) {
  const animation = index % 2 === 0 ? 'fade-right' : 'fade-left';
  if (isDirectVideoUrl(video.videoUrl)) {
    return `
    <article class="card video-card ${video.isFeatured ? 'featured' : ''}" data-aos="${animation}" style="transition-delay:${(index % 3) * 100}ms">
      <video src="${escapeHtml(video.videoUrl)}" ${video.thumbnailUrl ? `poster="${escapeHtml(video.thumbnailUrl)}"` : ''} controls></video>
      <div class="video-body">
        <span>${escapeHtml(video.platform)}</span>
        <h3>${escapeHtml(video.title)}</h3>
        ${video.description ? `<p>${escapeHtml(video.description)}</p>` : ''}
      </div>
    </article>`;
  }

  return `
    <article class="card video-card ${video.isFeatured ? 'featured' : ''}" data-aos="${animation}" style="transition-delay:${(index % 3) * 100}ms">
      <a href="${escapeHtml(video.videoUrl)}">
        <div class="video-thumb">
          ${video.thumbnailUrl ? `<img src="${escapeHtml(video.thumbnailUrl)}" alt="${escapeHtml(video.title)}" />` : ''}
          <span>${escapeHtml(video.platform)}</span>
          <div><h3>${escapeHtml(video.title)}</h3>${video.description ? `<p>${escapeHtml(video.description)}</p>` : ''}</div>
        </div>
      </a>
    </article>`;
}

function awardCard(award: Award, primaryColor: string, index = 0) {
  return `
    <article class="card award-card" data-aos="fade-up" style="transition-delay:${(index % 3) * 100}ms">
      <div class="award-top">
        <span class="award-icon">★</span>
        ${award.date ? `<span class="pill">${escapeHtml(award.date)}</span>` : ''}
      </div>
      <p class="award-issuer" style="color:${primaryColor}">${escapeHtml(award.issuer)}</p>
      <h3>${escapeHtml(award.title)}</h3>
      ${award.description ? `<p>${escapeHtml(award.description)}</p>` : ''}
    </article>`;
}

export function renderStaticHtml(data: SiteData, templateId: string) {
  if (templateId === 'elena') {
    return renderElenaHtml(data);
  }

  if (templateId !== 'snowly') {
    throw new Error(`Unsupported template: ${templateId}`);
  }

  const primaryColor = data.config.primaryColor || '#3b0764';
  const projects = sortByOrder(data.projects);
  const skills = sortByOrder(data.skills);
  const awards = sortByOrder(data.awards ?? []);
  const experiences = sortByOrder(data.experiences);
  const socials = sortByOrder(data.socialLinks);
  const videos = sortByOrder(data.videos ?? []);
  const heroImages = (data.config.heroImages ?? []).filter(Boolean);
  const heroImage = heroImages[0] || 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&w=1920&q=80';
  const projectGridClass = data.config.layout === 'list' ? 'project-grid project-grid-list' : 'project-grid';
  const title = data.config.seoTitle || `${data.user.displayName} - Personal Website`;
  const description = data.config.seoDescription || data.user.bio || 'Built with SiteForge';
  const navMark = data.user.avatarUrl
    ? `<img src="${escapeHtml(data.user.avatarUrl)}" alt="${escapeHtml(data.user.displayName || 'Avatar')}" />`
    : escapeHtml(data.user.displayName.slice(0, 1) || 'S');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root { --primary: ${primaryColor}; --dark: #16022b; --bg: #fafbfe; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: var(--bg); color: #1e293b; scroll-behavior: smooth; }
    a { color: inherit; text-decoration: none; }
    @keyframes sfFadeUp { from { opacity: 0; transform: translate3d(0, 28px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
    @keyframes sfFadeRight { from { opacity: 0; transform: translate3d(-34px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
    @keyframes sfFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes sfSoftPulse { 0%, 100% { box-shadow: 0 18px 45px rgba(15,23,42,.12); } 50% { box-shadow: 0 26px 70px rgba(59,7,100,.18); } }
    .sf-reveal { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity .76s cubic-bezier(.16,1,.3,1), transform .76s cubic-bezier(.16,1,.3,1); }
    .sf-reveal.sf-visible { opacity: 1; transform: translate3d(0, 0, 0); }
    [data-aos] { opacity: 0; transition-property: opacity, transform; transition-duration: 900ms; transition-timing-function: cubic-bezier(.16,1,.3,1); }
    [data-aos="fade-up"] { transform: translate3d(0, 40px, 0); }
    [data-aos="fade-right"] { transform: translate3d(-40px, 0, 0); }
    [data-aos="fade-left"] { transform: translate3d(40px, 0, 0); }
    [data-aos].aos-animate { opacity: 1; transform: translate3d(0, 0, 0); }
    .sf-float-subtle { animation: sfFloat 6s ease-in-out infinite; }
    .nav { position: sticky; top: 0; z-index: 10; background: rgba(255,255,255,.78); -webkit-backdrop-filter: blur(22px); backdrop-filter: blur(22px); border-bottom: 1px solid rgba(255,255,255,.48); box-shadow: 0 8px 28px rgba(15,23,42,.06); }
    .nav-inner, .container { max-width: 1180px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
    .nav-inner { min-height: 72px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 800; color: #0f172a; }
    .mark { width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; overflow: hidden; background: var(--primary); color: white; }
    .mark img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .nav-links { display: flex; gap: 28px; font-size: 14px; font-weight: 700; color: #64748b; }
    .nav-links a { position: relative; padding: 4px 0; transition: color .25s ease; }
    .nav-links a::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; border-radius: 999px; background: var(--primary); transform: scaleX(0); transform-origin: left; transition: transform .28s ease; }
    .nav-links a.active { color: #0f172a; }
    .nav-links a.active::after { transform: scaleX(1); }
    .hero { min-height: 720px; position: relative; display: flex; align-items: center; overflow: hidden; background: #020617; }
    .hero-slide { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .8s ease; }
    .hero-slide.active { opacity: .95; }
    .hero::after { content: ""; position: absolute; inset: 0; z-index: 0; background: linear-gradient(90deg, rgba(2,6,23,.65), rgba(2,6,23,.2), transparent); pointer-events: none; }
    .hero::before { content: ""; position: absolute; inset: auto 0 0; z-index: 1; height: 160px; background: linear-gradient(0deg, rgba(2,6,23,.4), transparent); pointer-events: none; }
    .hero .container { width: 100%; max-width: none; margin: 0; padding-left: clamp(24px, 7vw, 160px); padding-right: 24px; }
    .hero-card { position: relative; z-index: 2; max-width: 640px; margin: 80px auto 80px 0; padding: 56px; color: white; background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 60%, transparent), color-mix(in srgb, var(--primary) 52%, transparent) 54%, rgba(36,0,68,.56)); border: 1px solid rgba(255,255,255,.25); border-radius: 28px; box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 28px 80px rgba(0,0,0,.35); backdrop-filter: blur(24px); animation: sfFadeRight .85s cubic-bezier(.16,1,.3,1) both, sfSoftPulse 7s ease-in-out 1s infinite; }
    .hero-card h1 { margin: 16px 0; font-size: clamp(40px, 8vw, 68px); line-height: .98; letter-spacing: -.03em; }
    .hero-card p { color: rgba(255,255,255,.82); line-height: 1.75; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 32px; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-width: 170px; padding: 16px 28px; border-radius: 14px; background: white; color: var(--primary); font-weight: 800; box-shadow: 0 14px 30px rgba(15,23,42,.16); transition: transform .2s ease, background .2s ease; }
    .button:hover { transform: translateY(-2px) scale(1.03); background: #f8fafc; }
    .button.secondary { border: 1px solid rgba(255,255,255,.22); background: rgba(0,0,0,.2); color: white; box-shadow: none; }
    .button.secondary:hover { background: rgba(0,0,0,.3); }
    .hero-dots { position: absolute; z-index: 2; left: clamp(24px, 7vw, 160px); bottom: 32px; display: flex; align-items: center; gap: 8px; }
    .hero-dot { width: 8px; height: 8px; border: 0; border-radius: 999px; background: rgba(255,255,255,.45); cursor: pointer; transition: width .25s ease, background .25s ease, transform .25s ease; }
    .hero-dot.active { width: 48px; background: white; box-shadow: 0 10px 24px rgba(0,0,0,.18); }
    .hero-dot:hover { background: rgba(255,255,255,.75); transform: translateY(-1px); }
    .hero-arrows { position: absolute; z-index: 2; right: 32px; bottom: 32px; display: flex; gap: 12px; }
    .hero-arrow { width: 48px; height: 48px; border: 0; border-radius: 14px; display: grid; place-items: center; background: rgba(255,255,255,.15); color: white; font-size: 28px; line-height: 1; box-shadow: 0 14px 34px rgba(0,0,0,.22); backdrop-filter: blur(12px); cursor: pointer; transition: transform .2s ease, background .2s ease; }
    .hero-arrow:hover { transform: scale(1.05); background: rgba(255,255,255,.25); }
    section { padding: 92px 0; }
    .eyebrow { display: inline-flex; margin-bottom: 18px; padding: 7px 12px; border-radius: 999px; background: #f1f5f9; color: var(--primary); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    h2 { margin: 0 0 36px; max-width: 760px; color: #0f172a; font-size: clamp(34px, 6vw, 54px); line-height: 1.02; letter-spacing: -.03em; }
    .about-grid { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 52px; align-items: center; }
    .avatar { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 28px; box-shadow: 0 24px 60px rgba(15,23,42,.16); }
    .lead { color: #475569; font-size: 18px; line-height: 1.8; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 28px; }
    .stat, .card { background: white; border: 1px solid #e2e8f0; border-radius: 22px; box-shadow: 0 10px 30px rgba(15,23,42,.06); }
    .stat { padding: 24px; }
    .stat strong { display: block; color: var(--primary); font-size: 42px; }
    .work { background: white; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
    .project-grid-list { grid-template-columns: 1fr; }
    .project-card { overflow: hidden; }
    .project-card > .image-preview-trigger { width: 100%; height: 280px; }
    .media-placeholder { width: 100%; height: 280px; display: grid; place-items: center; background: #f1f5f9; color: #94a3b8; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; text-align: center; }
    .project-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .image-preview-trigger { display: block; border: 0; padding: 0; background: transparent; cursor: zoom-in; overflow: hidden; font: inherit; }
    .image-preview-trigger img { transition: transform .5s ease; }
    .image-preview-trigger:hover img { transform: scale(1.04); }
    .project-body { padding: 24px; }
    .project-body h3 { margin: 14px 0 8px; color: #0f172a; font-size: 24px; }
    .project-body p { color: #64748b; line-height: 1.65; }
    .pill, .tags span { display: inline-flex; border-radius: 999px; background: #f1f5f9; padding: 6px 10px; font-size: 12px; font-weight: 800; color: #64748b; }
    .tags { display: flex; gap: 8px; flex-wrap: wrap; margin: 18px 0; }
    .link { font-weight: 800; }
    .project-actions { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; }
    .source { color: #64748b; font-weight: 800; }
    .gallery { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 16px 0; }
    .gallery figure { margin: 0; overflow: hidden; border-radius: 14px; background: #f1f5f9; }
    .gallery .image-preview-trigger { width: 100%; height: 110px; }
    .gallery img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .gallery figcaption { padding: 8px 10px; color: #64748b; font-size: 11px; font-weight: 800; }
    .awards { background: #f8fafc; }
    .award-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
    .award-card { height: 100%; padding: 24px; transition: transform .2s ease, box-shadow .2s ease; }
    .award-card:hover { transform: translateY(-4px); box-shadow: 0 18px 42px rgba(15,23,42,.1); }
    .award-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
    .award-icon { width: 46px; height: 46px; border-radius: 18px; display: grid; place-items: center; background: var(--primary); color: white; font-weight: 900; box-shadow: 0 12px 28px rgba(15,23,42,.16); }
    .award-issuer { margin: 0 0 8px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .award-card h3 { margin: 0; color: #0f172a; font-size: 22px; line-height: 1.2; }
    .award-card p { color: #64748b; line-height: 1.65; }
    .video-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
    .video-card { overflow: hidden; }
    .video-card.featured { grid-column: span 2; }
    .video-card a { display: block; }
    .video-card video { width: 100%; height: 280px; display: block; object-fit: cover; background: #020617; }
    .video-body { padding: 22px; }
    .video-body span { color: var(--primary); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .video-body h3 { margin: 8px 0; color: #0f172a; font-size: 24px; }
    .video-body p { margin: 0; color: #64748b; line-height: 1.6; }
    .video-thumb { position: relative; height: 280px; overflow: hidden; background: #020617; }
    .video-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: .78; transition: transform .5s ease; }
    .video-card:hover img { transform: scale(1.05); }
    .video-thumb::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(2,6,23,.82), transparent); }
    .video-thumb span { position: absolute; z-index: 1; left: 18px; top: 18px; border-radius: 999px; background: rgba(255,255,255,.9); color: var(--primary); padding: 6px 10px; font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .video-thumb div { position: absolute; z-index: 1; left: 22px; right: 22px; bottom: 22px; color: white; }
    .video-thumb h3 { margin: 0 0 8px; font-size: 24px; }
    .video-thumb p { margin: 0; color: rgba(255,255,255,.78); line-height: 1.55; }
    .skill-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .skill { padding: 22px; }
    .bar { height: 8px; border-radius: 999px; background: #e2e8f0; overflow: hidden; margin-top: 14px; }
    .bar span { display: block; height: 100%; background: var(--primary); }
    .timeline { display: grid; gap: 16px; }
    .experience { padding: 24px; transition: transform .2s ease, box-shadow .2s ease; }
    .experience:hover { transform: translateY(-2px); box-shadow: 0 18px 42px rgba(15,23,42,.08); }
    .experience-top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .experience-type { margin: 0 0 6px; color: var(--primary); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .experience h3 { margin: 0 0 6px; color: #0f172a; font-size: 22px; line-height: 1.2; }
    .experience-company { margin: 0; color: #64748b; font-size: 14px; font-weight: 800; }
    .experience-period { flex: 0 0 auto; border-radius: 999px; background: #f1f5f9; padding: 6px 12px; color: #64748b; font-size: 13px; font-weight: 800; }
    .experience-description { margin: 18px 0 0; color: #475569; font-size: 14px; line-height: 1.7; }
    #contact { padding: 0; background: #020617; }
    .contact { background: var(--primary); color: white; border-radius: 30px; padding: 52px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .contact h2 { color: white; margin-bottom: 18px; }
    .contact a, .contact .row { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.12); border-radius: 16px; padding: 16px; font-weight: 800; }
    .footer-cta { background: var(--primary); color: white; padding: 48px 24px; }
    .footer-cta-inner { max-width: 1180px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .footer-cta-copy { display: flex; align-items: center; gap: 16px; }
    .footer-cta-icon { width: 56px; height: 56px; border-radius: 18px; display: grid; place-items: center; flex: 0 0 auto; background: rgba(255,255,255,.1); color: #fcd34d; font-size: 26px; }
    .footer-cta h2 { margin: 0; color: white; font-size: clamp(22px, 4vw, 30px); line-height: 1.1; }
    .footer-cta p { margin: 6px 0 0; color: rgba(255,255,255,.75); font-size: 13px; }
    .footer-cta-button { display: flex; align-items: center; gap: 14px; border-radius: 18px; padding: 14px 24px; background: white; color: #0f172a; box-shadow: 0 18px 38px rgba(15,23,42,.18); transition: transform .25s ease, box-shadow .25s ease; }
    .footer-cta-button:hover { transform: scale(1.05); box-shadow: 0 22px 52px rgba(15,23,42,.24); }
    .footer-cta-button span { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; background: var(--primary); color: white; }
    .footer-cta-button small { display: block; color: #94a3b8; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .footer-cta-button strong { display: block; color: #0f172a; font-size: 14px; }
    .site-footer { padding: 64px 24px 32px; background: #020617; color: #cbd5e1; border-top: 1px solid rgba(88,28,135,.24); }
    .site-footer-grid { max-width: 1180px; margin: 0 auto 48px; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 48px; }
    .site-footer-col { grid-column: span 4; }
    .site-footer-brand { display: flex; align-items: center; gap: 10px; color: white; font-size: 26px; font-weight: 900; }
    .site-footer-mark { width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; overflow: hidden; background: var(--primary); color: white; }
    .site-footer-mark img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .site-footer p { color: #94a3b8; font-size: 12px; line-height: 1.7; }
    .site-footer h4 { margin: 0 0 16px; color: white; font-size: 14px; }
    .footer-links, .footer-contact { display: flex; flex-direction: column; gap: 10px; color: #cbd5e1; font-size: 12px; }
    .footer-links a, .footer-contact a { transition: color .25s ease; }
    .footer-links a:hover, .footer-contact a:hover { color: #c084fc; }
    .footer-contact span, .footer-contact a { display: flex; align-items: center; gap: 8px; }
    .footer-socials { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .footer-socials a { width: 36px; height: 36px; border-radius: 14px; display: grid; place-items: center; background: rgba(255,255,255,.05); color: #cbd5e1; transition: transform .25s ease, background .25s ease, color .25s ease; }
    .footer-socials a:hover { transform: scale(1.1); background: rgba(255,255,255,.1); color: white; }
    .site-footer-bottom { max-width: 1180px; margin: 0 auto; padding-top: 32px; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 11px; }
    .lightbox { position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(2,6,23,.86); backdrop-filter: blur(8px); }
    .lightbox.open { display: flex; }
    .lightbox-inner { position: relative; width: min(100%, 1040px); max-height: 88vh; }
    .lightbox img { width: 100%; max-height: 86vh; object-fit: contain; border-radius: 20px; box-shadow: 0 24px 80px rgba(0,0,0,.45); }
    .lightbox-close { position: absolute; right: 14px; top: 14px; border: 0; border-radius: 999px; padding: 8px 12px; background: rgba(255,255,255,.92); color: #0f172a; font-weight: 900; cursor: pointer; }
    footer { padding: 32px; background: #020617; color: #94a3b8; text-align: center; font-size: 12px; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
      .sf-reveal { opacity: 1; transform: none; }
      [data-aos] { opacity: 1; transform: none; }
    }
    @media (max-width: 800px) {
      .nav-links { display: none; }
      .hero-card { padding: 32px; }
      .about-grid, .project-grid, .skill-grid, .award-grid, .video-grid, .contact { grid-template-columns: 1fr; }
      .video-card.featured { grid-column: auto; }
      .footer-cta-inner, .footer-cta-copy { flex-direction: column; text-align: center; }
      .site-footer-grid { grid-template-columns: 1fr; }
      .site-footer-col { grid-column: auto; }
    }
  </style>
  ${data.config.customCss ? `<style>${data.config.customCss}</style>` : ''}
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <a class="brand" href="#top"><span class="mark">${navMark}</span>${escapeHtml(data.user.displayName || 'SiteForge')}</a>
      <div class="nav-links">
        <a href="#about" data-nav-id="about">About</a><a href="#work" data-nav-id="work">Work</a>${data.config.showAwards && awards.length ? '<a href="#awards" data-nav-id="awards">Awards</a>' : ''}${data.config.showSkills && skills.length ? '<a href="#skills" data-nav-id="skills">Skills</a>' : ''}<a href="#contact" data-nav-id="contact">Contact</a>
      </div>
    </div>
  </nav>
  <header id="top" class="hero">
    ${(heroImages.length ? heroImages : [heroImage]).map((image, index) => `<img class="hero-slide ${index === 0 ? 'active' : ''}" src="${escapeHtml(image)}" alt="" />`).join('')}
    <div class="container">
      <div class="hero-card" data-aos="fade-right">
        <span class="eyebrow">${escapeHtml(data.user.location || 'Personal Website')}</span>
        <h1>${escapeHtml(data.user.title || 'Build your personal digital presence')}</h1>
        <p>${escapeHtml(data.user.bio || 'Use SiteForge to turn your profile, work, and ideas into a polished personal website.')}</p>
        <div class="hero-actions">
          <a class="button" href="#work">Explore Work</a>
          <a class="button secondary" href="#contact">Contact Me</a>
        </div>
      </div>
    </div>
    ${heroImages.length > 1 ? `<div class="hero-dots">${heroImages.map((image, index) => `<button class="hero-dot ${index === 0 ? 'active' : ''}" type="button" aria-label="Hero image ${index + 1}" data-hero-index="${index}"></button>`).join('')}</div><div class="hero-arrows"><button class="hero-arrow" id="prevHero" type="button" aria-label="Previous hero image">‹</button><button class="hero-arrow" id="nextHero" type="button" aria-label="Next hero image">›</button></div>` : ''}
  </header>
  <section id="about" class="sf-reveal">
    <div class="container about-grid">
      <img class="avatar sf-float-subtle" data-aos="fade-right" src="${escapeHtml(data.user.avatarUrl || 'https://i.pravatar.cc/300?img=11')}" alt="${escapeHtml(data.user.displayName)}" />
      <div data-aos="fade-left">
        <span class="eyebrow">About</span>
        <h2>A focused space for your work, story, and capabilities.</h2>
        <p class="lead">${escapeHtml(data.user.fullBio || data.user.bio || '')}</p>
        <div class="stats">
          <div class="stat"><strong>${projects.length}+</strong><span>Projects</span></div>
          <div class="stat"><strong>${skills.length}+</strong><span>Skills</span></div>
        </div>
      </div>
    </div>
  </section>
  ${projects.length ? `<section id="work" class="work sf-reveal"><div class="container"><div data-aos="fade-up"><span class="eyebrow">Selected Work</span><h2>Recent projects with practical depth.</h2></div><div class="${projectGridClass}">${projects.map((project, index) => projectCard(project, primaryColor, index)).join('')}</div></div></section>` : ''}
  ${data.config.showAwards && awards.length ? `<section id="awards" class="awards sf-reveal"><div class="container"><div data-aos="fade-up"><span class="eyebrow">Awards</span><h2>荣誉奖项与专业认可。</h2></div><div class="award-grid">${awards.map((award, index) => awardCard(award, primaryColor, index)).join('')}</div></div></section>` : ''}
  ${data.config.showSkills && skills.length ? `<section id="skills" class="sf-reveal"><div class="container"><div data-aos="fade-up"><span class="eyebrow">Skills</span><h2>Tools and strengths.</h2></div><div class="skill-grid">${skills.map((skill, index) => `<div class="card skill" data-aos="fade-up" style="transition-delay:${(index % 3) * 100}ms"><strong>${escapeHtml(skill.name)}</strong><p>${escapeHtml(skill.category || '')}</p><div class="bar"><span style="width:${skill.proficiency * 20}%"></span></div></div>`).join('')}</div></div></section>` : ''}
  ${data.config.showVideos && videos.length ? `<section id="videos" class="work sf-reveal"><div class="container"><div data-aos="fade-up"><span class="eyebrow">Video</span><h2>Stories, demos, and walkthroughs.</h2></div><div class="video-grid">${videos.map((video, index) => videoCard(video, index)).join('')}</div></div></section>` : ''}
  ${data.config.showExperience && experiences.length ? `<section class="sf-reveal"><div class="container"><h2 data-aos="fade-up">Experience</h2><div class="timeline">${experiences.map((experience, index) => `<article class="card experience" data-aos="fade-up" style="transition-delay:${(index % 3) * 100}ms"><div class="experience-top"><div><p class="experience-type">${escapeHtml(experience.type === 'education' ? 'Education' : 'Work')}</p><h3>${escapeHtml(experience.position)}</h3><p class="experience-company">${escapeHtml(experience.company)}</p></div><span class="experience-period">${escapeHtml(experiencePeriod(experience.startDate, experience.endDate, experience.isCurrent))}</span></div>${experience.description ? `<p class="experience-description">${escapeHtmlWithBreaks(experience.description)}</p>` : ''}</article>`).join('')}</div></div></section>` : ''}
  <section id="contact" class="sf-reveal">
    <div class="footer-cta">
      <div class="footer-cta-inner" data-aos="fade-up">
        <div class="footer-cta-copy">
          <div class="footer-cta-icon">!</div>
          <div>
            <h2>准备好开启下一次合作？</h2>
            <p>作品交流、项目合作或职位机会，都可以从这里开始。</p>
          </div>
        </div>
        <a class="footer-cta-button" href="${data.user.email ? `mailto:${escapeHtml(data.user.email)}` : '#contact'}">
          <span>☎</span>
          <div><small>Contact Me</small><strong>${escapeHtml(data.user.email || 'Send a message')}</strong></div>
        </a>
      </div>
    </div>
    <footer class="site-footer">
      <div class="site-footer-grid" data-aos="fade-up">
        <div class="site-footer-col">
          <a class="site-footer-brand" href="#top"><span class="site-footer-mark">${navMark}</span>${escapeHtml(data.user.displayName || 'SiteForge')}</a>
          <p>${escapeHtml(data.user.bio || '用作品、经历和想法构建一个清晰、可信、可持续更新的个人网站。')}</p>
        </div>
        <div class="site-footer-col">
          <h4>Quick Links</h4>
          <div class="footer-links">
            <a href="#top">Home</a>
            <a href="#about">About</a>
            <a href="#work">Work</a>
            ${data.config.showAwards && awards.length ? '<a href="#awards">Awards</a>' : ''}
            ${data.config.showSkills && skills.length ? '<a href="#skills">Skills</a>' : ''}
          </div>
        </div>
        <div class="site-footer-col">
          <h4>Contact</h4>
          <div class="footer-contact">
            ${data.user.email ? `<a href="mailto:${escapeHtml(data.user.email)}">✉ ${escapeHtml(data.user.email)}</a>` : ''}
            ${data.user.location ? `<span>⌖ ${escapeHtml(data.user.location)}</span>` : ''}
            <div class="footer-socials">${socials.map((social) => `<a href="${escapeHtml(social.url)}" aria-label="${socialLabel(social)}">${socialLabel(social).slice(0, 1)}</a>`).join('')}</div>
          </div>
        </div>
      </div>
      <div class="site-footer-bottom">© 2026 ${escapeHtml(data.user.displayName || '个人作品集')}. All rights reserved.</div>
    </footer>
  </section>
  <section style="display:none"><div class="container"><div class="contact" data-aos="fade-up"><div><span class="eyebrow">联系我</span><h2>期待与你交流新的机会。</h2><p>如果你对我的作品感兴趣，或有项目合作、职位机会、创意想法想进一步沟通，欢迎通过以下方式联系我。</p></div><div>${data.user.email ? `<a href="mailto:${escapeHtml(data.user.email)}">${escapeHtml(data.user.email)}</a>` : ''}${data.user.location ? `<div class="row">${escapeHtml(data.user.location)}</div>` : ''}${socials.map((social) => `<a href="${escapeHtml(social.url)}">${socialLabel(social)}</a>`).join('')}</div></div></div></section>
  <footer style="display:none">© 2026 ${escapeHtml(data.user.displayName || '个人作品集')}. All rights reserved.</footer>
  <div class="lightbox" id="imageLightbox" role="dialog" aria-modal="true" aria-label="图片预览">
    <div class="lightbox-inner">
      <button class="lightbox-close" id="imageLightboxClose" type="button">关闭</button>
      <img id="imageLightboxImg" src="" alt="" />
    </div>
  </div>
  <script>
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
    const heroDots = Array.from(document.querySelectorAll('.hero-dot'));
    let heroIndex = 0;
    function showHeroSlide(index) {
      if (!heroSlides.length) return;
      heroSlides[heroIndex]?.classList.remove('active');
      heroDots[heroIndex]?.classList.remove('active');
      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides[heroIndex]?.classList.add('active');
      heroDots[heroIndex]?.classList.add('active');
    }
    heroDots.forEach((dot, index) => dot.addEventListener('click', () => showHeroSlide(index)));
    document.getElementById('prevHero')?.addEventListener('click', () => showHeroSlide(heroIndex - 1));
    document.getElementById('nextHero')?.addEventListener('click', () => showHeroSlide(heroIndex + 1));
    if (heroSlides.length > 1) {
      setInterval(() => showHeroSlide(heroIndex + 1), 5000);
    }
    const revealElements = Array.from(document.querySelectorAll('.sf-reveal, [data-aos]'));
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sf-visible');
            entry.target.classList.add('aos-animate');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealElements.forEach((element) => revealObserver.observe(element));
    } else {
      revealElements.forEach((element) => {
        element.classList.add('sf-visible');
        element.classList.add('aos-animate');
      });
    }
    const navLinks = Array.from(document.querySelectorAll('[data-nav-id]'));
    const navSections = navLinks.map((link) => document.getElementById(link.dataset.navId)).filter(Boolean);
    function setActiveNav(sectionId) {
      navLinks.forEach((link) => link.classList.toggle('active', link.dataset.navId === sectionId));
    }
    function updateActiveNav() {
      const navHeight = document.querySelector('.nav')?.getBoundingClientRect().height || 0;
      const activationLine = navHeight + window.innerHeight * 0.22;
      let currentSection = '';
      navSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= activationLine && rect.bottom > navHeight + 24) {
          currentSection = section.id;
        }
      });
      setActiveNav(currentSection);
    }
    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav);
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('imageLightboxImg');
    const lightboxClose = document.getElementById('imageLightboxClose');
    function closeLightbox() {
      lightbox.classList.remove('open');
      lightboxImg.removeAttribute('src');
      lightboxImg.alt = '';
    }
    document.querySelectorAll('.image-preview-trigger').forEach((button) => {
      button.addEventListener('click', () => {
        lightboxImg.src = button.dataset.previewSrc || '';
        lightboxImg.alt = button.dataset.previewAlt || '图片预览';
        lightbox.classList.add('open');
      });
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  </script>
</body>
</html>`;
}

function renderElenaHtml(data: SiteData) {
  const projects = sortByOrder(data.projects);
  const skills = sortByOrder(data.skills);
  const awards = sortByOrder(data.awards ?? []).filter((award) => award.title.trim());
  const experiences = sortByOrder(data.experiences);
  const socials = sortByOrder(data.socialLinks);
  const videos = sortByOrder(data.videos ?? []).filter((video) => video.videoUrl.trim());
  const title = data.config.seoTitle || `${data.user.displayName} - Interactive Portfolio`;
  const description = data.config.seoDescription || data.user.bio || 'Built with SiteForge';
  const projectGridClass = data.config.layout === 'list' ? 'project-grid list' : 'project-grid';
  const identityLabel = data.user.title || '设计师 / 开发者';
  const heroMainTitle = data.user.bio || '用创意和技术构建美好数字体验';

  const socialIcon = (link: SocialLink) => escapeHtml((link.platform || link.icon || 'Link').slice(0, 1).toUpperCase());
  const projectCards = projects.map((project, index) => {
    const span = data.config.layout === 'list' ? '' : index % 3 === 0 ? ' wide' : '';
    const gallery = [...(project.images ?? [])]
      .filter((image) => image.imageUrl.trim())
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 4)
      .map((image) => `<a class="project-gallery-item" href="${escapeHtml(image.imageUrl)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(image.imageUrl)}" alt="${escapeHtml(image.caption || project.title)}">${image.caption ? `<span>${escapeHtml(image.caption)}</span>` : ''}</a>`)
      .join('');
    return `
      <article class="tilt-card project-card${span} fade-up-element" style="transition-delay:${(index % 3) * 100}ms">
        <div class="card-top">
          <div>
            <h3>${escapeHtml(project.title || 'Untitled Project')}</h3>
            <p>${escapeHtml(project.category)}${project.role ? ` / ${escapeHtml(project.role)}` : ''}</p>
          </div>
          ${project.startDate || project.endDate ? `<span>${escapeHtml(project.endDate || project.startDate)}</span>` : ''}
        </div>
        <div class="project-media">
          ${project.coverImage ? `<img src="${escapeHtml(project.coverImage)}" alt="${escapeHtml(project.title)}" />` : '<div class="empty-media">Select Cover Image</div>'}
        </div>
        ${project.description ? `<p class="project-description">${escapeHtml(project.description)}</p>` : ''}
        ${gallery ? `<div class="project-gallery">${gallery}</div>` : ''}
      </article>`;
  }).join('');

  const videoCards = videos.map((video, index) => {
    const span = video.isFeatured ? ' wide' : '';
    const media = isDirectVideoUrl(video.videoUrl)
      ? `<video src="${escapeHtml(video.videoUrl)}" ${video.thumbnailUrl ? `poster="${escapeHtml(video.thumbnailUrl)}"` : ''} controls></video>`
      : `<a class="video-link" href="${escapeHtml(video.videoUrl)}" target="_blank" rel="noreferrer">${video.thumbnailUrl ? `<img src="${escapeHtml(video.thumbnailUrl)}" alt="${escapeHtml(video.title)}">` : '<div class="empty-media">Open Video</div>'}<div class="video-shade"></div><span class="video-badge">${escapeHtml(video.platform)}</span><strong>WATCH</strong></a>`;
    return `
      <article class="tilt-card video-card${span} fade-up-element" style="transition-delay:${(index % 3) * 100}ms">
        <div class="video-media">${media}</div>
        <div class="video-copy">
          <span>${escapeHtml(video.platform)}</span>
          <h3>${escapeHtml(video.title || 'Video Showcase')}</h3>
          ${video.description ? `<p>${escapeHtml(video.description)}</p>` : ''}
        </div>
      </article>`;
  }).join('');

  const experienceCards = experiences.slice(0, 4).map((experience, index) => `
    <article class="tilt-card process-card fade-up-element" style="transition-delay:${(index % 2) * 100}ms">
      <span>${escapeHtml(experience.type)} / ${escapeHtml(experience.startDate)}${experience.isCurrent ? ' - Now' : experience.endDate ? ` - ${escapeHtml(experience.endDate)}` : ''}</span>
      <h3>${escapeHtml(experience.position)}</h3>
      <strong>${escapeHtml(experience.company)}</strong>
      ${experience.description ? `<p>${escapeHtmlWithBreaks(experience.description)}</p>` : ''}
    </article>`).join('');

  const skillStrip = skills.slice(0, 5).map((skill) => `<div><span>◆</span>${escapeHtml(skill.name)}</div>`).join('');
  const skillCards = skills.map((skill, index) => `
    <article class="tilt-card skill-card fade-up-element" style="transition-delay:${index * 100}ms">
      <div class="fluid-panel"><span>${escapeHtml(skill.category || 'CRAFT')}</span></div>
      <div class="skill-card-copy">
        <div class="skill-card-title"><h3>${escapeHtml(skill.name || 'Untitled Skill')}</h3><span>${skill.proficiency}/5</span></div>
        ${skill.category ? `<p class="skill-category">${escapeHtml(skill.category)}</p>` : ''}
        <div class="skill-meter"><span style="width:${skill.proficiency * 20}%"></span></div>
      </div>
    </article>`).join('');
  const awardCards = awards.map((award, index) => `
    <article class="tilt-card elena-award-card fade-up-element" style="transition-delay:${(index % 3) * 100}ms">
      <div class="award-card-top">
        <span class="award-star">★</span>
        ${award.date ? `<span class="award-date">${escapeHtml(award.date)}</span>` : ''}
      </div>
      <div class="award-card-copy">
        ${award.issuer ? `<p>${escapeHtml(award.issuer)}</p>` : ''}
        <h3>${escapeHtml(award.title || 'Untitled Award')}</h3>
        ${award.description ? `<span>${escapeHtml(award.description)}</span>` : ''}
      </div>
    </article>`).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root { --bg: #04130f; --panel: #09221b; --accent: #00E699; --muted: #899E97; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; overflow-x: hidden; background: radial-gradient(circle at 28% 18%, rgba(0,230,153,.18), transparent 34%), linear-gradient(135deg, #04130f 0%, #061811 48%, #020807 100%); color: white; font-family: Inter, system-ui, sans-serif; }
    a { color: inherit; text-decoration: none; }
    .font-display, h1, h2, h3 { font-family: 'Plus Jakarta Sans', Inter, sans-serif; }
    .glow { position: absolute; border-radius: 999px; filter: blur(140px); background: radial-gradient(circle, rgba(0,230,153,.14), rgba(4,19,15,0) 70%); pointer-events: none; }
    .container { max-width: 1180px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
    header { position: relative; z-index: 5; display: flex; align-items: center; justify-content: space-between; padding: 24px; max-width: 1180px; margin: 0 auto; }
    .brand { color: var(--accent); font-family: 'Plus Jakarta Sans'; font-size: 20px; font-weight: 900; letter-spacing: -.03em; }
    nav { display: flex; gap: 40px; color: var(--muted); font-size: 11px; font-weight: 800; letter-spacing: .18em; }
    nav a:hover { color: var(--accent); }
    .talk { border-radius: 999px; background: white; color: black; padding: 10px 20px; font-size: 11px; font-weight: 800; letter-spacing: .16em; transition: background .25s ease; }
    .talk:hover { background: var(--accent); }
    .noise-layer, .grid-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
    .grid-layer { opacity: .06; background-image: linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px); background-size: 48px 48px; }
    .noise-layer { opacity: .045; background-image: radial-gradient(circle at center, white 1px, transparent 1px); background-size: 18px 18px; }
    .hero { position: relative; z-index: 1; min-height: 85vh; display: grid; grid-template-columns: 8fr 4fr; gap: 64px; align-items: center; padding-top: 48px; padding-bottom: 96px; }
    .hero-copy { min-height: 560px; display: flex; flex-direction: column; justify-content: center; }
    .identity-label { margin: 0 0 20px; color: var(--accent); font-family: 'Plus Jakarta Sans'; font-size: clamp(14px, 1.4vw, 18px); font-weight: 500; letter-spacing: .32em; text-transform: uppercase; }
    .hero h1 { max-width: 880px; margin: 0; font-size: clamp(50px, 7vw, 86px); line-height: 1.04; letter-spacing: -.04em; font-weight: 800; }
    .hero h1 span { color: var(--accent); }
    .hero p, .muted { color: var(--muted); line-height: 1.75; }
    .button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-width: 210px; margin-top: 28px; border-radius: 999px; background: var(--accent); color: black; padding: 16px 32px; font-size: 11px; font-weight: 900; letter-spacing: .2em; transition: box-shadow .25s ease, transform .25s ease; }
    .button:hover { transform: translateY(-2px); box-shadow: 0 18px 38px rgba(0,230,153,.24); }
    .tilt-card { position: relative; border: 1px solid rgba(255,255,255,.06); border-radius: 28px; background: rgba(9,34,27,.42); box-shadow: 0 26px 80px rgba(0,0,0,.24); backdrop-filter: blur(25px); transform-style: preserve-3d; transition: transform .5s cubic-bezier(.16,1,.3,1), border-color .4s; overflow: hidden; }
    .tilt-card::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: radial-gradient(120px circle at var(--mouse-x,0) var(--mouse-y,0), rgba(0,230,153,.22), transparent 72%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: 0; transition: opacity .35s; }
    .tilt-card:hover::after { opacity: .55; }
    .hero-tags { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 56px; color: var(--accent); font-size: 11px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
    .hero-tags div { border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: rgba(9,34,27,.45); padding: 9px 16px; backdrop-filter: blur(18px); }
    .hero-tags span { opacity: .45; margin-right: 8px; }
    .portrait { width: 92%; height: 540px; margin-left: auto; }
    .portrait img { width: 100%; height: 100%; object-fit: cover; filter: brightness(1.1) saturate(1.05); transition: transform .7s ease; }
    .portrait:hover img { transform: scale(1.05); }
    .portrait::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(4,19,15,.85), rgba(4,19,15,.28), transparent), linear-gradient(0deg, rgba(4,19,15,.85), transparent), rgba(0,230,153,.05); opacity: .8; mix-blend-mode: soft-light; }
    .portrait::after { z-index: 2; }
    .caption { position: absolute; z-index: 3; left: 24px; bottom: 24px; width: min(280px, calc(100% - 48px)); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,.1); background: rgba(9,34,27,.55); box-shadow: 0 24px 70px rgba(0,0,0,.25); backdrop-filter: blur(24px); }
    .caption strong { color: var(--accent); font-size: 11px; letter-spacing: .2em; }
    .strip { margin: 0 -24px 64px; border-top: 1px solid rgba(255,255,255,.06); border-bottom: 1px solid rgba(255,255,255,.06); background: rgba(9,34,27,.22); padding: 28px 0; }
    .strip .container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; color: var(--accent); font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; }
    .strip span { opacity: .45; margin-right: 8px; }
    section { position: relative; z-index: 1; padding: 80px 0; }
    .section-head { margin-bottom: 48px; }
    .eyebrow { color: var(--accent); font-size: 11px; font-weight: 900; letter-spacing: .22em; text-transform: uppercase; }
    h2 { margin: 18px 0 0; font-size: clamp(34px, 5vw, 56px); line-height: 1.08; letter-spacing: -.035em; }
    h2 span { color: var(--muted); font-weight: 300; }
    .project-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 32px; }
    .project-grid.list { grid-template-columns: 1fr; }
    .project-card { grid-column: span 4; min-height: 460px; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; }
    .project-card.wide { grid-column: span 8; }
    .project-grid.list .project-card { grid-column: auto; }
    .card-top { display: flex; justify-content: space-between; gap: 16px; position: relative; z-index: 2; }
    .card-top h3 { margin: 0; font-size: 26px; }
    .card-top p, .project-description { color: var(--muted); font-size: 13px; line-height: 1.7; }
    .card-top span { flex: 0 0 auto; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: var(--bg); padding: 6px 12px; font-family: monospace; font-size: 12px; }
    .project-media { position: relative; z-index: 2; height: 320px; margin-top: 40px; border: 1px solid rgba(255,255,255,.06); border-radius: 20px; overflow: hidden; background: rgba(0,0,0,.3); }
    .project-media img { width: 100%; height: 100%; object-fit: cover; filter: brightness(1.1) saturate(1.1); transition: transform .7s ease; }
    .project-card:hover img { transform: scale(1.05); }
    .project-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(4,19,15,.7), transparent); opacity: .55; }
    .empty-media { height: 100%; display: grid; place-items: center; color: var(--muted); font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; }
    .project-gallery { position: relative; z-index: 2; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; margin-top: 18px; }
    .project-gallery-item { overflow: hidden; border: 1px solid rgba(255,255,255,.06); border-radius: 16px; background: rgba(0,0,0,.26); }
    .project-gallery-item img { width: 100%; height: 112px; object-fit: cover; display: block; filter: brightness(1.1) saturate(1.1); transition: transform .55s ease, filter .55s ease; }
    .project-gallery-item:hover img { filter: brightness(1.16) saturate(1.14); transform: scale(1.05); }
    .project-gallery-item span { display: block; padding: 8px 10px; color: var(--muted); font-size: 11px; font-weight: 700; }
    .video-grid { display: grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: 32px; }
    .video-card { grid-column: span 4; }
    .video-card.wide { grid-column: span 8; }
    .video-media { position: relative; z-index: 2; height: 320px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,.06); background: rgba(0,0,0,.32); }
    .video-media video, .video-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .video-media img { filter: brightness(1.1) saturate(1.1); transition: transform .7s ease, filter .7s ease; }
    .video-card:hover .video-media img { transform: scale(1.05); }
    .video-link { position: relative; display: block; height: 100%; }
    .video-shade { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(4,19,15,.75), transparent); opacity: .6; }
    .video-badge { position: absolute; left: 20px; top: 20px; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: rgba(4,19,15,.8); color: var(--accent); padding: 7px 12px; font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
    .video-link strong { position: absolute; left: 20px; bottom: 20px; border-radius: 999px; background: var(--accent); color: black; padding: 10px 16px; font-size: 11px; letter-spacing: .16em; }
    .video-copy { position: relative; z-index: 2; padding: 32px; }
    .video-copy > span { color: var(--accent); font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; }
    .video-copy h3 { margin: 12px 0 8px; font-size: 26px; }
    .video-copy p { color: var(--muted); line-height: 1.7; }
    .elena-award-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 24px; }
    .elena-award-card { padding: 28px; }
    .award-card-top { position: relative; z-index: 2; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
    .award-star { display: grid; width: 48px; height: 48px; place-items: center; border: 1px solid rgba(0,230,153,.2); border-radius: 18px; background: rgba(0,230,153,.12); color: var(--accent); font-size: 18px; font-weight: 900; }
    .award-date { border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: var(--bg); color: var(--muted); padding: 6px 12px; font-family: monospace; font-size: 12px; }
    .award-card-copy { position: relative; z-index: 2; }
    .award-card-copy p { margin: 0 0 12px; color: var(--accent); font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; }
    .award-card-copy h3 { margin: 0; font-size: 26px; line-height: 1.18; }
    .award-card-copy span { display: block; margin-top: 14px; color: var(--muted); line-height: 1.7; }
    .process-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 32px; }
    .process-card, .skill-card { padding: 32px; }
    .process-card span { color: var(--accent); font-size: 11px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
    .process-card h3, .skill-card h3 { font-size: 26px; margin: 0; }
    .process-card strong, .process-card p { color: var(--muted); line-height: 1.7; }
    .skill-grid-elena { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 24px; }
    .fluid-panel { height: 260px; border-radius: 20px; border: 1px solid rgba(255,255,255,.06); display: grid; place-items: center; background: linear-gradient(135deg, var(--panel), var(--accent), var(--bg)); background-size: 200% 200%; animation: fluidGlow 12s ease infinite; }
    .fluid-panel span { color: rgba(255,255,255,.25); font-family: 'Plus Jakarta Sans'; font-size: 24px; font-weight: 900; letter-spacing: .2em; }
    .skill-card-copy { margin-top: 32px; }
    .skill-card-title { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .skill-card-title span { border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: var(--bg); color: var(--accent); padding: 6px 12px; font-family: monospace; font-size: 12px; }
    .skill-category { margin: 12px 0 14px; color: var(--accent); font-size: 11px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
    .skill-meter { height: 8px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.1); }
    .skill-meter span { display: block; height: 100%; border-radius: inherit; background: var(--accent); }
    @keyframes fluidGlow { 0%,100% { background-position: 0 50%; } 50% { background-position: 100% 50%; } }
    .contact-card { padding: 56px; }
    .contact-grid { display: grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: 48px; align-items: center; }
    .contact-copy { grid-column: span 6; }
    .contact-links { grid-column: span 6; display: grid; gap: 14px; }
    .social-row { display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,.1); border-radius: 18px; background: rgba(4,19,15,.6); padding: 16px 20px; transition: border-color .25s ease; }
    .social-row:hover { border-color: var(--accent); }
    footer { margin: 0 -24px; border-top: 1px solid rgba(255,255,255,.06); padding: 32px 24px; text-align: center; color: var(--muted); font-size: 12px; }
    .fade-up-element { opacity: 0; transform: translateY(40px); transition: opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1); }
    .fade-up-element.visible { opacity: 1; transform: translateY(0); }
    @media (max-width: 900px) {
      nav { display: none; }
      .hero, .process-grid, .skill-grid-elena, .contact-grid, .video-grid, .elena-award-grid { grid-template-columns: 1fr; }
      .hero-copy { min-height: auto; }
      .portrait { width: 100%; height: 460px; }
      .project-grid { grid-template-columns: 1fr; }
      .project-card, .project-card.wide, .video-card, .video-card.wide, .contact-copy, .contact-links { grid-column: auto; }
    }
  </style>
</head>
<body>
  <div class="grid-layer"></div>
  <div class="noise-layer"></div>
  <div class="glow" style="left:-15%; top:0; width:60%; height:700px;"></div>
  <div class="glow" style="right:-15%; top:1500px; width:50%; height:800px;"></div>
  <header>
    <a class="brand" href="#hero">${escapeHtml((data.user.username || data.user.displayName || 'creator').toLowerCase())}<span style="color:white">.</span></a>
    <nav>
      <a href="#hero" class="scramble-trigger" data-text="HOME">HOME</a>
      <a href="#works" class="scramble-trigger" data-text="SELECTED WORKS">SELECTED WORKS</a>
      ${data.config.showVideos && videos.length ? '<a href="#videos" class="scramble-trigger" data-text="VIDEO">VIDEO</a>' : ''}
      ${data.config.showAwards && awards.length ? '<a href="#awards" class="scramble-trigger" data-text="AWARDS">AWARDS</a>' : ''}
      ${data.config.showExperience && experiences.length ? '<a href="#process" class="scramble-trigger" data-text="THE PROCESS">THE PROCESS</a>' : ''}
      ${data.config.showSkills && skills.length ? '<a href="#skills" class="scramble-trigger" data-text="SKILLS">SKILLS</a>' : ''}
    </nav>
    <a class="talk" href="#contact">LET'S TALK</a>
  </header>
  <main>
    <section id="hero" class="container hero">
      <div class="hero-copy fade-up-element">
        <p class="identity-label">${escapeHtml(identityLabel)}</p>
        <h1>${elenaHighlightedHeroTitle(heroMainTitle)}</h1>
        <p style="max-width:440px">${escapeHtml(data.user.fullBio || 'A dark, interactive portfolio built around visual craft, motion, and technical depth.')}</p>
        <a class="button" href="#works">EXPLORE WORK <span aria-hidden="true">→</span></a>
        ${data.config.showSkills && skills.length ? `<div class="hero-tags">${skillStrip}</div>` : ''}
      </div>
      <article class="tilt-card portrait fade-up-element" style="transition-delay:150ms">
        ${data.user.avatarUrl ? `<img src="${escapeHtml(data.user.avatarUrl)}" alt="${escapeHtml(data.user.displayName)}">` : ''}
        <div class="caption">
          <strong>[ IN ACTION ]</strong>
          <p class="muted">${escapeHtml(data.user.location || 'Merging high design with high performance engineering.')}</p>
        </div>
      </article>
    </section>
    <section id="works" class="container">
      <div class="section-head fade-up-element"><span class="eyebrow">[ SELECTED PORTFOLIO ]</span><h2>Recent visual codes<br><span>crafted with technical depth</span></h2></div>
      <div class="${projectGridClass}">${projectCards}</div>
    </section>
    ${data.config.showVideos && videos.length ? `<section id="videos" class="container"><div class="section-head fade-up-element"><span class="eyebrow">[ MOTION PROOF ]</span><h2>Project stories<br><span>shown through video</span></h2></div><div class="video-grid">${videoCards}</div></section>` : ''}
    ${data.config.showAwards && awards.length ? `<section id="awards" class="container"><div class="section-head fade-up-element"><span class="eyebrow">[ RECOGNITION ]</span><h2>Honors and signals<br><span>earned through the work</span></h2></div><div class="elena-award-grid">${awardCards}</div></section>` : ''}
    ${data.config.showExperience && experiences.length ? `<section id="process" class="container"><div class="section-head fade-up-element" style="text-align:center"><span class="eyebrow">[ THE PROCESS ]</span><h2>Experience built<br><span>around strategic goals</span></h2></div><div class="process-grid">${experienceCards}</div></section>` : ''}
    ${data.config.showSkills && skills.length ? `<section id="skills" class="container"><div class="section-head fade-up-element" style="text-align:center"><span class="eyebrow">[ SKILL STACK ]</span><h2>Capabilities shaped by<br><span>hands-on project work</span></h2></div><div class="skill-grid-elena">${skillCards}</div></section>` : ''}
    <section id="contact" class="container">
      <article class="tilt-card contact-card fade-up-element">
        <div class="contact-grid">
          <div class="contact-copy"><span class="eyebrow">[ CONTACT ]</span><h2>Invest in the most<br><span style="color:var(--accent); font-weight:800">important asset you have.</span></h2><p class="muted">If the work resonates, reach out for project collaboration, role opportunities, or a creative conversation.</p>${data.user.email ? `<a class="button" href="mailto:${escapeHtml(data.user.email)}">EMAIL</a>` : ''}</div>
          <div class="contact-links">${socials.map((link) => `<a class="social-row" href="${escapeHtml(link.url)}"><span>${socialIcon(link)} ${escapeHtml(link.platform)}</span><span>→</span></a>`).join('')}</div>
        </div>
      </article>
    </section>
  </main>
  <footer>© 2026 ${escapeHtml(data.user.displayName || 'Personal Portfolio')}. Crafted with SiteForge.</footer>
  <script>
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
        const rotateX = (rect.height / 2 - y) / 42;
        const rotateY = (x - rect.width / 2) / 42;
        card.style.transform = 'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.003,1.003,1.003)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      });
    });
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    document.querySelectorAll('.scramble-trigger').forEach((element) => {
      const originalText = element.dataset.text || element.textContent || '';
      element.addEventListener('mouseenter', () => {
        let iteration = 0;
        const timer = setInterval(() => {
          element.textContent = originalText.split('').map((letter, index) => index < iteration ? originalText[index] : letter === ' ' ? ' ' : letters[Math.floor(Math.random() * letters.length)]).join('');
          if (iteration >= originalText.length) clearInterval(timer);
          iteration += 1 / 3;
        }, 30);
      });
    });
    const fadeElements = Array.from(document.querySelectorAll('.fade-up-element'));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      fadeElements.forEach((element) => observer.observe(element));
    } else {
      fadeElements.forEach((element) => element.classList.add('visible'));
    }
  </script>
</body>
</html>`;
}
