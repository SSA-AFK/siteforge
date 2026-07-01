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

function projectCard(project: Project, primaryColor: string, index = 0, featured = false) {
  const animation = index % 2 === 0 ? 'fade-right' : 'fade-left';
  const delay = (index % 3) * 100;
  const gallery = [...(project.images ?? [])]
    .filter((image) => image.imageUrl)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 4)
    .map((image) => `<figure><button class="image-preview-trigger" type="button" data-preview-src="${escapeHtml(image.imageUrl)}" data-preview-alt="${escapeHtml(image.caption || project.title)}" aria-label="预览 ${escapeHtml(image.caption || project.title)}"><img src="${escapeHtml(image.imageUrl)}" alt="${escapeHtml(image.caption || project.title)}" /></button>${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ''}</figure>`)
    .join('');

  return `
    <article class="card project-card ${featured ? 'featured' : ''}" data-aos="${animation}" style="transition-delay:${delay}ms">
      ${project.coverImage ? `<button class="image-preview-trigger" type="button" data-preview-src="${escapeHtml(project.coverImage)}" data-preview-alt="${escapeHtml(project.title)}" aria-label="Preview ${escapeHtml(project.title)}"><img src="${escapeHtml(project.coverImage)}" alt="${escapeHtml(project.title)}" /></button>` : '<div class="media-placeholder">Select a cover image</div>'}
      <div class="project-body">
        ${featured ? `<span class="featured-pill" style="color:${primaryColor}; background: color-mix(in srgb, ${primaryColor} 10%, white);">Featured</span>` : ''}
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
  if (templateId === 'aura') {
    return renderAuraHtml(data);
  }

  if (templateId === 'jakarta') {
    return renderJakartaHtml(data);
  }

  if (templateId === 'aqua') {
    return renderAquaHtml(data);
  }

  if (templateId === 'solace') {
    return renderSolaceHtml(data);
  }

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
    .project-card.featured { grid-column: span 2; }
    .project-card > .image-preview-trigger { width: 100%; height: 280px; }
    .media-placeholder { width: 100%; height: 280px; display: grid; place-items: center; background: #f1f5f9; color: #94a3b8; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; text-align: center; }
    .project-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .image-preview-trigger { display: block; border: 0; padding: 0; background: transparent; cursor: zoom-in; overflow: hidden; font: inherit; }
    .image-preview-trigger img { transition: transform .5s ease; }
    .image-preview-trigger:hover img { transform: scale(1.04); }
    .project-body { padding: 24px; }
    .featured-pill { display: inline-flex; margin: 0 8px 10px 0; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
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
      .project-card.featured, .video-card.featured { grid-column: auto; }
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
  ${projects.length ? `<section id="work" class="work sf-reveal"><div class="container"><div data-aos="fade-up"><span class="eyebrow">Selected Work</span><h2>Recent projects with practical depth.</h2></div><div class="${projectGridClass}">${projects.map((project, index) => projectCard(project, primaryColor, index, data.config.layout !== 'list' && Boolean(project.isFeatured))).join('')}</div></div></section>` : ''}
  ${data.config.showAwards && awards.length ? `<section id="awards" class="awards sf-reveal"><div class="container"><div data-aos="fade-up"><span class="eyebrow">Awards</span><h2>荣誉奖项与专业认可。</h2></div><div class="award-grid">${awards.map((award, index) => awardCard(award, primaryColor, index)).join('')}</div></div></section>` : ''}
  ${data.config.showSkills && skills.length ? `<section id="skills" class="sf-reveal"><div class="container"><div data-aos="fade-up"><span class="eyebrow">Skills</span><h2>Tools and strengths.</h2></div><div class="skill-grid">${skills.map((skill, index) => `<div class="card skill" data-aos="fade-up" style="transition-delay:${(index % 3) * 100}ms"><strong>${escapeHtml(skill.name)}</strong><p>${escapeHtml(skill.category || '')}</p><div class="bar"><span style="width:${skill.proficiency * 20}%"></span></div></div>`).join('')}</div></div></section>` : ''}
  ${data.config.showVideos && videos.length ? `<section id="videos" class="work sf-reveal"><div class="container"><div data-aos="fade-up"><span class="eyebrow">Video</span><h2>Stories, demos, and walkthroughs.</h2></div><div class="video-grid">${videos.map((video, index) => videoCard(video, index)).join('')}</div></div></section>` : ''}
  ${data.config.showExperience && experiences.length ? `<section class="sf-reveal"><div class="container"><h2 data-aos="fade-up">Experience</h2><div class="timeline">${experiences.map((experience, index) => `<article class="card experience" data-aos="fade-up" style="transition-delay:${(index % 3) * 100}ms"><div class="experience-top"><div><p class="experience-type">${escapeHtml(experience.type === 'education' ? 'Education' : 'Work')}</p><h3>${escapeHtml(experience.position)}</h3><p class="experience-company">${escapeHtml(experience.company)}</p></div><span class="experience-period">${escapeHtml(experiencePeriod(experience.startDate, experience.endDate, experience.isCurrent))}</span></div>${experience.description ? `<p class="experience-description">${escapeHtmlWithBreaks(experience.description)}</p>` : ''}</article>`).join('')}</div></div></section>` : ''}
  <section id="contact" class="sf-reveal">
    <div class="footer-cta">
      <div class="footer-cta-inner" data-aos="fade-up">
        <div class="footer-cta-copy">
          <div class="footer-cta-icon">!</div>
          <div style="display:none">
            <h2>准备好开启下一次合作？</h2>
            <p>作品交流、项目合作或职位机会，都可以从这里开始。</p>
          </div>
        </div>
        <div class="footer-cta-text">
          <h2>Available for selected collaborations</h2>
          <p>Portfolio reviews, freelance projects, and role opportunities can start here.</p>
        </div>
        <a class="footer-cta-button" href="${data.user.email ? `mailto:${escapeHtml(data.user.email)}` : '#contact'}">
          <span>☎</span>
          <div><small>Start a conversation</small><strong>${escapeHtml(data.user.email || 'Get in touch')}</strong></div>
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
  const videos = sortByOrder(data.videos ?? [])
    .filter((video) => video.videoUrl.trim())
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder);
  const title = data.config.seoTitle || `${data.user.displayName} - Interactive Portfolio`;
  const description = data.config.seoDescription || data.user.bio || 'Built with SiteForge';
  const projectGridClass = data.config.layout === 'list' ? 'project-grid list' : 'project-grid';
  const identityLabel = data.user.title || '设计师 / 开发者';
  const heroMainTitle = data.user.bio || '用创意和技术构建美好数字体验';

  const socialIcon = (link: SocialLink) => escapeHtml((link.platform || link.icon || 'Link').slice(0, 1).toUpperCase());
  const projectCards = projects.map((project, index) => {
    const span = data.config.layout === 'list' ? '' : project.isFeatured ? ' wide' : '';
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
          <div class="project-meta">
            ${project.isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
            ${project.startDate || project.endDate ? `<span>${escapeHtml(project.endDate || project.startDate)}</span>` : ''}
          </div>
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
    .project-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .project-meta .featured-badge { border-color: rgba(0,230,153,.25); background: rgba(0,230,153,.1); color: var(--accent); font-family: Inter, system-ui, sans-serif; font-size: 10px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
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

function renderAuraHtml(data: SiteData) {
  const projects = sortByOrder(data.projects);
  const skills = sortByOrder(data.skills);
  const awards = sortByOrder(data.awards ?? []).filter((award) => award.title.trim());
  const experiences = sortByOrder(data.experiences);
  const socials = sortByOrder(data.socialLinks);
  const videos = sortByOrder(data.videos ?? [])
    .filter((video) => video.videoUrl.trim())
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder);
  const title = data.config.seoTitle || `${data.user.displayName} - Aura Terminal`;
  const description = data.config.seoDescription || data.user.bio || 'Built with SiteForge';
  const projectGridClass = data.config.layout === 'list' ? 'matrix-grid list' : 'matrix-grid';

  const projectCards = projects.map((project, index) => {
    const colors = ['#49c5b6', '#ff9398', '#a3e635'];
    const accent = colors[index % colors.length];
    const featuredClass = project.isFeatured ? ' featured' : '';
    const gallery = sortByOrder(project.images ?? [])
      .filter((image) => image.imageUrl)
      .slice(0, 2)
      .map((image) => `<a href="${escapeHtml(image.imageUrl)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(image.imageUrl)}" alt="${escapeHtml(image.caption || project.title)}"></a>`)
      .join('');
    return `
      <article class="terminal-card project-node aura-reveal interactive-item project-card${featuredClass}" data-card-index="${index}">
        <span class="corner tl"></span><span class="corner br"></span>
        <div class="node-row"><p style="color:${accent}">[NODE_${String(index + 1).padStart(2, '0')}_SYS]</p>${project.isFeatured ? '<span>FEATURED</span>' : ''}</div>
        <div class="project-head">
          <div><h3>${escapeHtml(project.title || 'Untitled Project')}</h3><small>${escapeHtml(project.category)}${project.role ? ` / ${escapeHtml(project.role)}` : ''}</small></div>
          ${project.endDate || project.startDate ? `<time>${escapeHtml(project.endDate || project.startDate)}</time>` : ''}
        </div>
        ${project.coverImage ? `<a class="cover" href="${escapeHtml(project.coverImage)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(project.coverImage)}" alt="${escapeHtml(project.title)}"></a>` : ''}
        ${project.description ? `<p class="copy">${escapeHtml(project.description)}</p>` : ''}
        ${project.tools ? `<div class="meta">TOOLS: ${escapeHtml(project.tools)}</div>` : ''}
        ${gallery ? `<div class="gallery-mini">${gallery}</div>` : ''}
      </article>`;
  }).join('');

  const videoCards = videos.map((video) => {
    const featuredClass = video.isFeatured ? ' featured' : '';
    const media = isDirectVideoUrl(video.videoUrl)
      ? `<button class="video-trigger interactive-item" type="button" data-video-url="${escapeHtml(video.videoUrl)}" ${video.thumbnailUrl ? `data-poster="${escapeHtml(video.thumbnailUrl)}"` : ''}>${video.thumbnailUrl ? `<img src="${escapeHtml(video.thumbnailUrl)}" alt="${escapeHtml(video.title)}">` : ''}<span class="play">▶</span></button>`
      : `<a href="${escapeHtml(video.videoUrl)}" target="_blank" rel="noreferrer">${video.thumbnailUrl ? `<img src="${escapeHtml(video.thumbnailUrl)}" alt="${escapeHtml(video.title)}">` : ''}<span class="play">▶</span></a>`;
    return `
      <article class="terminal-card video-terminal aura-reveal interactive-item${featuredClass}">
        <span class="corner tl"></span><span class="corner br"></span>
        ${video.isFeatured ? '<div class="stream-priority"><span>PRIORITY STREAM</span><span>FEATURED</span></div>' : ''}
        <div class="video-frame">${media}<b>REC [LIVE]</b><em>${escapeHtml(video.platform.toUpperCase())}</em></div>
        <h3>${escapeHtml(video.title || 'Video Stream')}</h3>
        ${video.description ? `<p class="copy">${escapeHtml(video.description)}</p>` : ''}
      </article>`;
  }).join('');

  const awardCards = awards.map((award, index) => `
    <article class="terminal-card award-node aura-reveal">
      <span class="corner tl"></span><span class="corner br"></span>
      <div class="award-row"><strong>*</strong><div><p>AWARD_${String(index + 1).padStart(2, '0')} ${award.date ? `// ${escapeHtml(award.date)}` : ''}</p><h3>${escapeHtml(award.title)}</h3>${award.issuer ? `<small>${escapeHtml(award.issuer)}</small>` : ''}${award.description ? `<span>${escapeHtml(award.description)}</span>` : ''}</div></div>
    </article>`).join('');

  const experienceCards = experiences.map((experience, index) => `
    <article class="timeline-node aura-reveal">
      <i></i>
      <div class="timeline-top"><b style="color:${index % 2 ? '#ff9398' : '#49c5b6'}">${escapeHtml(experience.startDate)}${experience.isCurrent ? ' - PRESENT' : experience.endDate ? ` - ${escapeHtml(experience.endDate)}` : ''}</b><span>${escapeHtml(experience.company)}</span></div>
      <h3>${escapeHtml(experience.position)}</h3>
      ${experience.description ? `<p>${escapeHtmlWithBreaks(experience.description)}</p>` : ''}
    </article>`).join('');

  const skillCards = skills.map((skill, index) => {
    const level = Math.max(0, Math.min(5, skill.proficiency || 0));
    const percent = level * 20;
    const accent = ['#49c5b6', '#ff9398', '#a3e635'][index % 3];
    const segments = Array.from({ length: 5 }, (_, segment) => `<span class="${segment < level ? 'on' : ''}"></span>`).join('');
    return `
    <article class="skill-node aura-reveal interactive-item" style="--skill-percent:${percent}%; --skill-accent:${accent}">
      <span class="corner tl"></span><span class="corner br"></span>
      <div class="skill-top">
        <div><p style="color:${accent}">PROTOCOL_${String(index + 1).padStart(2, '0')}</p><h3>${escapeHtml(skill.name)}</h3>${skill.category ? `<small>${escapeHtml(skill.category)}</small>` : ''}</div>
        <div class="skill-orb"><span>${level}</span></div>
      </div>
      <div class="skill-segments">${segments}</div>
      <i><b style="width:${percent}%"></b></i>
      <div class="skill-sync"><span>SYNC ${percent}%</span><span>READY</span></div>
    </article>`;
  }).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    :root { --bg:#030208; --cyan:#49c5b6; --pink:#ff9398; --lime:#a3e635; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin:0; overflow-x:hidden; background:var(--bg); color:#cbd5e1; font-family:'Space Mono', monospace; }
    @media (hover:hover) and (pointer:fine) { body, a, button { cursor:none; } }
    a { color:inherit; text-decoration:none; }
    canvas { position:fixed; inset:0; width:100%; height:100%; z-index:-10; }
    .scanlines { position:fixed; inset:0; z-index:50; pointer-events:none; background:linear-gradient(to bottom, transparent, transparent 50%, rgba(0,243,255,.018) 50%, rgba(0,243,255,.018)); background-size:100% 4px; }
    .sweep-line { position:fixed; inset:0; z-index:50; pointer-events:none; background:linear-gradient(to bottom, transparent, rgba(73,197,182,.08), transparent); animation:scan 10s linear infinite; }
    .noise { position:fixed; inset:0; z-index:20; pointer-events:none; opacity:.05; mix-blend-mode:screen; background-image:radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px); background-size:3px 3px; }
    @keyframes scan { from { transform:translateY(-100%); } to { transform:translateY(100%); } }
    .grid { position:fixed; inset:0; z-index:-9; pointer-events:none; background-size:50px 50px; background-image:linear-gradient(to right, rgba(73,197,182,.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(73,197,182,.035) 1px, transparent 1px); }
    .glow { position:fixed; inset:0; z-index:-8; pointer-events:none; background:radial-gradient(circle 350px at var(--mouse-x,50%) var(--mouse-y,50%), rgba(73,197,182,.13), transparent 80%); }
    .custom-cursor, .custom-cursor-dot { position:fixed; left:0; top:0; z-index:70; pointer-events:none; transform:translate3d(var(--mouse-x,50vw), var(--mouse-y,50vh), 0) translate(-50%,-50%); }
    .custom-cursor { width:20px; height:20px; border:1px solid rgba(73,197,182,.5); border-radius:999px; transition:width .28s ease, height .28s ease, border-color .28s ease, background-color .28s ease; }
    .custom-cursor-dot { width:6px; height:6px; border-radius:999px; background:var(--cyan); }
    .custom-cursor.active { width:55px; height:55px; border-color:var(--pink); background:rgba(255,147,152,.06); }
    .screen-corner { position:fixed; z-index:30; width:24px; height:24px; pointer-events:none; border-color:rgba(73,197,182,.3); }
    .screen-corner.tl { top:16px; left:16px; border-top:2px solid; border-left:2px solid; }
    .screen-corner.tr { top:16px; right:16px; border-top:2px solid; border-right:2px solid; }
    .screen-corner.bl { bottom:16px; left:16px; border-bottom:2px solid; border-left:2px solid; }
    .screen-corner.br { bottom:16px; right:16px; border-bottom:2px solid; border-right:2px solid; }
    .aura-reveal { opacity:0; transform:translate3d(0,48px,0); transition:opacity 1.1s cubic-bezier(.16,1,.3,1), transform 1.1s cubic-bezier(.16,1,.3,1); }
    .aura-reveal.aura-visible { opacity:1; transform:translate3d(0,0,0); }
    nav { position:fixed; top:0; left:0; width:100%; z-index:40; display:flex; align-items:center; justify-content:space-between; padding:22px 40px; border-bottom:1px solid rgba(255,255,255,.05); backdrop-filter:blur(14px); }
    .brand { color:white; font-weight:700; letter-spacing:.22em; }
    .navlinks { display:flex; gap:36px; color:#cbd5e1; font-size:12px; letter-spacing:.2em; }
    .navlinks a:hover { color:var(--cyan); }
    .core { border:1px solid rgba(73,197,182,.3); color:var(--cyan); padding:4px 10px; font-size:12px; }
    main { position:relative; z-index:10; max-width:1152px; margin:0 auto; padding:0 24px; }
    section { border-top:1px solid rgba(255,255,255,.05); padding:112px 0; }
    .hero { min-height:100vh; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; border-top:0; padding-top:90px; }
    .hero-label { border-left:2px solid var(--cyan); padding-left:24px; margin-bottom:32px; }
    .hero-label p { margin:0 0 6px; color:var(--cyan); font-size:12px; letter-spacing:.4em; text-transform:uppercase; }
    .hero-label span { color:#64748b; font-size:10px; letter-spacing:.22em; text-transform:uppercase; }
    h1 { margin:0 0 24px; color:white; font-size:clamp(52px, 9vw, 112px); line-height:.94; letter-spacing:-.08em; }
    h1 span { background:linear-gradient(90deg,var(--cyan),var(--lime),var(--pink)); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .hero-copy { max-width:520px; margin:0 0 32px; color:#94a3b8; font-size:12px; line-height:1.8; }
    .button { position:relative; display:inline-block; border:1px solid rgba(73,197,182,.4); padding:16px 32px; color:var(--cyan); font-size:12px; letter-spacing:.22em; transition:.35s; }
    .button:hover { background:var(--cyan); color:black; }
    .section-head { margin-bottom:60px; }
    .section-head p { margin:0 0 8px; color:var(--cyan); font-size:12px; letter-spacing:.22em; }
    .section-head h2 { margin:0; color:white; font-size:40px; }
    .matrix-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:32px; }
    .matrix-grid.list { grid-template-columns:1fr; }
    .terminal-card { position:relative; overflow:hidden; border:1px solid rgba(73,197,182,.15); background:rgba(4,3,10,.75); padding:28px; backdrop-filter:blur(16px); clip-path:polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px)); box-shadow:inset 0 0 0 1px rgba(73,197,182,.08), inset 0 0 36px rgba(73,197,182,.045), 0 20px 80px rgba(0,0,0,.28); transition:.55s cubic-bezier(.16,1,.3,1); }
    .terminal-card::before { content:""; position:absolute; inset:0; z-index:0; pointer-events:none; background:radial-gradient(circle at 20% 0%, rgba(73,197,182,.18), transparent 34%), linear-gradient(120deg, transparent 0%, rgba(73,197,182,.16) 44%, transparent 62%); transform:translateX(-125%); opacity:.9; transition:transform .95s cubic-bezier(.16,1,.3,1); }
    .terminal-card::after { content:""; position:absolute; inset:1px; z-index:0; pointer-events:none; background-image:linear-gradient(rgba(73,197,182,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(73,197,182,.035) 1px, transparent 1px), repeating-linear-gradient(0deg, transparent 0 7px, rgba(255,255,255,.025) 8px); background-size:18px 18px, 18px 18px, auto; opacity:.72; mix-blend-mode:screen; }
    .terminal-card:hover { transform:translateY(-5px); border-color:rgba(73,197,182,.78); box-shadow:0 0 55px rgba(73,197,182,.2), inset 0 0 34px rgba(73,197,182,.06); }
    .terminal-card:hover::before { transform:translateX(125%); }
    .terminal-card > * { position:relative; z-index:1; }
    .matrix-grid:not(.list) .project-node.featured { grid-column:span 2; border-color:rgba(73,197,182,.45); box-shadow:0 0 70px rgba(73,197,182,.14), inset 0 0 42px rgba(73,197,182,.06); }
    .corner { position:absolute; z-index:20; width:16px; height:16px; border-color:rgba(73,197,182,.45); transition:.3s; }
    .tl { top:0; left:0; border-left:2px solid; border-top:2px solid; }
    .br { right:0; bottom:0; border-right:2px solid; border-bottom:2px solid; }
    .terminal-card:hover .corner { border-color:var(--cyan); }
    .node-row { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .node-row p, .meta { margin:0; font-size:10px; font-weight:700; letter-spacing:.22em; color:var(--cyan); }
    .node-row span { border:1px solid rgba(73,197,182,.4); background:rgba(73,197,182,.1); padding:4px 8px; color:var(--cyan); font-size:9px; font-weight:700; letter-spacing:.2em; }
    .project-head { display:flex; justify-content:space-between; gap:16px; margin-top:24px; }
    .project-head h3, .video-terminal h3, .award-node h3, .timeline-node h3 { margin:0; color:white; font-size:20px; }
    .project-node.featured .project-head h3 { font-size:26px; }
    small, time { color:#64748b; font-size:11px; line-height:1.6; }
    .cover { display:block; margin-top:28px; overflow:hidden; border:1px solid rgba(255,255,255,.1); background:black; }
    .cover img { width:100%; height:210px; object-fit:cover; display:block; filter:brightness(1.05) saturate(1.1); transition:.7s; }
    .project-node.featured .cover img { height:288px; }
    .cover:hover img { transform:scale(1.05); }
    .copy { color:#94a3b8; font-size:12px; line-height:1.8; }
    .gallery-mini { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-top:20px; }
    .gallery-mini img { width:100%; height:96px; object-fit:cover; display:block; }
    .video-grid, .award-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:32px; }
    .video-terminal.featured { grid-column:span 2; border-color:rgba(255,147,152,.5); box-shadow:0 0 55px rgba(255,147,152,.14); }
    .stream-priority { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; color:var(--pink); font-size:10px; font-weight:700; letter-spacing:.22em; }
    .video-frame { position:relative; aspect-ratio:16/9; background:#020617; overflow:hidden; }
    .video-terminal.featured .video-frame { aspect-ratio:21/9; }
    .video-frame video, .video-frame img, .video-trigger { width:100%; height:100%; object-fit:cover; display:block; }
    .video-trigger { position:relative; appearance:none; border:0; padding:0; background:#020617; color:inherit; }
    .play { position:absolute; inset:0; display:grid; place-items:center; color:var(--cyan); font-size:44px; background:linear-gradient(45deg, rgba(2,6,23,.8), rgba(15,23,42,.4)); }
    .video-frame b { position:absolute; left:16px; top:16px; color:rgba(73,197,182,.55); font-size:10px; font-weight:400; }
    .video-frame em { position:absolute; right:16px; bottom:16px; color:#64748b; font-size:10px; font-style:normal; font-weight:700; }
    .award-row { display:flex; gap:18px; }
    .award-row strong { display:grid; width:40px; height:40px; flex:0 0 auto; place-items:center; border:1px solid rgba(73,197,182,.4); color:var(--cyan); }
    .award-row p { margin:0; color:var(--cyan); font-size:10px; font-weight:700; letter-spacing:.2em; }
    .award-row span { display:block; margin-top:12px; color:#94a3b8; font-size:12px; line-height:1.7; }
    .timeline { position:relative; margin-left:24px; padding-left:36px; border-left:1px solid rgba(255,255,255,.1); }
    .timeline-node { position:relative; margin-bottom:56px; }
    .timeline-node i { position:absolute; left:-45px; top:4px; width:16px; height:16px; border:2px solid var(--cyan); border-radius:999px; background:var(--bg); }
    .timeline-top { display:flex; justify-content:space-between; gap:16px; margin-bottom:10px; }
    .timeline-top b { font-size:12px; letter-spacing:.18em; }
    .timeline-top span { color:#64748b; font-size:10px; text-transform:uppercase; }
    .timeline-node p { max-width:780px; color:#94a3b8; font-size:12px; line-height:1.8; }
    .skill-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
    .skill-node { position:relative; overflow:hidden; border:1px solid rgba(73,197,182,.15); background:rgba(4,3,10,.7); padding:20px; clip-path:polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px)); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--skill-accent) 14%, transparent), inset 0 0 36px rgba(73,197,182,.045), 0 20px 80px rgba(0,0,0,.28); transition:transform .55s cubic-bezier(.16,1,.3,1), border-color .55s cubic-bezier(.16,1,.3,1), box-shadow .55s cubic-bezier(.16,1,.3,1); }
    .skill-node::before { content:""; position:absolute; inset:0; background:linear-gradient(120deg, transparent 0%, color-mix(in srgb, var(--skill-accent) 17%, transparent) 45%, transparent 62%); transform:translateX(-120%); transition:transform .85s cubic-bezier(.16,1,.3,1); }
    .skill-node::after { content:""; position:absolute; inset:1px; pointer-events:none; background:radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--skill-accent) 17%, transparent), transparent 34%), linear-gradient(rgba(73,197,182,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(73,197,182,.03) 1px, transparent 1px), repeating-linear-gradient(0deg, transparent 0 7px, rgba(255,255,255,.025) 8px); background-size:auto, 18px 18px, 18px 18px, auto; opacity:.78; }
    .skill-node:hover { transform:translateY(-6px); border-color:color-mix(in srgb, var(--skill-accent) 75%, transparent); box-shadow:0 0 46px color-mix(in srgb, var(--skill-accent) 18%, transparent), inset 0 0 30px color-mix(in srgb, var(--skill-accent) 7%, transparent); }
    .skill-node:hover::before { transform:translateX(120%); }
    .skill-top { position:relative; z-index:1; display:flex; justify-content:space-between; align-items:flex-start; gap:16px; color:white; }
    .skill-top p { margin:0; font-size:10px; font-weight:700; letter-spacing:.24em; }
    .skill-top h3 { margin:12px 0 0; color:white; font-size:20px; }
    .skill-top small { display:block; margin-top:8px; color:#64748b; font-size:10px; letter-spacing:.22em; text-transform:uppercase; }
    .skill-orb { width:58px; height:58px; flex:0 0 auto; display:grid; place-items:center; border-radius:999px; color:white; font-size:15px; font-weight:800; background:conic-gradient(var(--skill-accent) var(--skill-percent), rgba(255,255,255,.08) 0), radial-gradient(circle, #04030a 58%, transparent 60%); box-shadow:0 0 24px color-mix(in srgb, var(--skill-accent) 38%, transparent); }
    .skill-orb span { display:grid; place-items:center; width:40px; height:40px; border:1px solid rgba(255,255,255,.08); border-radius:999px; background:rgba(4,3,10,.92); }
    .skill-segments { position:relative; z-index:1; display:grid; grid-template-columns:repeat(5,1fr); gap:6px; margin-top:28px; }
    .skill-segments span { height:28px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.03); }
    .skill-segments span.on { border-color:rgba(73,197,182,.7); background:rgba(73,197,182,.2); box-shadow:0 0 18px rgba(73,197,182,.18); }
    .skill-node i { position:relative; z-index:1; display:block; height:1px; margin-top:20px; overflow:hidden; background:rgba(255,255,255,.1); }
    .skill-node b { display:block; height:100%; background:linear-gradient(90deg,var(--cyan),var(--lime),var(--pink)); }
    .skill-sync { position:relative; z-index:1; display:flex; justify-content:space-between; margin-top:16px; color:#475569; font-size:9px; letter-spacing:.2em; text-transform:uppercase; }
    .contact { text-align:center; }
    .contact h2 { color:white; font-size:clamp(34px, 7vw, 72px); }
    .contact-links { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; }
    .contact-links a, .contact-links span { border:1px solid rgba(255,255,255,.1); padding:14px 20px; color:#94a3b8; font-size:12px; }
    .contact-links a:hover { border-color:var(--cyan); color:var(--cyan); }
    .video-modal { position:fixed; inset:0; z-index:80; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(0,0,0,.95); backdrop-filter:blur(12px); opacity:0; pointer-events:none; transition:.45s ease; }
    .video-modal.open { opacity:1; pointer-events:auto; }
    .modal-close { position:absolute; top:32px; right:32px; border:1px solid rgba(255,255,255,.1); background:transparent; color:white; padding:9px 14px; font-size:12px; letter-spacing:.18em; }
    .modal-close:hover { border-color:var(--cyan); color:var(--cyan); }
    .modal-frame { width:min(100%, 960px); aspect-ratio:16/9; border:1px solid rgba(255,255,255,.1); background:black; box-shadow:0 24px 80px rgba(0,0,0,.6); }
    .modal-frame video { width:100%; height:100%; object-fit:cover; display:block; }
    footer { border-top:1px solid rgba(255,255,255,.05); padding:40px 24px; text-align:center; color:#475569; font-size:10px; letter-spacing:.2em; }
    @media (max-width: 820px) { nav { padding:18px 20px; } .navlinks { display:none; } .matrix-grid, .video-grid, .award-grid, .skill-grid { grid-template-columns:1fr; } h1 { font-size:52px; } }
  </style>
</head>
<body>
  <canvas id="auraCanvas"></canvas><div class="grid"></div><div class="glow"></div><div class="noise"></div><div class="scanlines"></div><div class="sweep-line"></div>
  <div class="screen-corner tl"></div><div class="screen-corner tr"></div><div class="screen-corner bl"></div><div class="screen-corner br"></div>
  <div id="customCursor" class="custom-cursor"></div><div id="customCursorDot" class="custom-cursor-dot"></div>
  <nav><a class="brand interactive-item" href="#home">${escapeHtml((data.user.username || data.user.displayName || 'AURA').toUpperCase())}</a><div class="navlinks"><a class="interactive-item" href="#home">INDEX</a><a class="interactive-item" href="#projects">PROJECTS</a>${data.config.showVideos && videos.length ? '<a class="interactive-item" href="#video-section">REELS</a>' : ''}${data.config.showAwards && awards.length ? '<a class="interactive-item" href="#awards">AWARDS</a>' : ''}${data.config.showExperience && experiences.length ? '<a class="interactive-item" href="#resume">BIOGRAPHY</a>' : ''}</div><div class="core">CORE_V3.0</div></nav>
  <main>
    <section id="home" class="hero"><div class="hero-label aura-reveal"><p>${escapeHtml(data.user.title || 'SYSTEM ONLINE // CORE_V3')}</p><span>${escapeHtml(data.user.location || 'GPU MULTI-AXIS WAVE DEFORMATION')}</span></div><h1 class="aura-reveal">${escapeHtml(data.user.displayName || 'CYBERNETIC')}<br><span>${escapeHtml(data.user.bio || 'METAVERSE')}</span></h1><p class="hero-copy aura-reveal">${escapeHtml(data.user.fullBio || 'A cyber terminal portfolio for spatial interfaces, multimedia demos, and high-signal creative systems.')}</p><a class="button interactive-item aura-reveal" href="#projects"><span class="corner tl"></span><span class="corner br"></span>INITIALIZE SCAN //</a></section>
    <section id="projects"><div class="section-head aura-reveal"><p>// SELECTED TELEMETRY</p><h2 class="scramble-trigger" data-text="CORE DATA MATRIX">CORE DATA MATRIX</h2></div><div class="${projectGridClass}">${projectCards}</div></section>
    ${data.config.showVideos && videos.length ? `<section id="video-section"><div class="section-head aura-reveal"><p>// REELS & DEMOS</p><h2 class="scramble-trigger" data-text="MULTIMEDIA TERMINAL">MULTIMEDIA TERMINAL</h2></div><div class="video-grid">${videoCards}</div></section>` : ''}
    ${data.config.showAwards && awards.length ? `<section id="awards"><div class="section-head aura-reveal"><p>// RECOGNITION LOG</p><h2 class="scramble-trigger" data-text="HONOR DATA VAULT">HONOR DATA VAULT</h2></div><div class="award-grid">${awardCards}</div></section>` : ''}
    ${data.config.showExperience && experiences.length ? `<section id="resume"><div class="section-head aura-reveal"><p>// EXPERIENCE CHRONOLOGY</p><h2 class="scramble-trigger" data-text="BIOGRAPHY DATABASE">BIOGRAPHY DATABASE</h2></div><div class="timeline">${experienceCards}</div></section>` : ''}
    ${data.config.showSkills && skills.length ? `<section id="skills"><div class="section-head aura-reveal"><p>// CAPABILITY STACK</p><h2 class="scramble-trigger" data-text="SKILL PROTOCOLS">SKILL PROTOCOLS</h2></div><div class="skill-grid">${skillCards}</div></section>` : ''}
    <section id="contact" class="contact"><h2 class="aura-reveal scramble-trigger" data-text="CONNECT TO PORT">CONNECT TO PORT</h2><p class="hero-copy aura-reveal" style="margin-left:auto;margin-right:auto">Establish a secure channel for collaboration, roles, or experimental digital systems.</p><div class="contact-links aura-reveal">${data.user.email ? `<a class="interactive-item" href="mailto:${escapeHtml(data.user.email)}">EMAIL</a>` : ''}${data.user.location ? `<span>${escapeHtml(data.user.location)}</span>` : ''}${socials.map((social) => `<a class="interactive-item" href="${escapeHtml(social.url)}">${escapeHtml(social.platform)}</a>`).join('')}</div></section>
  </main>
  <footer>2026 ${escapeHtml(data.user.displayName || 'AURA STUDIO')}. CORE ENGINE POWERED BY SITEFORGE.</footer>
  <div id="videoModal" class="video-modal"><button id="closeModal" class="modal-close interactive-item" type="button">CLOSE_STREAM [X]</button><div class="modal-frame"><video id="modalVideo" controls loop playsinline></video></div></div>
  <script>
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');
    let cursorX = innerWidth / 2;
    let cursorY = innerHeight / 2;
    let dotX = cursorX;
    let dotY = cursorY;
    let mouseUnitX = .5;
    let mouseUnitY = .5;
    let hoverOffset = { x: 0, y: 0 };
    document.addEventListener('mousemove', function(event) {
      dotX = event.clientX;
      dotY = event.clientY;
      mouseUnitX = event.clientX / innerWidth;
      mouseUnitY = 1 - event.clientY / innerHeight;
      document.documentElement.style.setProperty('--mouse-x', event.clientX + 'px');
      document.documentElement.style.setProperty('--mouse-y', event.clientY + 'px');
      if (cursorDot) cursorDot.style.transform = 'translate3d(' + dotX + 'px,' + dotY + 'px,0) translate(-50%,-50%)';
    });
    function cursorLoop() {
      cursorX += (dotX - cursorX) * .18;
      cursorY += (dotY - cursorY) * .18;
      if (cursor) cursor.style.transform = 'translate3d(' + cursorX + 'px,' + cursorY + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(cursorLoop);
    }
    cursorLoop();
    document.querySelectorAll('.interactive-item').forEach(function(el) {
      el.addEventListener('mouseenter', function() { cursor && cursor.classList.add('active'); });
      el.addEventListener('mouseleave', function() { cursor && cursor.classList.remove('active'); });
    });
    document.querySelectorAll('.project-card').forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        const index = Number(card.getAttribute('data-card-index') || 0);
        hoverOffset = index % 3 === 0 ? { x: -.5, y: -.1 } : index % 3 === 1 ? { x: 0, y: -.4 } : { x: .5, y: -.1 };
      });
      card.addEventListener('mouseleave', function() { hoverOffset = { x: 0, y: 0 }; });
    });
    const revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('aura-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .18 });
    document.querySelectorAll('.aura-reveal').forEach(function(el) { revealObserver.observe(el); });
    const scrambleChars = '!<>-_\\\\/[]{}+*^?#________';
    document.querySelectorAll('.scramble-trigger').forEach(function(element) {
      const originalText = element.getAttribute('data-text') || element.textContent || '';
      let frameId = 0;
      element.addEventListener('mouseenter', function() {
        cancelAnimationFrame(frameId);
        let frame = 0;
        const max = Math.max(12, originalText.length * 2);
        function tick() {
          element.textContent = originalText.split('').map(function(char, index) {
            return frame > index * 2 ? char : char === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }).join('');
          frame += 1;
          if (frame <= max) frameId = requestAnimationFrame(tick);
          else element.textContent = originalText;
        }
        tick();
      });
    });
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const closeModal = document.getElementById('closeModal');
    document.querySelectorAll('.video-trigger').forEach(function(trigger) {
      trigger.addEventListener('click', function() {
        modalVideo.src = trigger.getAttribute('data-video-url') || '';
        modalVideo.poster = trigger.getAttribute('data-poster') || '';
        videoModal.classList.add('open');
        modalVideo.play().catch(function() {});
      });
    });
    closeModal.addEventListener('click', function() {
      videoModal.classList.remove('open');
      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.removeAttribute('src');
    });
    const canvas = document.getElementById('auraCanvas');
    const context = canvas.getContext('2d');
    const particles = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 1.8 + .35,
      vx: (Math.random() - .5) * .0009,
      vy: (Math.random() - .5) * .0009
    }));
    let frame = 0;
    function resize(){ canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; }
    function draw(){
      frame += .016; context.clearRect(0,0,canvas.width,canvas.height); context.save(); context.scale(devicePixelRatio,devicePixelRatio);
      const progress = document.documentElement.scrollHeight > innerHeight ? scrollY / (document.documentElement.scrollHeight - innerHeight) : 0;
      const flowX = hoverOffset.x * .0018 + (mouseUnitX - .5) * .0008;
      const flowY = hoverOffset.y * .0018 + (.5 - mouseUnitY) * .0008;
      context.strokeStyle = 'rgba(73,197,182,.12)';
      for (let i=0;i<22;i++){ const y = innerHeight*.68+i*18; context.beginPath(); context.moveTo(innerWidth * -.2,y); context.lineTo(innerWidth * 1.2,y+Math.sin(frame*1.6+i)*26); context.stroke(); }
      const points = particles.map((p) => {
        p.x += p.vx / p.z + flowX;
        p.y += p.vy / p.z + flowY + Math.sin(frame * .35 + p.z) * .0002;
        if (p.x < -.04) p.x = 1.04;
        if (p.x > 1.04) p.x = -.04;
        if (p.y < -.04) p.y = 1.04;
        if (p.y > 1.04) p.y = -.04;
        const depth = 1 / p.z;
        return {
          x: p.x * innerWidth,
          y: p.y * innerHeight + Math.sin(frame * .6 + p.x * 8) * 10 * depth + progress * 28 * depth,
          size: Math.max(.8, 2.2 * depth),
          alpha: Math.min(.72, .18 + depth * .42)
        };
      });
      points.forEach((point, index) => {
        for (let j = index + 1; j < points.length; j++) {
          const next = points[j];
          const dx = point.x - next.x;
          const dy = point.y - next.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 88) {
            context.globalAlpha = (1 - distance / 88) * .16;
            context.strokeStyle = index % 5 === 0 ? 'rgba(255,147,152,.45)' : 'rgba(73,197,182,.55)';
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(next.x, next.y);
            context.stroke();
          }
        }
      });
      points.forEach((point, index) => {
        context.globalAlpha = point.alpha;
        context.fillStyle = index % 7 === 0 ? 'rgba(255,147,152,.85)' : 'rgba(73,197,182,.85)';
        context.beginPath();
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      const glowX = innerWidth * (.58 + Math.sin(progress * Math.PI * 2) * .14) + hoverOffset.x * 70;
      const glowY = innerHeight * (.48 + Math.cos(progress * Math.PI * 1.4) * .1) + hoverOffset.y * 70;
      const glowRadius = Math.min(innerWidth, innerHeight) * .42;
      const gradient = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
      gradient.addColorStop(0, 'rgba(73,197,182,.2)');
      gradient.addColorStop(.55, 'rgba(255,147,152,.08)');
      gradient.addColorStop(1, 'transparent');
      context.fillStyle = gradient;
      context.fillRect(0, 0, innerWidth, innerHeight);
      context.restore(); requestAnimationFrame(draw);
    }
    resize(); addEventListener('resize', resize); draw();
  </script>
</body>
</html>`;
}

function renderJakartaHtml(data: SiteData) {
  const projects = sortByOrder(data.projects).filter((project) => project.status !== 'archived');
  const skills = sortByOrder(data.skills).filter((skill) => skill.name.trim());
  const experiences = sortByOrder(data.experiences).filter((experience) => experience.position || experience.company);
  const awards = sortByOrder(data.awards ?? []).filter((award) => award.title.trim());
  const videos = sortByOrder(data.videos ?? [])
    .filter((video) => video.videoUrl.trim())
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder);
  const socials = sortByOrder(data.socialLinks);
  const heroImage = (data.config.heroImages ?? []).filter(Boolean)[0] || data.user.avatarUrl || 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=1600&q=80';
  const featuredProject = projects.find((project) => project.isFeatured) || projects[0];
  const title = data.config.seoTitle || `${data.user.displayName || data.user.username} - Jakarta Portfolio`;
  const description = data.config.seoDescription || data.user.bio || 'Built with SiteForge';
  const layoutClass = data.config.layout === 'list' ? 'list' : '';

  const projectImageFor = (project: Project) => project.coverImage || project.images?.find((image) => image.imageUrl)?.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
  const projectCards = projects.map((project, index) => {
    const featured = data.config.layout !== 'list' && project.isFeatured;
    const image = projectImageFor(project);
    return `
      <article class="reveal project-card ${featured ? 'featured' : ''}" style="transition-delay:${(index % 3) * 90}ms">
        <button class="media image-preview-trigger ${featured ? 'wide' : ''}" type="button" data-preview-src="${escapeHtml(image)}" data-preview-alt="${escapeHtml(project.title)}">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)}">
          <span class="media-fade"></span>
          ${project.isFeatured ? '<b class="featured-pill">Featured</b>' : ''}
        </button>
        <div class="card-body">
          <div class="card-head"><div><p>${escapeHtml(project.category || 'Project')}</p><h3>${escapeHtml(project.title || 'Untitled Project')}</h3></div><span>#${String(index + 1).padStart(2, '0')}</span></div>
          ${project.description ? `<p class="copy">${escapeHtml(project.description)}</p>` : ''}
          ${project.role || project.tools || project.startDate ? `<div class="tags">${project.role ? `<span>${escapeHtml(project.role)}</span>` : ''}${project.tools ? `<span>${escapeHtml(project.tools)}</span>` : ''}${project.startDate ? `<span>${escapeHtml(project.startDate)}${project.endDate ? ` - ${escapeHtml(project.endDate)}` : ''}</span>` : ''}</div>` : ''}
        </div>
      </article>`;
  }).join('');

  const videoCards = videos.map((video, index) => `
    <article class="reveal video-card ${video.isFeatured ? 'featured' : ''}" style="transition-delay:${(index % 3) * 90}ms">
      <div class="video-frame ${video.isFeatured ? 'wide' : ''}">
        ${isDirectVideoUrl(video.videoUrl)
          ? `<video src="${escapeHtml(video.videoUrl)}" ${video.thumbnailUrl ? `poster="${escapeHtml(video.thumbnailUrl)}"` : ''} controls></video>`
          : `<a href="${escapeHtml(video.videoUrl)}" target="_blank" rel="noreferrer">${video.thumbnailUrl ? `<img src="${escapeHtml(video.thumbnailUrl)}" alt="${escapeHtml(video.title)}">` : '<span class="empty-video">Open Video</span>'}<i>Play</i></a>`}
        ${video.isFeatured ? '<b class="featured-pill light">Featured Demo</b>' : ''}
      </div>
      <div class="card-body"><p>${escapeHtml(video.platform)}</p><h3>${escapeHtml(video.title || 'Video Showcase')}</h3>${video.description ? `<p class="copy">${escapeHtml(video.description)}</p>` : ''}</div>
    </article>`).join('');

  const skillGrid = skills.slice(0, 10).map((skill) => `
    <div class="skill-cell">
      <div class="skill-topline"><span>* ${escapeHtml(skill.name)}</span><b>${skill.proficiency}/5</b></div>
      ${skill.category ? `<p>${escapeHtml(skill.category)}</p>` : ''}
      <i class="skill-bar"><em style="width:${skill.proficiency * 20}%"></em></i>
      <small>${Array.from({ length: 5 }, (_, index) => `<u class="${index < skill.proficiency ? 'on' : ''}"></u>`).join('')}</small>
    </div>`).join('');
  const experienceCards = experiences.slice(0, 4).map((experience) => `
    <article class="experience-card">
      <div><h3>${escapeHtml(experience.position)}</h3><p>${escapeHtml(experience.company)}</p></div>
      <span>${escapeHtml(experience.startDate)}${experience.isCurrent ? ' - Now' : experience.endDate ? ` - ${escapeHtml(experience.endDate)}` : ''}</span>
      ${experience.description ? `<small>${escapeHtmlWithBreaks(experience.description)}</small>` : ''}
    </article>`).join('');
  const awardCards = awards.map((award, index) => `
    <article class="reveal award-card" style="transition-delay:${(index % 2) * 90}ms">
      <div class="stars">*****</div>
      <h3>${escapeHtml(award.title)}</h3>
      <p>${escapeHtml(award.issuer)}${award.date ? ` / ${escapeHtml(award.date)}` : ''}</p>
      ${award.description ? `<small>${escapeHtml(award.description)}</small>` : ''}
    </article>`).join('');
  const metricCards = [
    { label: 'Projects', value: projects.length, tone: 'indigo' },
    { label: 'Skills', value: skills.length, tone: 'violet' },
    { label: 'Videos', value: videos.length, tone: 'blue' },
    { label: 'Honors', value: awards.length, tone: 'amber' }
  ].map((metric) => `<button class="metric-card" type="button" data-step="${metric.label === 'Projects' ? 2 : metric.label === 'Skills' ? 1 : metric.label === 'Videos' ? 3 : 4}"><i class="${metric.tone}"></i><b>${metric.value}</b><span>${metric.label}</span></button>`).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#fafafc;color:#334155;font-family:"Plus Jakarta Sans",system-ui,sans-serif;overflow-x:hidden}a{color:inherit;text-decoration:none}button{font:inherit}img,video{max-width:100%;display:block}.container{width:min(1280px,100%);margin:auto;padding:0 32px}.reveal{opacity:0;transform:translateY(20px);transition:opacity 1.2s cubic-bezier(.16,1,.3,1),transform 1.2s cubic-bezier(.16,1,.3,1)}.active{opacity:1;transform:translateY(0)}
    header{position:sticky;top:0;z-index:50;border-bottom:1px solid #f1f5f9;background:rgba(255,255,255,.76);backdrop-filter:blur(16px);transition:background .3s,border-color .3s,box-shadow .3s}header.scrolled{border-bottom-color:#e2e8f0;background:rgba(255,255,255,.88);box-shadow:0 16px 40px rgba(15,23,42,.08)}.nav{height:80px;display:flex;align-items:center;justify-content:space-between;transition:height .3s}.scrolled .nav{height:64px}.brand{display:flex;align-items:center;gap:10px;color:#0b0f19;font-size:18px;font-weight:900}.brand-icon{width:36px;height:36px;border-radius:12px;background:#4f46e5;color:white;display:grid;place-items:center;overflow:hidden}.brand-icon img{width:100%;height:100%;object-fit:cover}.links{display:flex;gap:32px;color:#64748b;font-size:14px;font-weight:700}.links a{position:relative;display:inline-flex;align-items:center;padding:10px 0;transition:color .25s}.links a:before{content:"";width:6px;height:6px;margin-right:7px;border-radius:999px;background:#4f46e5;box-shadow:0 0 14px rgba(79,70,229,.42);opacity:0;transform:scale(.65);transition:opacity .25s,transform .25s}.links a:after{content:"";position:absolute;left:0;right:0;bottom:2px;height:2px;border-radius:999px;background:#4f46e5;transform:scaleX(0);transform-origin:left;transition:transform .28s}.links a:hover,.links a.active{color:#4f46e5}.links a.active:before{opacity:1;transform:scale(1)}.links a.active:after{transform:scaleX(1)}.nav-actions{display:flex;gap:12px;align-items:center}.login{color:#475569;font-size:14px;font-weight:800}.button{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:12px;background:#0b0f19;color:white;padding:12px 20px;font-size:12px;font-weight:900}.button.primary{background:#4f46e5}.button.ghost{border:1px solid #e2e8f0;background:white;color:#334155}
    .hero{position:relative;padding:80px 0 112px;text-align:center}.eyebrow{color:#4f46e5;font-size:12px;font-weight:900;letter-spacing:.24em;text-transform:uppercase}.hero h1{max-width:900px;margin:16px auto 0;color:#0b0f19;font-size:clamp(40px,6vw,64px);line-height:1.08;letter-spacing:-.04em}.hero-copy{max-width:680px;margin:24px auto 0;color:#94a3b8;font-size:16px;line-height:1.8}.hero-actions{margin-top:40px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
    .demo{position:relative;max-width:1024px;margin:80px auto 0;aspect-ratio:16/9;overflow:hidden;border:1px solid rgba(226,232,240,.85);border-radius:32px;background:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,.04);text-align:left}.demo>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55;filter:saturate(1.1) contrast(1.05)}.demo:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.58),rgba(255,255,255,.28) 42%,rgba(255,255,255,.68)),radial-gradient(circle at 20% 80%,rgba(99,102,241,.18),transparent 36%)}.demo-inner{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;padding:32px}.demo-status{display:flex;flex-wrap:wrap;gap:24px;color:#94a3b8;font-size:11px;font-weight:900;letter-spacing:.08em}.demo-status span{display:flex;gap:8px;align-items:center}.demo-status i{width:8px;height:8px;border-radius:50%;background:#cbd5e1}.demo-status span:first-child i{background:#6366f1;animation:pulse 1.4s infinite}.demo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:end}.dark-card,.num-card,.status-card{border-radius:24px;padding:24px;box-shadow:0 15px 30px rgba(0,0,0,.03);transition:transform .25s}.dark-card:hover,.num-card:hover,.status-card:hover{transform:translateY(-4px)}.dark-card{background:#0b0f19;color:white}.dark-card span{color:#ede9fe;font-size:10px;font-weight:900;letter-spacing:.16em}.dark-card h4{font-size:16px}.num-card{position:relative;overflow:hidden;background:white;text-align:center}.num-card span,.status-card h4{color:#94a3b8;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.num-card b{display:block;margin:20px 0 28px;color:#0b0f19;font-size:34px;line-height:1.1}.num-card small{position:absolute;left:0;right:0;bottom:0;background:#3b82f6;color:white;padding:8px 14px;font-weight:800}.status-card{background:white}.status-card p{display:flex;justify-content:space-between;border-top:1px solid #f8fafc;margin:0;padding:10px 0;color:#334155;font-size:12px;font-weight:800}.status-card p span:last-child{color:#94a3b8}
    section{padding:96px 0}.white{background:white;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9}.section-title{text-align:center;max-width:760px;margin:0 auto 48px}.section-title h2{margin:12px 0;color:#0b0f19;font-size:40px;line-height:1.12;letter-spacing:-.035em}.section-title p{color:#94a3b8;line-height:1.75}.skill-grid{display:grid;grid-template-columns:repeat(5,1fr);overflow:hidden;border:1px solid #f1f5f9;border-radius:24px;background:#f8fafc}.skill-cell{border-right:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;background:white;padding:28px 24px;transition:background .25s}.skill-cell:hover{background:#f8fafc}.skill-topline{display:flex;align-items:center;justify-content:space-between;gap:12px}.skill-topline span{min-width:0;color:#334155;font-size:14px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.skill-topline b{flex:none;border-radius:999px;background:#eef2ff;color:#4f46e5;padding:5px 10px;font-size:10px;font-weight:900}.skill-cell p{margin:10px 0 0;color:#94a3b8;font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.skill-bar{display:block;height:6px;border-radius:999px;background:#f1f5f9;overflow:hidden;margin-top:20px}.skill-bar em{display:block;height:100%;border-radius:999px;background:#4f46e5}.skill-cell small{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:12px}.skill-cell u{display:block;height:6px;border-radius:999px;background:#f1f5f9;text-decoration:none}.skill-cell u.on{background:#6366f1}
    .project-grid,.video-grid,.award-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px}.project-grid.list{grid-template-columns:1fr}.project-card,.video-card,.award-card{overflow:hidden;border:1px solid #f1f5f9;border-radius:32px;background:white;box-shadow:0 1px 2px rgba(15,23,42,.03);transition:transform .45s,box-shadow .45s}.project-card:hover,.video-card:hover{transform:translateY(-4px);box-shadow:0 24px 60px rgba(15,23,42,.08)}.project-card.featured,.video-card.featured{grid-column:span 2}.media,.video-frame{position:relative;display:block;width:100%;aspect-ratio:4/3;border:0;padding:0;overflow:hidden;background:#f8fafc;cursor:pointer}.media.wide,.video-frame.wide{aspect-ratio:21/9}.media img,.video-frame img,.video-frame video{width:100%;height:100%;object-fit:cover;opacity:.9;transition:transform .7s}.project-card:hover img,.video-card:hover img{transform:scale(1.05)}.media-fade{position:absolute;inset:0;background:linear-gradient(to top,white,transparent);opacity:.7}.featured-pill{position:absolute;left:20px;top:20px;border-radius:999px;background:#4f46e5;color:white;padding:7px 12px;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.featured-pill.light{background:white;color:#4f46e5}.video-frame a{display:block;position:relative;height:100%;background:#020617}.video-frame a i{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:white;color:#4f46e5;font-size:12px;font-weight:900;font-style:normal}.card-body{padding:28px}.card-head{display:flex;justify-content:space-between;gap:16px}.card-head p,.card-body>p:first-child{margin:0;color:#94a3b8;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.card-head h3,.card-body h3,.award-card h3{margin:8px 0 0;color:#0b0f19;font-size:26px;line-height:1.18}.card-head>span{height:max-content;border:1px solid #f1f5f9;border-radius:999px;background:#f8fafc;padding:7px 12px;color:#64748b;font-size:12px;font-weight:800}.copy{color:#64748b!important;font-size:14px!important;font-weight:500!important;letter-spacing:0!important;text-transform:none!important;line-height:1.75}.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.tags span{border-radius:999px;background:#eef2ff;color:#4f46e5;padding:7px 12px;font-size:12px;font-weight:800}.tags span:nth-child(n+2){background:#f8fafc;color:#64748b}
    .process{background:#0b0f19;color:white}.process-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:40px}.process h2{font-size:42px;line-height:1.1}.step-btn{width:100%;display:flex;justify-content:space-between;align-items:center;border:0;border-left:2px solid transparent;border-radius:14px;background:transparent;color:#94a3b8;padding:13px 16px;text-align:left;font-weight:800}.step-btn.active-step{border-left-color:#818cf8;background:rgba(255,255,255,.05);color:white}.panel{border:1px solid rgba(255,255,255,.1);border-radius:32px;background:rgba(255,255,255,.03);padding:24px}.metric-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.metric-card{border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.05);color:white;padding:20px;text-align:left;transition:transform .25s,background .25s}.metric-card:hover{transform:translateY(-2px);background:rgba(255,255,255,.08)}.metric-card i{display:block;width:32px;height:8px;border-radius:999px;margin-bottom:18px}.metric-card i.indigo{background:#6366f1}.metric-card i.violet{background:#8b5cf6}.metric-card i.blue{background:#3b82f6}.metric-card i.amber{background:#f59e0b}.metric-card b{display:block;font-size:30px}.metric-card span{display:block;margin-top:5px;color:#94a3b8;font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.step-copy{margin-top:24px;border-radius:22px;background:white;color:#0b0f19;padding:24px}.step-copy p{color:#64748b;line-height:1.7}.experience-card{margin-top:16px;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:rgba(255,255,255,.04);padding:20px}.experience-card div{display:flex;justify-content:space-between;gap:16px}.experience-card h3{margin:0}.experience-card p{margin:4px 0 0;color:#a5b4fc;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.experience-card span,.experience-card small{color:#94a3b8;font-size:13px;line-height:1.7}
    .award-card{padding:32px}.stars{color:#f59e0b;letter-spacing:.1em}.award-card p{color:#4f46e5;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.award-card small{display:block;color:#64748b;line-height:1.75}.contact-card{overflow:hidden;border-radius:32px;background:#0b0f19;color:white;padding:48px}.contact-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:40px;align-items:end}.contact-card h2{margin:14px 0 0;font-size:42px;line-height:1.1}.contact-card p{color:#94a3b8;line-height:1.75}.contact-actions{display:flex;flex-direction:column;align-items:flex-end;gap:12px}.socials{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.socials a{border:1px solid rgba(255,255,255,.12);border-radius:999px;color:#cbd5e1;padding:9px 14px;font-size:12px;font-weight:800}.footer{background:#0b0f19;border-top:1px solid #111827;color:#64748b;padding:64px 0}.footer .container{display:flex;justify-content:space-between;align-items:center;gap:24px}.modal{position:fixed;inset:0;z-index:90;display:none;align-items:center;justify-content:center;background:rgba(2,6,23,.9);backdrop-filter:blur(12px);padding:16px}.modal.open{display:flex}.modal img{max-width:92vw;max-height:86vh;object-fit:contain;border-radius:24px}.modal button{position:absolute;right:24px;top:24px;border:0;border-radius:999px;background:white;color:#0b0f19;padding:10px 16px;font-size:12px;font-weight:900}
    @keyframes pulse{50%{opacity:.45}}@media(max-width:900px){.links{display:none}.hero{padding-top:56px}.demo{aspect-ratio:auto;min-height:720px}.demo-grid,.project-grid,.video-grid,.award-grid,.process-grid,.contact-grid{grid-template-columns:1fr}.project-card.featured,.video-card.featured{grid-column:auto}.media.wide,.video-frame.wide{aspect-ratio:4/3}.skill-grid{grid-template-columns:repeat(2,1fr)}.contact-actions{align-items:flex-start}.socials{justify-content:flex-start}.footer .container{flex-direction:column;text-align:center}}
  </style>
</head>
<body>
  <header id="siteHeader"><div class="container nav"><a class="brand" href="#home"><span class="brand-icon">${data.user.avatarUrl ? `<img src="${escapeHtml(data.user.avatarUrl)}" alt="${escapeHtml(data.user.displayName)}">` : escapeHtml((data.user.displayName || data.user.username || 'S').slice(0, 1).toUpperCase())}</span>${escapeHtml(data.user.displayName || data.user.username || 'creator')}</a><nav class="links"><a href="#home" data-nav-section="home" class="active">Home</a><a href="#projects" data-nav-section="projects">Work</a>${data.config.showVideos && videos.length ? '<a href="#videos" data-nav-section="videos">Videos</a>' : ''}${data.config.showSkills && skills.length ? '<a href="#skills" data-nav-section="skills">Skills</a>' : ''}<a href="#contact" data-nav-section="contact">Contact</a></nav><div class="nav-actions">${data.user.email ? `<a class="login" href="mailto:${escapeHtml(data.user.email)}">Contact</a>` : ''}<a class="button" href="#projects">Get Started</a></div></div></header>
  <main>
    <section id="home" class="hero"><div class="container"><div class="reveal"><p class="eyebrow">${escapeHtml(data.user.title || 'Personal Portfolio')}</p><h1>${escapeHtml(data.user.bio || 'Build a portfolio that feels polished and alive')}</h1><p class="hero-copy">${escapeHtml(data.user.fullBio || 'Use a clean SaaS-inspired system to present your identity, selected projects, videos, skills, awards, and collaboration channels.')}</p><div class="hero-actions"><a class="button ghost" href="${videos.length ? '#videos' : '#projects'}">Play Demo</a><a class="button primary" href="#projects">Explore Work</a></div></div>
      <div class="demo reveal"><img src="${escapeHtml(heroImage)}" alt="${escapeHtml(data.user.displayName || 'Portfolio space')}"><div class="demo-inner"><div class="demo-status"><span><i></i>PROFILE READY</span><span><i></i>PROJECT ADDED</span><span><i></i>LIVE PREVIEW</span><span><i></i>ONLINE LINK</span></div><div class="demo-grid"><div class="dark-card"><span>Selected Identity</span><h4>${escapeHtml(data.user.displayName || 'Your Name')} · ${escapeHtml(data.user.location || 'Live Portfolio')}</h4></div><div class="num-card"><span>Now Featuring</span><b>${featuredProject ? 'Featured Work' : 'Portfolio Ready'}</b><small>${escapeHtml(featuredProject?.title || 'Add your first project')}</small></div><div class="status-card"><h4>Portfolio Status</h4><p><span>${projects.length} Projects</span><span>Work</span></p><p><span>${skills.length} Skills</span><span>Stack</span></p><p><span>${videos.length} Videos</span><span>Media</span></p><p><span>${awards.length} Honors</span><span>Proof</span></p></div></div></div></div>
    </div></section>
    ${data.config.showSkills && skills.length ? `<section id="skills" class="white"><div class="container"><p class="eyebrow" style="text-align:center;margin-bottom:40px;color:#94a3b8">Tools and capabilities</p><div class="skill-grid">${skillGrid}</div></div></section>` : ''}
    ${projects.length ? `<section id="projects"><div class="container"><div class="section-title reveal"><p class="eyebrow">Selected Work</p><h2>A polished system for your best projects</h2><p>Project images and gallery assets stay front and center, with featured work promoted into a wider card.</p></div><div class="project-grid ${layoutClass}">${projectCards}</div></div></section>` : ''}
    ${data.config.showVideos && videos.length ? `<section id="videos" class="white"><div class="container"><div class="section-title reveal"><p class="eyebrow">Video Proof</p><h2>Demos, reels, and walkthroughs</h2><p>If a video is marked as featured, it expands into the main demo slot.</p></div><div class="video-grid">${videoCards}</div></div></section>` : ''}
    ${data.config.showExperience && experiences.length ? `<section class="process"><div class="container process-grid"><div class="reveal"><p class="eyebrow" style="color:#a5b4fc">How It Works</p><h2>Experience becomes a guided story</h2><div style="margin-top:32px"><button class="step-btn active-step" data-step="1">01. Profile <span>></span></button><button class="step-btn" data-step="2">02. Projects <span>></span></button><button class="step-btn" data-step="3">03. Live Preview <span>></span></button><button class="step-btn" data-step="4">04. Publish <span>></span></button></div></div><div class="panel reveal"><div class="metric-grid">${metricCards}</div><div class="step-copy"><p class="eyebrow">Current Step</p><h3 id="stepTitle">Profile</h3><p id="stepDesc">Start from your identity, location, avatar, and a clear portfolio positioning statement.</p></div>${experienceCards}</div></div></section>` : ''}
    ${data.config.showAwards && awards.length ? `<section id="awards"><div class="container"><div class="section-title reveal"><p class="eyebrow">Recognition</p><h2>Honors and proof points</h2></div><div class="award-grid">${awardCards}</div></div></section>` : ''}
    <section id="contact" class="white"><div class="container"><div class="contact-card reveal"><div class="contact-grid"><div><p class="eyebrow" style="color:#a5b4fc">Contact</p><h2>Ready to start a new conversation?</h2><p>Portfolio reviews, project collaboration, role opportunities, and creative conversations can all start here.</p></div><div class="contact-actions">${data.user.email ? `<a class="button primary" href="mailto:${escapeHtml(data.user.email)}">Contact Me</a>` : ''}${data.user.location ? `<p>${escapeHtml(data.user.location)}</p>` : ''}<div class="socials">${socials.map((social) => `<a href="${escapeHtml(social.url)}">${escapeHtml(social.platform)}</a>`).join('')}</div></div></div></div></div></section>
  </main>
  <footer class="footer"><div class="container"><div class="brand"><span class="brand-icon">${escapeHtml((data.user.displayName || data.user.username || 'S').slice(0, 1).toUpperCase())}</span>${escapeHtml(data.user.displayName || 'creator')}</div><p>Copyright 2026 - ${escapeHtml(data.user.displayName || 'Portfolio')}. Built with SiteForge.</p></div></footer>
  <div class="modal" id="imageModal"><button type="button" id="closeImage">Close</button><img id="modalImg" src="" alt=""></div>
  <script>
    const observer = new IntersectionObserver(function(entries, obs){ entries.forEach(function(entry){ if(entry.isIntersecting){ entry.target.classList.add('active'); obs.unobserve(entry.target); } }); }, { threshold:.1, rootMargin:'0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ observer.observe(el); });
    const siteHeader = document.getElementById('siteHeader');
    const navLinks = Array.from(document.querySelectorAll('[data-nav-section]'));
    const navSections = navLinks.map(function(link){ return document.getElementById(link.dataset.navSection); }).filter(Boolean);
    function updateHeaderState(){ siteHeader.classList.toggle('scrolled', window.scrollY > 20); }
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    const navObserver = new IntersectionObserver(function(entries){
      const visible = entries.filter(function(entry){ return entry.isIntersecting; }).sort(function(a, b){ return b.intersectionRatio - a.intersectionRatio; })[0];
      if (!visible || !visible.target.id) return;
      navLinks.forEach(function(link){ link.classList.toggle('active', link.dataset.navSection === visible.target.id); });
    }, { threshold:[.18,.35,.6], rootMargin:'-96px 0px -45% 0px' });
    navSections.forEach(function(section){ navObserver.observe(section); });
    const steps = {1:['Profile','Start from your identity, location, avatar, and a clear portfolio positioning statement.'],2:['Projects','Add selected works, rich covers, galleries, roles, tools, and measurable outcomes.'],3:['Live Preview','Switch layouts and templates while the right side updates immediately.'],4:['Publish','Generate an online access link that keeps the same motion, style, and responsive behavior.']};
    document.querySelectorAll('.step-btn').forEach(function(btn){ btn.addEventListener('click', function(){ const step=steps[btn.dataset.step]; document.querySelectorAll('.step-btn').forEach(function(item){ item.classList.remove('active-step'); }); btn.classList.add('active-step'); document.getElementById('stepTitle').textContent=step[0]; document.getElementById('stepDesc').textContent=step[1]; if(btn.dataset.step==='4' && 'speechSynthesis' in window){ speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance('Portfolio is ready to publish.')); } }); });
    document.querySelectorAll('.metric-card').forEach(function(card){ card.addEventListener('click', function(){ const step = card.dataset.step || '1'; const btn = document.querySelector('.step-btn[data-step="' + step + '"]'); if (btn) btn.click(); }); });
    const modal = document.getElementById('imageModal'); const modalImg = document.getElementById('modalImg');
    document.addEventListener('click', function(event){ const trigger = event.target.closest && event.target.closest('.image-preview-trigger'); if(trigger){ modalImg.src = trigger.dataset.previewSrc || ''; modalImg.alt = trigger.dataset.previewAlt || ''; modal.classList.add('open'); } });
    document.getElementById('closeImage').addEventListener('click', function(){ modal.classList.remove('open'); modalImg.removeAttribute('src'); });
    modal.addEventListener('click', function(event){ if(event.target === modal){ modal.classList.remove('open'); modalImg.removeAttribute('src'); } });
  </script>
</body>
</html>`;
}

function renderSolaceHtml(data: SiteData) {
  const projects = sortByOrder(data.projects).filter((project) => project.status !== 'archived');
  const featuredProjects = projects.filter((project) => project.isFeatured);
  const sliderProjects = (featuredProjects.length ? featuredProjects : projects).slice(0, 4);
  const moreProjects = projects;
  const skills = sortByOrder(data.skills).filter((skill) => skill.name.trim());
  const experiences = sortByOrder(data.experiences).filter((experience) => experience.position || experience.company);
  const awards = sortByOrder(data.awards ?? []).filter((award) => award.title.trim());
  const videos = sortByOrder(data.videos ?? [])
    .filter((video) => video.videoUrl.trim())
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder);
  const socials = sortByOrder(data.socialLinks);
  const heroImages = (data.config.heroImages ?? []).filter(Boolean);
  const heroImage = heroImages[0] || data.user.avatarUrl || 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=1600&q=80';
  const title = data.config.seoTitle || `${data.user.displayName || data.user.username} - Solace Portfolio`;
  const description = data.config.seoDescription || data.user.bio || 'Built with SiteForge';
  const slides = sliderProjects.map((project) => ({
    title: project.title || 'Untitled Project',
    category: project.category || 'Portfolio',
    role: project.role || '',
    tools: project.tools || '',
    description: project.description || project.content || '',
    content: project.content || '',
    image: project.coverImage || project.images?.find((image) => image.imageUrl)?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    url: project.projectUrl || '',
    startDate: project.startDate || '',
    endDate: project.endDate || '',
    gallery: (project.images ?? []).filter((image) => image.imageUrl).map((image) => ({ src: image.imageUrl, alt: image.caption || project.title }))
  }));
  const projectRecords = projects.map((project) => ({
    title: project.title || 'Untitled Project',
    category: project.category || 'Portfolio',
    role: project.role || '',
    tools: project.tools || '',
    description: project.description || project.content || '',
    content: project.content || '',
    image: project.coverImage || project.images?.find((image) => image.imageUrl)?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    url: project.projectUrl || '',
    startDate: project.startDate || '',
    endDate: project.endDate || '',
    gallery: (project.images ?? []).filter((image) => image.imageUrl).map((image) => ({ src: image.imageUrl, alt: image.caption || project.title }))
  }));
  const safeSlides = JSON.stringify(slides).replace(/</g, '\\u003c');
  const safeProjectRecords = JSON.stringify(projectRecords).replace(/</g, '\\u003c');

  const heroSkillStrip = skills.length ? `
    <div class="reveal hero-strip">
      <div>${skills.slice(0, 8).map((skill) => `<span><i></i><b>${escapeHtml(skill.name)}</b><small>${skill.proficiency}/5</small></span>`).join('')}</div>
    </div>` : '';

  const sliderSection = slides.length ? `
    <section id="projects" class="section dark">
      <div class="grid program">
        <div class="reveal program-copy">
          <span class="eyebrow">[ Selected Work ]</span>
          <h2>Confidence starts<br><em>with a focused story</em></h2>
          <button id="slideLink" type="button" class="btn neon">View Project</button>
          <div class="program-bottom">
            <p id="slideText">${escapeHtml(slides[0].description)}</p>
            <div class="bars">${slides.map((_, index) => `<button type="button" class="bar" data-slide="${index}" aria-label="Show slide ${index + 1}"><b style="width:${index === 0 ? '100%' : '0%'}"></b></button>`).join('')}</div>
          </div>
        </div>
        <article class="reveal spotlight image-card">
          <button type="button" class="image-preview-button" id="slideImageButton"><img id="slideImg" src="${escapeHtml(slides[0].image)}" alt="${escapeHtml(slides[0].title)}"></button>
          <div class="image-fade"></div>
          <div class="glass float-card">
            <p id="slideCategory">${escapeHtml(slides[0].category)}</p>
            <h3 id="slideTitle">${escapeHtml(slides[0].title)}</h3>
            <small id="slideMeta">${escapeHtml([slides[0].role, slides[0].tools].filter(Boolean).join(' / '))}</small>
          </div>
        </article>
      </div>
    </section>` : '';

  const experienceSection = data.config.showExperience && experiences.length ? `
    <section class="section light">
      <div class="section-title reveal"><span class="eyebrow">[ The Process ]</span><h2>Experience built<br><em>around real outcomes</em></h2></div>
      <div class="process-grid">
        ${experiences.slice(0, 3).map((experience, index) => `
          <article class="reveal spotlight process-card ${index === 0 ? 'primary' : ''}">
            <p>${escapeHtml(experience.startDate)}${experience.isCurrent ? ' - Now' : experience.endDate ? ` - ${escapeHtml(experience.endDate)}` : ''}</p>
            <h3>${escapeHtml(experience.position)}</h3>
            <strong>${escapeHtml(experience.company)}</strong>
            ${experience.description ? `<div>${escapeHtmlWithBreaks(experience.description)}</div>` : ''}
          </article>`).join('')}
      </div>
    </section>` : '';

  const moreProjectsSection = moreProjects.length ? `
    <section class="section light">
      <div class="archive-head reveal"><div><span class="eyebrow">[ Project Archive ]</span><h2>All work at a glance</h2></div><p>A compact index for scanning every project without repeating the featured visual showcase above.</p></div>
      <div class="archive-list">
        ${moreProjects.map((project, index) => `
          <article class="reveal archive-row">
            <button type="button" class="archive-thumb image-preview-button" data-preview-src="${escapeHtml(project.coverImage || project.images?.find((image) => image.imageUrl)?.imageUrl || '')}" data-preview-alt="${escapeHtml(project.title)}">${project.coverImage || project.images?.find((image) => image.imageUrl)?.imageUrl ? `<img src="${escapeHtml(project.coverImage || project.images?.find((image) => image.imageUrl)?.imageUrl || '')}" alt="${escapeHtml(project.title)}">` : ''}</button>
            <div>
              <div class="archive-tags"><span>#${String(index + 1).padStart(2, '0')}</span>${project.isFeatured ? '<b>Featured</b>' : ''}</div>
              <h3>${escapeHtml(project.title || 'Untitled Project')}</h3>
              <p class="category">${escapeHtml(project.category)}</p>
              ${project.description ? `<p class="archive-desc">${escapeHtml(project.description)}</p>` : ''}
            </div>
            <button type="button" class="archive-open" data-archive-index="${index}">Details</button>
          </article>`).join('')}
      </div>
    </section>` : '';

  const videoSection = data.config.showVideos && videos.length ? `
    <section class="section dark">
      <div class="section-title left reveal"><span class="eyebrow neon-text">[ Motion Proof ]</span><h2>Video showcase</h2></div>
      <div class="video-grid">
        ${videos.map((video) => `
          <article class="reveal video-card${video.isFeatured ? ' featured' : ''}">
            <div class="video-frame">
              ${video.isFeatured ? '<b class="video-featured-badge">Featured Reel</b>' : ''}
              ${isDirectVideoUrl(video.videoUrl)
                ? `<video src="${escapeHtml(video.videoUrl)}" ${video.thumbnailUrl ? `poster="${escapeHtml(video.thumbnailUrl)}"` : ''} controls></video>`
                : `<a href="${escapeHtml(video.videoUrl)}">${video.thumbnailUrl ? `<img src="${escapeHtml(video.thumbnailUrl)}" alt="${escapeHtml(video.title)}">` : ''}<span>▶</span></a>`}
            </div>
            <p>${escapeHtml(video.platform)}</p>
            <h3>${escapeHtml(video.title)}</h3>
            ${video.description ? `<small>${escapeHtml(video.description)}</small>` : ''}
          </article>`).join('')}
      </div>
    </section>` : '';

  const skillsAwardsSection = (data.config.showSkills && skills.length) || (data.config.showAwards && awards.length) ? `
    <section id="skills" class="section light">
      <div class="split">
        ${data.config.showSkills && skills.length ? `
          <div class="reveal panel">
            <span class="eyebrow">[ Skill Stack ]</span>
            ${skills.map((skill) => `<div class="skill-row"><p><b>${escapeHtml(skill.name)}</b><span>${skill.proficiency}/5</span></p><i><b style="width:${skill.proficiency * 20}%"></b></i></div>`).join('')}
          </div>` : ''}
        ${data.config.showAwards && awards.length ? `
          <div class="reveal panel dark-panel">
            <span class="eyebrow neon-text">[ Honors ]</span>
            ${awards.map((award) => `<article class="award"><p>★ ${escapeHtml(award.date || award.issuer)}</p><h3>${escapeHtml(award.title)}</h3>${award.description ? `<small>${escapeHtml(award.description)}</small>` : ''}</article>`).join('')}
          </div>` : ''}
      </div>
    </section>` : '';

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box} html{scroll-behavior:smooth} body{margin:0;background:#01110d;color:white;font-family:Inter,system-ui,sans-serif} a{color:inherit;text-decoration:none} img,video{max-width:100%;display:block}
    body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.055;background-image:radial-gradient(rgba(255,255,255,.42) 1px,transparent 1px);background-size:4px 4px;mix-blend-mode:screen}
    .cursor{position:fixed;left:0;top:0;z-index:80;width:32px;height:32px;border:1px solid rgba(255,255,255,.32);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);transition:width .24s,height .24s,border-color .24s,background .24s}.cursor:after{content:"";position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;background:#00f294;transform:translate(-50%,-50%)}.cursor.active{width:48px;height:48px;border-color:#00f294;background:rgba(0,242,148,.06)}
    .hero{position:relative;min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;background:#021b13}.hero-bg{position:absolute;inset:0;background:url("${escapeHtml(heroImage)}") center/cover;opacity:.35;filter:blur(1px) brightness(1.08) saturate(.75);transform:scale(1.04)}.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,#01110d,rgba(2,27,19,.75),rgba(2,27,19,.95))}
    .glow{position:absolute;width:520px;height:520px;border-radius:999px;background:radial-gradient(circle,rgba(0,242,148,.12),transparent 68%);filter:blur(72px);pointer-events:none}.g1{left:-130px;top:-130px}.g2{right:-110px;bottom:48px}
    header,.hero-main,.hero-strip{position:relative;z-index:3} header{position:sticky;top:16px;width:calc(100% - 32px);max-width:1280px;margin:16px auto 0;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;border-radius:28px;background:rgba(255,255,255,.78);backdrop-filter:blur(22px);border:1px solid rgba(255,255,255,.58);box-shadow:0 18px 60px rgba(1,17,13,.16)}.brand{font-size:20px;font-weight:800;color:#021b13} nav{display:flex;gap:32px;font-size:12px;font-weight:700;letter-spacing:.28em;color:rgba(2,27,19,.6)} nav a:hover{color:#00b875}.btn{display:inline-flex;align-items:center;gap:12px;border-radius:999px;padding:13px 24px;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;border:1px solid rgba(2,27,19,.15);color:#021b13}.btn:hover{border-color:rgba(0,184,117,.5);background:rgba(0,242,148,.15);color:#021b13}.btn.neon{background:#00f294;color:#021b13;border:0;box-shadow:0 0 22px rgba(0,242,148,.35)}
    .hero-main{width:min(1280px,100%);margin:auto;display:grid;grid-template-columns:7fr 5fr;gap:48px;align-items:center;padding:64px 24px 96px}.tag{margin:0 0 20px;color:#00f294;font-size:12px;font-weight:600;letter-spacing:.42em;text-transform:uppercase}.hero h1{max-width:820px;margin:0;font-size:clamp(48px,5.6vw,72px);font-weight:650;line-height:1.02;letter-spacing:-.035em}.hero h1 .muted-title{display:block;color:rgba(255,255,255,.86);font-weight:600}.hero h1 .highlight-title{display:block;margin-top:16px;color:#bffbe0;font-size:clamp(28px,3.1vw,42px);font-weight:500;line-height:1.35;letter-spacing:0;text-shadow:0 0 28px rgba(0,242,148,.12)}.hero-actions{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-top:36px}.location-pill{border:1px solid rgba(163,227,204,.15);border-radius:999px;background:rgba(163,227,204,.06);padding:13px 16px;color:rgba(163,227,204,.72);font-size:12px;font-weight:700;letter-spacing:.12em}.hero-desc{align-self:center}.hero-card{border-radius:32px;padding:28px;background:linear-gradient(145deg,rgba(3,38,27,.72),rgba(1,17,13,.5));backdrop-filter:blur(22px);border:1px solid rgba(163,227,204,.12);box-shadow:inset 0 1px 1px rgba(255,255,255,.08),0 24px 70px rgba(0,0,0,.28)}.hero-card img{width:64px;height:64px;border-radius:18px;object-fit:cover;margin-bottom:24px;border:1px solid rgba(255,255,255,.14)}.hero-card .card-label{color:#00f294;font-size:11px;font-weight:800;letter-spacing:.32em;text-transform:uppercase}.hero-card p{color:rgba(215,247,234,.76);font-size:14px;line-height:1.8}.hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:28px}.hero-stats span{border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.04);padding:12px;text-align:center}.hero-stats b{display:block;color:white;font-size:18px}.hero-stats small{color:rgba(255,255,255,.45);font-size:10px;letter-spacing:.16em;text-transform:uppercase}.hero-strip{width:min(1280px,100%);margin:0 auto;padding:0 24px 32px}.hero-strip>div{display:flex;flex-wrap:wrap;gap:12px;border-radius:24px;background:rgba(1,17,13,.62);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.08);box-shadow:0 18px 60px rgba(0,0,0,.22);padding:12px}.hero-strip span{display:inline-flex;gap:8px;align-items:center;white-space:nowrap;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.04);padding:8px 16px;color:rgba(163,227,204,.78);font-size:12px}.hero-strip i{width:6px;height:6px;border-radius:50%;background:#00f294;box-shadow:0 0 12px rgba(0,242,148,.65)}.hero-strip small{color:rgba(255,255,255,.35);font-size:10px}
    .section{position:relative;padding:96px 24px}.dark{background:#01110d}.light{background:#f8faf9;color:#021b13}.white{background:white;color:#021b13}.grid,.section-title,.cards,.split,.video-grid{width:min(1280px,100%);margin:auto}.program{display:grid;grid-template-columns:5fr 7fr;gap:48px;align-items:center}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.28em;text-transform:uppercase;color:#637d77}.neon-text{color:#00f294}.program h2,.section-title h2{font-size:clamp(36px,5vw,64px);font-weight:300;line-height:1.05;letter-spacing:-.035em}.program h2 em,.section-title em{font-style:normal;color:#a3e3cc}.program-copy{min-height:420px;display:flex;flex-direction:column;justify-content:space-between}.program-bottom p{min-height:72px;max-width:390px;color:#637d77;font-size:13px;line-height:1.8}.bars{display:flex;gap:8px;max-width:320px}.bar{height:3px;flex:1;border:0;border-radius:999px;background:rgba(255,255,255,.2);padding:0;overflow:hidden}.bar b{display:block;height:100%;background:#00f294;transition:width .45s}
    .spotlight{position:relative;overflow:hidden}.spotlight:before{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:radial-gradient(420px circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(0,242,148,.12),transparent 78%);transition:opacity .3s}.spotlight:hover:before{opacity:1}.image-card{height:550px;border-radius:32px;box-shadow:0 30px 80px rgba(0,0,0,.42)}.image-card>img{height:100%;width:100%;object-fit:cover;opacity:.85;filter:saturate(.9);transition:transform .8s}.image-card:hover>img{transform:scale(1.05)}.image-fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(1,17,13,.8),transparent)}.glass{background:rgba(2,27,19,.5);backdrop-filter:blur(22px);border:1px solid rgba(255,255,255,.09);box-shadow:inset 0 1px 1px rgba(255,255,255,.1),0 28px 70px rgba(0,0,0,.34)}.float-card{position:absolute;right:24px;bottom:24px;width:min(340px,calc(100% - 48px));border-radius:24px;padding:24px}.float-card p{margin:0;color:#00f294;font-size:12px;font-weight:800;letter-spacing:.22em;text-transform:uppercase}.float-card h3{margin:12px 0;font-size:26px}.float-card small{color:rgba(255,255,255,.65);line-height:1.7}
    .image-preview-button{display:block;width:100%;height:100%;border:0;padding:0;background:transparent;color:inherit;cursor:pointer}.image-preview-button img{width:100%;height:100%;object-fit:cover}.image-card .image-preview-button img{opacity:.85;filter:saturate(.9);transition:transform .8s}.image-card:hover .image-preview-button img{transform:scale(1.05)}.modal{position:fixed;inset:0;z-index:90;display:none;align-items:center;justify-content:center;background:rgba(1,17,13,.88);backdrop-filter:blur(22px);padding:16px;cursor:auto!important}.modal *{cursor:auto!important}.modal.open{display:flex}.modal-panel{width:min(1040px,100%);max-height:88vh;overflow:auto;border-radius:32px;padding:32px;background:linear-gradient(145deg,rgba(3,38,27,.94),rgba(1,17,13,.92));border:1px solid rgba(163,227,204,.16);box-shadow:0 30px 100px rgba(0,0,0,.52),inset 0 1px 1px rgba(255,255,255,.08)}.modal-top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.modal-top p{margin:0;color:#00f294;font-size:11px;font-weight:800;letter-spacing:.3em;text-transform:uppercase}.modal-top h3{margin:12px 0 0;color:white;font-size:clamp(30px,5vw,56px);line-height:1}.modal-close{border:1px solid rgba(255,255,255,.12);border-radius:999px;background:transparent;color:#a3e3cc;padding:10px 16px;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.modal-cover{margin-top:24px;max-height:360px;overflow:hidden;border-radius:24px;background:rgba(0,0,0,.3)}.modal-body{display:grid;grid-template-columns:1.2fr .8fr;gap:28px;margin-top:28px}.modal-copy{color:rgba(215,247,234,.78);font-size:14px;line-height:1.8;white-space:pre-line}.modal-meta{border:1px solid rgba(255,255,255,.1);border-radius:24px;background:rgba(255,255,255,.04);padding:20px}.modal-meta p{margin:0 0 20px;color:rgba(163,227,204,.55);font-size:12px;letter-spacing:.2em;text-transform:uppercase}.modal-meta span{display:block;margin-top:8px;color:white;font-size:14px;letter-spacing:0;text-transform:none}.modal-gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:28px}.modal-gallery button{aspect-ratio:1;border-radius:18px;overflow:hidden;border:0;padding:0;background:rgba(0,0,0,.3)}.lightbox{z-index:100;background:rgba(0,0,0,.9)}.lightbox img{max-width:92vw;max-height:86vh;object-fit:contain;border-radius:24px;box-shadow:0 28px 80px rgba(0,0,0,.5)}
    .section-title{text-align:center;margin-bottom:56px}.section-title.left{text-align:left}.process-grid{width:min(1280px,100%);margin:auto;display:grid;grid-template-columns:5fr 7fr;gap:32px}.process-card{min-height:310px;border-radius:32px;padding:32px;background:rgba(236,253,245,.75);border:1px solid #d1fae5}.process-card.primary{background:#021b13;color:white}.process-card p{color:#00f294;font-size:12px;font-weight:800;letter-spacing:.24em;text-transform:uppercase}.process-card h3{margin-top:42px;font-size:32px;font-weight:300}.process-card div{white-space:normal;color:inherit;opacity:.75;font-size:14px;line-height:1.8}
    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}.cards.list{grid-template-columns:1fr}.work-card img{aspect-ratio:1;border-radius:32px;object-fit:cover;filter:brightness(1.1);transition:transform .7s}.work-card:hover img{transform:scale(1.04)}.work-card h3{font-size:22px}.category{font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#637d77}.work-card p:not(.category){font-size:13px;line-height:1.8;color:#637d77}
    .archive-head{width:min(1280px,100%);margin:0 auto 48px;display:flex;justify-content:space-between;align-items:flex-end;gap:24px}.archive-head h2{margin:16px 0 0}.archive-head>p{max-width:380px;color:#637d77;font-size:14px;line-height:1.75}.archive-list{width:min(1280px,100%);margin:auto;display:grid;gap:16px}.archive-row{display:grid;grid-template-columns:80px 1fr auto;align-items:center;gap:18px;border:1px solid #d1fae5;border-radius:24px;background:white;padding:16px;box-shadow:0 10px 28px rgba(15,23,42,.04);transition:.25s ease}.archive-row:hover{transform:translateY(-2px);border-color:#a7f3d0;box-shadow:0 18px 38px rgba(15,23,42,.08)}.archive-thumb{width:80px;height:80px;border-radius:18px;overflow:hidden;background:#ecfdf5}.archive-tags{display:flex;gap:8px;align-items:center;margin-bottom:8px}.archive-tags span{color:#00b875;font-size:10px;font-weight:900;letter-spacing:.22em}.archive-tags b{border-radius:999px;background:rgba(0,242,148,.15);padding:5px 9px;color:#007d55;font-size:10px;letter-spacing:.16em;text-transform:uppercase}.archive-row h3{margin:0;color:#021b13;font-size:22px}.archive-desc{max-width:720px;margin:12px 0 0;color:#637d77;font-size:13px;line-height:1.7}.archive-open{border:1px solid rgba(2,27,19,.1);border-radius:999px;background:white;color:#021b13;padding:10px 18px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.archive-open:hover{border-color:rgba(0,184,117,.5);background:rgba(0,242,148,.15)}
    .video-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:32px}.video-card{border-radius:32px;border:1px solid rgba(255,255,255,.1);background:rgba(2,27,19,.8);padding:16px;box-shadow:0 24px 70px rgba(0,0,0,.32);transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease}.video-card.featured{grid-column:span 2;border-color:rgba(0,242,148,.45);background:linear-gradient(135deg,rgba(0,242,148,.16),rgba(2,27,19,.9) 42%,rgba(1,17,13,.92));box-shadow:0 32px 90px rgba(0,0,0,.42),0 0 42px rgba(0,242,148,.15)}.video-frame{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:24px;background:black}.video-card.featured .video-frame{aspect-ratio:21/9}.video-frame video,.video-frame img{width:100%;height:100%;object-fit:cover}.video-frame span{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.35);font-size:34px;color:#00f294}.video-featured-badge{position:absolute;left:16px;top:16px;z-index:2;border:1px solid rgba(0,242,148,.4);border-radius:999px;background:rgba(1,17,13,.72);backdrop-filter:blur(14px);padding:7px 12px;color:#00f294;font-size:10px;font-weight:900;letter-spacing:.26em;text-transform:uppercase}.video-card p{color:#00f294;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.26em}.video-card h3{font-size:22px}.video-card.featured h3{font-size:32px}.video-card small{display:block;color:rgba(163,227,204,.72);line-height:1.7}.video-card.featured small{max-width:760px;font-size:14px}
    .split{display:grid;grid-template-columns:1fr 1fr;gap:32px}.panel{border-radius:32px;border:1px solid #d1fae5;background:white;padding:32px}.dark-panel{background:#021b13;color:white;border:0;box-shadow:0 24px 70px rgba(2,27,19,.22)}.skill-row{margin-top:24px}.skill-row p{display:flex;justify-content:space-between;font-size:14px}.skill-row i{display:block;height:8px;border-radius:999px;background:#d1fae5;overflow:hidden}.skill-row i b{display:block;height:100%;background:#00f294}.award{border-top:1px solid rgba(255,255,255,.1);padding-top:20px;margin-top:20px}.award p{color:#00f294;font-size:12px;font-weight:800}.award small{color:rgba(163,227,204,.72);line-height:1.7}
    .contact{position:relative;overflow:hidden;background:#01110d;color:white}.contact-grid{position:relative;z-index:3;width:min(1280px,100%);margin:auto;display:grid;grid-template-columns:8fr 4fr;gap:48px;align-items:center}.contact h2{font-size:clamp(42px,6vw,78px);font-weight:300;line-height:1.05}.contact h2 span{color:#00f294}.contact p{color:#637d77;font-size:13px;line-height:1.8}.contact-actions{display:flex;flex-direction:column;align-items:flex-end;gap:16px}.socials{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.socials a{border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:9px 14px;color:rgba(163,227,204,.72);font-size:12px}.socials a:hover{border-color:#00f294;color:#00f294}
    .reveal{opacity:0;transform:translateY(42px);transition:opacity .95s cubic-bezier(.16,1,.3,1),transform .95s cubic-bezier(.16,1,.3,1)}.visible{opacity:1;transform:translateY(0)}
    @media(max-width:900px){.cursor{display:none}.hero-main,.program,.process-grid,.split,.contact-grid{grid-template-columns:1fr}.cards,.video-grid{grid-template-columns:1fr}.video-card.featured{grid-column:auto}.video-card.featured .video-frame{aspect-ratio:16/9}nav{display:none}.hero h1{font-size:48px}.image-card{height:460px}.contact-actions{align-items:flex-start}.socials{justify-content:flex-start}.archive-head{display:block}.archive-row{grid-template-columns:64px 1fr}.archive-thumb{width:64px;height:64px}.archive-open{grid-column:1 / -1}}
    @media(max-width:900px){.modal-body{grid-template-columns:1fr}.modal-gallery{grid-template-columns:repeat(2,1fr)}}
  </style>
</head>
<body>
  <div class="cursor" id="cursor"></div>
  <section id="home" class="hero">
    <div class="hero-bg"></div><div class="glow g1"></div><div class="glow g2"></div>
    <header class="reveal"><a class="brand" href="#home">${escapeHtml(data.user.username || data.user.displayName || 'siteforge')}</a><nav><a href="#home">HOME</a><a href="#projects">WORK</a>${data.config.showSkills && skills.length ? '<a href="#skills">SKILLS</a>' : ''}<a href="#contact">CONTACT</a></nav><a class="btn" href="#contact">CONTACT ME</a></header>
    <main class="hero-main">
      <div class="reveal"><p class="tag">${escapeHtml(data.user.title || 'Creative Portfolio')}</p><h1><span class="muted-title">${escapeHtml(data.user.displayName || 'Your portfolio')}</span><span class="highlight-title">${escapeHtml(data.user.bio || 'Crafting better digital experiences.')}</span></h1><div class="hero-actions"><a class="btn neon" href="#projects">Explore Work →</a>${data.user.location ? `<span class="location-pill">${escapeHtml(data.user.location)}</span>` : ''}</div></div>
      <div class="reveal hero-desc"><div class="hero-card">${data.user.avatarUrl ? `<img src="${escapeHtml(data.user.avatarUrl)}" alt="${escapeHtml(data.user.displayName)}">` : ''}<div class="card-label">Portfolio Signal</div><p>${escapeHtml(data.user.fullBio || 'A refined portfolio template for focused storytelling, selected projects, measurable skills, and polished motion.')}</p><div class="hero-stats"><span><b>${projects.length}</b><small>Works</small></span>${data.config.showSkills ? `<span><b>${skills.length}</b><small>Skills</small></span>` : ''}${data.config.showAwards ? `<span><b>${awards.length}</b><small>Honors</small></span>` : ''}</div></div></div>
    </main>
    ${heroSkillStrip}
  </section>
  ${sliderSection}
  ${experienceSection}
  ${moreProjectsSection}
  ${videoSection}
  ${skillsAwardsSection}
  <section id="contact" class="section contact">
    <div class="glow" style="left:20%;bottom:-220px"></div>
    <div class="contact-grid">
      <div class="reveal"><h2>Invest in the most<br>important <span>story you have.</span></h2><p>Available for selected collaborations, portfolio reviews, product design work, and digital experience projects.</p></div>
      <div class="reveal contact-actions">${data.user.email ? `<a class="btn neon" href="mailto:${escapeHtml(data.user.email)}">Contact Me</a>` : ''}${data.user.location ? `<p>${escapeHtml(data.user.location)}</p>` : ''}<div class="socials">${socials.map((social) => `<a href="${escapeHtml(social.url)}">${socialLabel(social)}</a>`).join('')}</div></div>
    </div>
  </section>
  <div class="modal" id="projectModal" role="dialog" aria-modal="true">
    <div class="modal-panel">
      <div class="modal-top"><div><p id="modalCategory"></p><h3 id="modalTitle"></h3></div><button class="modal-close" type="button" id="closeProjectModal">Close</button></div>
      <button type="button" class="image-preview-button modal-cover" id="modalCoverButton"><img id="modalCover" src="" alt=""></button>
      <div class="modal-body"><div class="modal-copy" id="modalCopy"></div><div class="modal-meta" id="modalMeta"></div></div>
      <div class="modal-gallery" id="modalGallery"></div>
    </div>
  </div>
  <div class="modal lightbox" id="imageModal" role="dialog" aria-modal="true">
    <button class="modal-close" type="button" id="closeImageModal" style="position:absolute;right:24px;top:24px">Close</button>
    <img id="imageModalImg" src="" alt="">
  </div>
  <script>
    const slides = ${safeSlides};
    const projectRecords = ${safeProjectRecords};
    let active = 0;
    let modalRecord = null;
    const cursor = document.getElementById('cursor');
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('mousemove', function(event) {
      tx = event.clientX; ty = event.clientY;
      const interactive = event.target.closest && event.target.closest('a,button');
      cursor.classList.toggle('active', Boolean(interactive));
      document.querySelectorAll('.spotlight').forEach(function(card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', event.clientX - rect.left + 'px');
        card.style.setProperty('--mouse-y', event.clientY - rect.top + 'px');
      });
    });
    function moveCursor(){ x += (tx - x) * .18; y += (ty - y) * .18; cursor.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)'; requestAnimationFrame(moveCursor); }
    moveCursor();
    const observer = new IntersectionObserver(function(entries){ entries.forEach(function(entry){ if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function(node){ observer.observe(node); });
    function setSlide(index) {
      if (!slides.length) return;
      active = index;
      const slide = slides[active];
      const img = document.getElementById('slideImg');
      if (!img) return;
      img.src = slide.image; img.alt = slide.title;
      document.getElementById('slideTitle').textContent = slide.title;
      document.getElementById('slideCategory').textContent = slide.category;
      document.getElementById('slideMeta').textContent = [slide.role, slide.tools].filter(Boolean).join(' / ');
      document.getElementById('slideText').textContent = slide.description;
      document.querySelectorAll('.bar b').forEach(function(bar, i){ bar.style.width = i === active ? '100%' : '0%'; });
    }
    const projectModal = document.getElementById('projectModal');
    const imageModal = document.getElementById('imageModal');
    const imageModalImg = document.getElementById('imageModalImg');
    function openImage(src, alt) {
      if (!src) return;
      imageModalImg.src = src;
      imageModalImg.alt = alt || '';
      imageModal.classList.add('open');
    }
    function closeImage() {
      imageModal.classList.remove('open');
      imageModalImg.removeAttribute('src');
    }
    function openProject(index) {
      openProjectRecord(slides[index]);
    }
    function openProjectRecord(slide) {
      if (!slide) return;
      modalRecord = slide;
      document.getElementById('modalCategory').textContent = slide.category || 'Selected Work';
      document.getElementById('modalTitle').textContent = slide.title || 'Untitled Project';
      const cover = document.getElementById('modalCover');
      cover.src = slide.image;
      cover.alt = slide.title;
      document.getElementById('modalCopy').textContent = [slide.description, slide.content].filter(Boolean).join('\\n\\n');
      const meta = document.getElementById('modalMeta');
      meta.innerHTML = [
        slide.role ? '<p>Role<span>' + slide.role + '</span></p>' : '',
        slide.tools ? '<p>Tools<span>' + slide.tools + '</span></p>' : '',
        (slide.startDate || slide.endDate) ? '<p>Period<span>' + [slide.startDate, slide.endDate].filter(Boolean).join(' - ') + '</span></p>' : '',
        slide.url ? '<a class="btn neon" href="' + slide.url + '" target="_blank" rel="noreferrer">Open Link</a>' : ''
      ].join('');
      const gallery = document.getElementById('modalGallery');
      gallery.innerHTML = (slide.gallery || []).map(function(image) {
        return '<button type="button" class="image-preview-trigger" data-preview-src="' + image.src + '" data-preview-alt="' + (image.alt || slide.title) + '"><img src="' + image.src + '" alt="' + (image.alt || slide.title) + '"></button>';
      }).join('');
      projectModal.classList.add('open');
    }
    document.querySelectorAll('.bar').forEach(function(button){ button.addEventListener('click', function(){ setSlide(Number(button.dataset.slide || 0)); }); });
    document.getElementById('slideLink')?.addEventListener('click', function(){ openProject(active); });
    document.getElementById('slideImageButton')?.addEventListener('click', function(){ const slide = slides[active]; if (slide) openImage(slide.image, slide.title); });
    document.getElementById('modalCoverButton')?.addEventListener('click', function(){ if (modalRecord) openImage(modalRecord.image, modalRecord.title); });
    document.getElementById('closeProjectModal')?.addEventListener('click', function(){ projectModal.classList.remove('open'); });
    document.getElementById('closeImageModal')?.addEventListener('click', closeImage);
    imageModal?.addEventListener('click', function(event){ if (event.target === imageModal) closeImage(); });
    projectModal?.addEventListener('click', function(event){ if (event.target === projectModal) projectModal.classList.remove('open'); });
    document.addEventListener('click', function(event) {
      const trigger = event.target.closest && event.target.closest('[data-preview-src]');
      if (trigger) openImage(trigger.dataset.previewSrc, trigger.dataset.previewAlt);
      const archiveTrigger = event.target.closest && event.target.closest('[data-archive-index]');
      if (archiveTrigger) openProjectRecord(projectRecords[Number(archiveTrigger.dataset.archiveIndex || 0)]);
    });
    if (slides.length > 1) setInterval(function(){ setSlide((active + 1) % slides.length); }, 6000);
  </script>
</body>
</html>`;
}

function renderAquaHtml(data: SiteData) {
  const projects = sortByOrder(data.projects).filter((project) => project.status !== 'archived');
  const featuredProject = projects.find((project) => project.isFeatured) || projects[0];
  const sideProjects = projects.filter((project) => project !== featuredProject);
  const leftProject = sideProjects[0] || featuredProject;
  const rightProject = sideProjects[1] || projects[1] || featuredProject;
  const skills = sortByOrder(data.skills).filter((skill) => skill.name.trim());
  const experiences = sortByOrder(data.experiences).filter((experience) => experience.position || experience.company);
  const awards = sortByOrder(data.awards ?? []).filter((award) => award.title.trim());
  const videos = sortByOrder(data.videos ?? []).filter((video) => video.videoUrl.trim());
  const socials = sortByOrder(data.socialLinks);
  const title = data.config.seoTitle || `${data.user.displayName || data.user.username || 'Aqua'} - Aqua Portfolio`;
  const description = data.config.seoDescription || data.user.bio || 'Built with SiteForge';
  const projectImage = (project?: Project) => project?.coverImage || project?.images?.find((image) => image.imageUrl)?.imageUrl || '';
  const projectTools = (project?: Project) => (project?.tools || project?.role || 'Design, React')
    .split(',')
    .map((tool) => tool.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((tool) => `<span>${escapeHtml(tool)}</span>`)
    .join('');
  const projectMiniCard = (project: Project | undefined, side: 'left' | 'right') => {
    if (!project) return '';
    const image = projectImage(project);
    return `<article class="glass project-card card-${side}">
      ${image ? `<button class="cover image-trigger" type="button" data-src="${escapeHtml(image)}" data-alt="${escapeHtml(project.title)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)}"></button>` : ''}
      <div><h3>${escapeHtml(project.title || 'Untitled Project')}</h3><div class="pill">${escapeHtml(project.category || 'Selected Work')}</div><p>${escapeHtml(project.description || 'A selected portfolio project with polished interaction and visual craft.')}</p></div>
      <div class="chips">${projectTools(project)}</div>
    </article>`;
  };
  const experienceCards = data.config.showExperience && experiences.length
    ? experiences.slice(0, 3).map((experience) => `<article class="experience-item"><div class="box-label"><span>${escapeHtml(experience.startDate || 'Start')} - ${experience.isCurrent ? 'Now' : escapeHtml(experience.endDate || 'Present')}</span><span>${escapeHtml(experience.type)}</span></div><h3>${escapeHtml(experience.position || 'Role')} · ${escapeHtml(experience.company || 'Organization')}</h3>${experience.description ? `<p>${escapeHtmlWithBreaks(experience.description)}</p>` : ''}</article>`).join('')
    : '<p class="muted-copy">Experience is hidden or empty, so this template removes unrelated placeholder content.</p>';
  const skillCards = data.config.showSkills && skills.length
    ? skills.slice(0, 6).map((skill) => `<div><span>${escapeHtml(skill.category || 'Skill')}</span><strong>${escapeHtml(skill.name)} · ${skill.proficiency}/5</strong><div class="skill-meter"><b style="width:${skill.proficiency * 20}%"></b></div></div>`).join('')
    : '<span class="muted-copy">Skills are hidden or empty.</span>';
  const mediaCards = data.config.showVideos && videos.length
    ? `<section class="section reveal"><span class="section-label">Motion Proof</span><h2>Videos and demos</h2><div class="media-grid">${videos.slice(0, 3).map((video) => `<a class="glass media-card" href="${escapeHtml(video.videoUrl)}" target="_blank" rel="noreferrer">${video.thumbnailUrl ? `<img src="${escapeHtml(video.thumbnailUrl)}" alt="${escapeHtml(video.title)}">` : ''}<h3>${escapeHtml(video.title)}</h3><p>${escapeHtml(video.description || video.platform)}</p></a>`).join('')}</div></section>`
    : '';
  const awardCards = data.config.showAwards && awards.length
    ? `<section class="section reveal"><span class="section-label">Recognition</span><h2>Honors and proof points</h2><div class="award-grid">${awards.slice(0, 3).map((award) => `<article class="glass award-card"><div class="pill">${escapeHtml(award.date || award.issuer)}</div><h3>${escapeHtml(award.title)}</h3><p>${escapeHtml(award.description || award.issuer)}</p></article>`).join('')}</div></section>`
    : '';
  const navMark = data.user.avatarUrl
    ? `<img src="${escapeHtml(data.user.avatarUrl)}" alt="${escapeHtml(data.user.displayName)}">`
    : escapeHtml((data.user.displayName || 'A').slice(0, 1));
  const particleLayer = Array.from({ length: 72 }, (_, index) => {
    const left = `${(index * 23 + 7) % 100}%`;
    const top = `${(index * 41 + 11) % 100}%`;
    const size = `${3 + (index % 5)}px`;
    const delay = `${-(index % 14) * 0.62}s`;
    const duration = `${9 + (index % 7) * 1.45}s`;
    const color = index % 5 === 0 ? '#10b981' : index % 3 === 0 ? '#d946ef' : '#8570ee';
    const opacity = 0.13 + (index % 5) * 0.04;
    const className = index % 9 === 0 ? 'particle particle-streak' : 'particle';
    return `<span class="${className}" style="--left:${left};--top:${top};--size:${size};--delay:${delay};--duration:${duration};--color:${color};--opacity:${opacity}"></span>`;
  }).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; } html { scroll-behavior: smooth; } body { margin: 0; min-height: 100vh; overflow-x: hidden; background-color: #05030a; background-image: radial-gradient(circle at 50% -20%, rgba(133,112,238,.22) 0%, transparent 60%), radial-gradient(circle at 10% 40%, rgba(133,112,238,.05) 0%, transparent 40%), radial-gradient(circle at 90% 70%, rgba(217,70,239,.06) 0%, transparent 40%), radial-gradient(circle at 50% 120%, rgba(133,112,238,.08) 0%, transparent 50%); color: white; font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; } a { color: inherit; text-decoration: none; } button, select, input, textarea { font: inherit; } button { cursor: pointer; border: 0; }
    .grid-lines { position: fixed; inset: 0; display: flex; justify-content: space-between; padding: 0 4%; pointer-events: none; z-index: 0; } .grid-lines span { width: 1px; background: linear-gradient(to bottom, rgba(133,112,238,.02), rgba(133,112,238,.08), rgba(133,112,238,.02)); } .particles { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; } .particle { position: absolute; width: var(--size); height: var(--size); left: var(--left); top: var(--top); border-radius: 999px; background: var(--color); opacity: var(--opacity); box-shadow: 0 0 24px color-mix(in srgb, var(--color) 72%, transparent), 0 0 52px color-mix(in srgb, var(--color) 26%, transparent); animation: particle-drift var(--duration) ease-in-out var(--delay) infinite alternate; } .particle:nth-child(4n) { filter: blur(.4px); } .particle:nth-child(6n) { width: calc(var(--size) + 2px); height: 1px; border-radius: 999px; } .particle-streak { width: 42px; height: 1px; border-radius: 999px; background: linear-gradient(90deg, transparent, var(--color), transparent); transform: rotate(-22deg); box-shadow: 0 0 18px color-mix(in srgb, var(--color) 76%, transparent); }
    .content { position: relative; z-index: 1; }
    .muted { color: #9595b1; } .purple { color: #8570ee; } .pink { color: #d946ef; } .green { color: #10b981; } .header { max-width: 1280px; margin: 16px auto 0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; } .nav { display: flex; gap: 28px; color: #9595b1; font-size: 13px; font-weight: 700; } .nav a:hover { color: #fff; }
    .logo { display: flex; align-items: center; gap: 10px; font-size: 22px; font-weight: 900; letter-spacing: -.04em; } .logo-mark { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; overflow: hidden; background: linear-gradient(135deg,#8570ee,#d946ef); box-shadow: 0 0 24px rgba(133,112,238,.35); } .logo-mark img { width: 100%; height: 100%; object-fit: cover; }
    .btn { border-radius: 999px; border: 1px solid rgba(133,112,238,.28); background: rgba(255,255,255,.05); color: #fff; padding: 10px 18px; font-size: 12px; font-weight: 900; transition: .3s ease; } .btn:hover { transform: translateY(-2px); background: rgba(255,255,255,.08); }
    .main { max-width: 1280px; margin: 48px auto 0; padding: 0 24px 64px; } .hero { display: grid; grid-template-columns: 180px minmax(0,1fr) 180px; align-items: center; gap: 32px; margin-bottom: 54px; } .metric-stack { display: flex; flex-direction: column; gap: 28px; } .metric-stack.right { text-align: right; align-items: flex-end; } .circle-btn { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: #9595b1; } .metric strong { display: block; font-size: 30px; line-height: 1; } .metric span { display: block; margin-top: 7px; color: #9595b1; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .15em; }
    .hero-center { text-align: center; display: flex; flex-direction: column; align-items: center; } .booking { display: inline-flex; align-items: center; gap: 9px; margin-bottom: 24px; padding: 8px 13px; border-radius: 999px; color: #9595b1; font-size: 11px; font-weight: 700; } .booking i { width: 7px; height: 7px; border-radius: 999px; background: #8570ee; animation: pulse-dot 1.6s ease-in-out infinite; } .hero h1 { max-width: 780px; margin: 0; font-size: clamp(42px, 6vw, 78px); line-height: 1.05; letter-spacing: -.06em; font-weight: 900; } .hero h1 span:first-child { background: linear-gradient(90deg,#dcd7ff,#8570ee,#d946ef); -webkit-background-clip: text; background-clip: text; color: transparent; } .hero p { max-width: 620px; margin: 22px auto 30px; color: #9595b1; font-size: 14px; line-height: 1.8; }
    .start { display: flex; flex-direction: column; align-items: center; gap: 9px; color: #9595b1; font-size: 10px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; } .start button { position: relative; width: 52px; height: 52px; border-radius: 50%; background: #fff; color: #05030a; font-size: 22px; font-weight: 900; box-shadow: 0 18px 42px rgba(133,112,238,.24); } .start button::before { content: ""; position: absolute; inset: -5px; border-radius: inherit; background: linear-gradient(45deg,#8570ee,#d946ef); filter: blur(9px); opacity: .45; z-index: -1; animation: glow 3s ease-in-out infinite; }
    .glass { position: relative; background: rgba(13,10,25,.5); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.07); transition: transform .45s cubic-bezier(.16,1,.3,1), border-color .35s, box-shadow .35s, background .35s; } .glass::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; pointer-events: none; opacity: 0; background: radial-gradient(220px circle at 50% 0%, rgba(133,112,238,.22), transparent 62%); transition: opacity .35s ease; } .glass:hover { border-color: rgba(133,112,238,.32); background: rgba(18,13,35,.62); box-shadow: 0 22px 58px rgba(133,112,238,.12); } .glass:hover::after { opacity: 1; }
    .deck { perspective: 1500px; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 24px; margin: 0 auto 70px; max-width: 1120px; } .project-card { min-height: 288px; border-radius: 28px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; } .card-left { transform: rotateY(20deg) translateZ(-30px) rotateX(4deg); } .card-right { transform: rotateY(-20deg) translateZ(-30px) rotateX(4deg); } .card-center { min-height: 330px; transform: translateZ(40px) translateY(-10px); border-color: rgba(133,112,238,.25); box-shadow: 0 24px 60px rgba(133,112,238,.15); }
    .cover { width: 100%; height: 96px; margin: -8px -8px 16px; border-radius: 20px; overflow: hidden; background: rgba(255,255,255,.04); padding: 0; } .cover img { width: 100%; height: 100%; object-fit: cover; filter: saturate(1.15) brightness(1.12); transition: transform .45s ease; } .cover:hover img { transform: scale(1.05); } .project-card h3 { margin: 0 0 10px; font-size: 19px; font-weight: 850; } .pill { display: inline-flex; width: max-content; max-width: 100%; margin-bottom: 14px; border-radius: 999px; background: rgba(255,255,255,.05); padding: 5px 11px; color: #9595b1; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; } .project-card p { color: #9595b1; font-size: 12px; line-height: 1.75; } .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; } .chips span { border-radius: 999px; background: rgba(133,112,238,.12); color: #dcd7ff; padding: 7px 10px; font-size: 10px; font-weight: 800; transition: background .25s ease, color .25s ease, transform .25s ease; } .chips span:hover { transform: translateY(-2px); background: rgba(217,70,239,.18); color: #fff; } .orbit-showcase { max-width: 760px; margin: -18px auto 56px; padding: 18px 24px; border-radius: 32px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; } .orbit-copy { min-width: 0; } .orbit-copy:nth-child(3) { text-align: right; } .orbit-copy span { display: block; color: #8570ee; font-size: 10px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; } .orbit-copy strong { display: block; margin-top: 6px; color: #fff; font-size: 15px; line-height: 1.35; }
    .orbit { height: 150px; display: grid; place-items: center; position: relative; overflow: visible; } .orbit-line { position: absolute; left: 50%; top: 50%; width: 192px; height: 62px; border-radius: 999px; transform: translate(-50%,-50%); background: radial-gradient(ellipse at center, transparent 58%, rgba(133,112,238,.32) 59%, rgba(217,70,239,.18) 62%, transparent 64%); box-shadow: 0 0 28px rgba(133,112,238,.12), inset 0 0 28px rgba(217,70,239,.08); opacity: .9; } .orbit-line::after { content: ""; position: absolute; inset: 9px 22px; border-radius: inherit; border: 1px solid rgba(255,255,255,.05); filter: blur(.2px); } .orbit-runner { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-origin: 0 0; } .orbit-saucer { position: absolute; left: 0; top: 0; width: 34px; height: 14px; border-radius: 999px; background: linear-gradient(180deg,#f7efff 0%,#d946ef 42%,#5b3bd8 100%); box-shadow: 0 0 18px rgba(217,70,239,.78), 0 8px 22px rgba(133,112,238,.22); animation: saucer-path 8s cubic-bezier(.45,0,.55,1) infinite; } .orbit-saucer::before { content: ""; position: absolute; left: 50%; top: -7px; width: 16px; height: 10px; border-radius: 999px 999px 8px 8px; background: linear-gradient(180deg,rgba(255,255,255,.92),rgba(133,112,238,.72)); transform: translateX(-50%); box-shadow: 0 0 12px rgba(255,255,255,.28); } .orbit-saucer::after { content: ""; position: absolute; left: 7px; right: 7px; bottom: -4px; height: 5px; border-radius: 999px; background: rgba(16,185,129,.72); filter: blur(3px); opacity: .78; } .planet { width: 50px; height: 50px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle at 35% 25%, #f5e8ff 0 8%, #d946ef 24%, #8570ee 68%, #21135c 100%); box-shadow: 0 0 28px rgba(133,112,238,.55), 0 0 70px rgba(217,70,239,.22); z-index: 1; animation: planet-pulse 4s ease-in-out infinite; }
    .github { display: flex; justify-content: space-between; gap: 12px; margin-top: 18px; border-radius: 15px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.05); padding: 10px 12px; color: #8570ee; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .section { max-width: 1120px; margin: 0 auto 64px; } .section-label { display: block; margin-bottom: 6px; color: #8570ee; font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; } .section h2 { margin: 0 0 24px; font-size: clamp(26px, 3vw, 38px); font-weight: 900; letter-spacing: -.04em; } .bento { display: grid; grid-template-columns: 5fr 7fr; gap: 24px; } .panel { border-radius: 28px; padding: 24px; } .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; font-size: 14px; font-weight: 900; } .status { border-radius: 999px; padding: 4px 10px; background: rgba(16,185,129,.1); color: #10b981; font-size: 10px; }
    .box-label { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; color: #9595b1; font-size: 11px; } .experience-list { display: grid; gap: 12px; } .experience-item { border-radius: 18px; border: 1px solid rgba(255,255,255,.06); background: rgba(0,0,0,.26); padding: 15px; } .experience-item h3 { margin: 0; font-size: 15px; font-weight: 850; } .experience-item p, .muted-copy { margin: 7px 0 0; color: #9595b1; font-size: 12px; line-height: 1.6; }
    .skill-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; border-top: 1px solid rgba(255,255,255,.06); padding-top: 22px; } .skill-grid span { display: block; color: #9595b1; font-size: 10px; line-height: 1.4; } .skill-grid strong { display: block; margin-top: 6px; color: #10b981; font-size: 16px; } .skill-meter { margin-top: 10px; height: 5px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.08); } .skill-meter b { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#8570ee,#d946ef); }
    .tools, .media-grid, .award-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; } .tool { border-radius: 22px; padding: 18px; color: #9595b1; font-size: 12px; font-weight: 800; transform: translateY(0); transition: transform .32s cubic-bezier(.16,1,.3,1), color .32s, border-color .32s; overflow: hidden; } .tool:hover { transform: translateY(-5px); color: #fff; border-color: rgba(217,70,239,.28); } .tool-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; } .tool-orb { width: 34px; height: 34px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg,rgba(133,112,238,.24),rgba(217,70,239,.18)); color: #fff; box-shadow: 0 0 24px rgba(133,112,238,.14); } .tool-category { color: #8570ee; font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; } .tool-name { display: block; color: #fff; font-size: 15px; font-weight: 900; line-height: 1.25; } .tool-meter { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 5px; margin-top: 16px; } .tool-meter span { height: 6px; border-radius: 999px; background: rgba(255,255,255,.08); box-shadow: inset 0 0 0 1px rgba(255,255,255,.04); } .tool-meter span.active { background: linear-gradient(90deg,#8570ee,#d946ef); box-shadow: 0 0 14px rgba(217,70,239,.32); } .media-card, .award-card { border-radius: 22px; padding: 18px; min-height: 150px; transform: translateY(0); transition: transform .32s cubic-bezier(.16,1,.3,1), border-color .32s, box-shadow .32s; } .media-card:hover, .award-card:hover { transform: translateY(-6px); } .media-card img { width: 100%; height: 130px; object-fit: cover; border-radius: 16px; margin-bottom: 14px; filter: brightness(1.12) saturate(1.12); } .media-card h3, .award-card h3 { margin: 0 0 8px; font-size: 16px; font-weight: 850; } .media-card p, .award-card p { color: #9595b1; font-size: 12px; line-height: 1.65; }
    .footer { max-width: 1280px; margin: 0 auto 24px; padding: 24px; border: 1px solid rgba(255,255,255,.07); border-radius: 30px; display: grid; grid-template-columns: 1.35fr .8fr 1fr; gap: 28px; color: #9595b1; font-size: 12px; background: linear-gradient(135deg,rgba(13,10,25,.78),rgba(10,7,20,.5)); backdrop-filter: blur(22px); box-shadow: 0 24px 70px rgba(0,0,0,.18); } .footer-brand { display: flex; align-items: center; gap: 12px; color: #fff; font-size: 18px; font-weight: 900; } .footer-mark { width: 42px; height: 42px; border-radius: 16px; display: grid; place-items: center; overflow: hidden; background: linear-gradient(135deg,#8570ee,#d946ef); box-shadow: 0 0 28px rgba(133,112,238,.24); } .footer-mark img { width: 100%; height: 100%; object-fit: cover; } .footer-copy { margin: 14px 0 0; max-width: 360px; color: #9595b1; font-size: 12px; line-height: 1.7; } .footer-title { margin: 0 0 12px; color: #fff; font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; } .footer-links, .footer-contact { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; } .footer a { color: #9595b1; transition: color .25s ease, transform .25s ease; } .footer a:hover { color: #fff; transform: translateX(3px); } .footer-bottom { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.06); color: #6f6f8d; }
    .float { position: fixed; right: 24px; bottom: 24px; z-index: 30; width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font-size: 20px; } .drawer { position: fixed; inset: 0 0 0 auto; width: min(100%,390px); z-index: 60; display: flex; flex-direction: column; justify-content: space-between; padding: 24px; background: rgba(9,7,21,.96); backdrop-filter: blur(24px); border-left: 1px solid rgba(255,255,255,.1); transform: translateX(105%); transition: transform .5s cubic-bezier(.16,1,.3,1); box-shadow: -30px 0 90px rgba(0,0,0,.42); } .drawer.open { transform: translateX(0); } .drawer-head { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.06); padding-bottom: 18px; margin-bottom: 22px; } .box { border-radius: 18px; border: 1px solid rgba(255,255,255,.05); background: rgba(0,0,0,.4); padding: 16px; margin-bottom: 12px; } .gradient-btn { width: 100%; border-radius: 18px; padding: 14px 18px; background: linear-gradient(90deg,#8570ee,#d946ef); color: #fff; font-size: 13px; font-weight: 900; box-shadow: 0 18px 44px rgba(133,112,238,.18); }
    .lightbox { position: fixed; inset: 0; z-index: 80; display: none; place-items: center; padding: 24px; background: rgba(2,6,23,.86); backdrop-filter: blur(8px); } .lightbox.open { display: grid; } .lightbox img { max-width: min(100%,1040px); max-height: 86vh; object-fit: contain; border-radius: 24px; box-shadow: 0 24px 80px rgba(0,0,0,.5); }
    .reveal { opacity: 0; transform: translateY(24px) scale(.985); animation: fade-up .86s cubic-bezier(.16,1,.3,1) forwards; } @keyframes fade-up { to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes particle-drift { 0% { transform: translate3d(0,0,0) scale(.85); opacity: calc(var(--opacity) * .55); } 45% { transform: translate3d(28px,-34px,0) scale(1.22); opacity: var(--opacity); } 100% { transform: translate3d(-22px,26px,0) scale(.96); opacity: calc(var(--opacity) * .82); } } @keyframes pulse-dot { 0%,100% { opacity: .35; transform: scale(.85); } 50% { opacity: 1; transform: scale(1.25); } } @keyframes glow { 0%,100% { transform: scale(1); opacity: .32; } 50% { transform: scale(1.16); opacity: .65; } } @keyframes saucer-path { 0%,100% { transform: translate(94px,-50%) scale(1); z-index: 3; } 25% { transform: translate(-17px,24px) scale(.9); z-index: 0; } 50% { transform: translate(-112px,-50%) scale(.78); z-index: 0; opacity: .78; } 75% { transform: translate(-17px,-38px) scale(1.08); z-index: 3; opacity: 1; } } @keyframes planet-pulse { 0%,100% { transform: scale(1); filter: saturate(1); } 50% { transform: scale(1.06); filter: saturate(1.2); } }
    @media (max-width: 980px) { .nav { display: none; } .hero { grid-template-columns: 1fr; text-align: center; } .metric-stack, .metric-stack.right { flex-direction: row; justify-content: center; align-items: center; text-align: center; flex-wrap: wrap; order: 2; } .hero-center { order: 1; } .deck, .bento, .media-grid, .award-grid, .footer { grid-template-columns: 1fr; } .card-left, .card-center, .card-right { transform: none !important; min-height: auto; } .tools { grid-template-columns: repeat(2,minmax(0,1fr)); } .orbit-showcase { grid-template-columns: 1fr; text-align: center; } .orbit-copy:nth-child(3) { text-align: center; } } @media (max-width: 620px) { .header { flex-direction: column; align-items: flex-start; } .main { margin-top: 32px; padding-inline: 16px; } .hero h1 { font-size: 42px; } .skill-grid { grid-template-columns: 1fr; } .panel { padding: 18px; border-radius: 22px; } .footer { margin-inline: 16px; padding-bottom: 92px; } .footer-bottom { flex-direction: column; align-items: flex-start; } }
  </style>
</head>
<body>
  <div class="grid-lines" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
  <div class="particles" aria-hidden="true">${particleLayer}</div>
  <div class="content">
    <header class="header reveal" style="animation-delay:.1s"><nav class="nav"><a href="#works">Works</a><a href="#about">About</a>${data.config.showSkills && skills.length ? '<a href="#skills">Skills</a>' : ''}<a href="#contact">Contact</a></nav><a class="logo" href="#top"><span class="logo-mark">${navMark}</span><span>${escapeHtml(data.user.username || data.user.displayName || 'AQUA.dev')}</span></a><button class="btn" type="button" data-drawer-open>Hire Me</button></header>
    <main class="main" id="top">
      <section class="hero" id="about">
        <div class="metric-stack reveal" style="animation-delay:.35s"><a class="circle-btn" href="#works">↘</a><div class="metric"><strong>${experiences.length ? `${Math.max(1, experiences.length)}+` : '1+'}</strong><span>Experience</span></div><div class="metric"><strong>${projects.length}+</strong><span>Delivered Projects</span></div></div>
        <div class="hero-center reveal" style="animation-delay:.2s"><div class="booking glass"><i></i> Now booking new collaborations</div><h1><span>${escapeHtml(data.user.title || 'Crafting Immersive Interfaces')}</span><br><span>${escapeHtml(data.user.bio || 'and Digital Products')}</span></h1><p>${escapeHtml(data.user.fullBio || 'Creative developer and UI designer specializing in interactive experiences, custom portfolio systems, and polished digital products.')}</p><div class="start"><span>Start a project</span><button type="button" data-drawer-open>→</button></div></div>
        <div class="metric-stack right reveal" style="animation-delay:.4s"><button class="circle-btn" type="button" data-drawer-open>↗</button><div class="metric"><strong>${escapeHtml(data.user.location || 'Remote')}</strong><span>Current Base</span></div><div class="metric"><strong>${awards.length || skills.length}</strong><span>Proof Points</span></div></div>
      </section>
      <section class="glass orbit-showcase reveal" style="animation-delay:.45s" aria-label="Aqua orbit signature"><div class="orbit-copy"><span>Orbit Signal</span><strong>${escapeHtml(featuredProject?.category || 'Selected portfolio system')}</strong></div><div class="orbit"><div class="orbit-line"></div><div class="orbit-runner"><div class="orbit-saucer"></div></div><div class="planet">✦</div></div><div class="orbit-copy"><span>Motion Layer</span><strong>${escapeHtml(featuredProject?.tools || 'Interactive visual identity')}</strong></div></section>
      ${projects.length ? `<section class="deck reveal" id="works" style="animation-delay:.5s">${projectMiniCard(leftProject, 'left')}${featuredProject ? `<article class="glass project-card card-center"><div><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><span class="pill">Featured Project</span><span class="muted">✦</span></div>${projectImage(featuredProject) ? `<button class="cover image-trigger" type="button" data-src="${escapeHtml(projectImage(featuredProject))}" data-alt="${escapeHtml(featuredProject.title)}"><img src="${escapeHtml(projectImage(featuredProject))}" alt="${escapeHtml(featuredProject.title)}"></button>` : ''}<h3>${escapeHtml(featuredProject.title || 'Featured Project')}</h3><p>${escapeHtml(featuredProject.description)}</p></div><div>${featuredProject.githubUrl ? `<a class="github" href="${escapeHtml(featuredProject.githubUrl)}" target="_blank" rel="noreferrer"><span>${escapeHtml(featuredProject.githubUrl)}</span><span>↗</span></a>` : ''}<div class="chips">${featuredProject.role ? `<span>${escapeHtml(featuredProject.role)}</span>` : ''}${featuredProject.tools ? `<span>${escapeHtml(featuredProject.tools)}</span>` : ''}</div></div></article>` : ''}${projectMiniCard(rightProject, 'right')}</section>` : ''}
      <section class="section reveal" id="skills" style="animation-delay:.6s"><span class="section-label">Portfolio Data</span><h2>Experience & Skill Matrix</h2><div class="bento"><div class="glass panel"><div class="panel-head"><span>Experience Timeline</span><span class="status">${data.config.showExperience ? 'From Form' : 'Hidden'}</span></div><div class="experience-list">${experienceCards}</div></div><div class="glass panel"><div class="panel-head"><span>Skill Matrix</span><span class="pink">Form Driven</span></div><p class="muted-copy">Skill names, categories, and proficiency levels come from the form.</p><div class="skill-grid">${skillCards}</div></div></div></section>
      ${data.config.showSkills && skills.length ? `<section class="section reveal"><div style="text-align:center;margin-bottom:32px"><span class="muted" style="font-size:12px;text-transform:uppercase;letter-spacing:.22em">Selected Industry Tools I Master</span></div><div class="tools">${skills.slice(0, 8).map((skill, index) => `<article class="glass tool"><div class="tool-top"><span class="tool-orb">${String(index + 1).padStart(2, '0')}</span><span class="tool-category">${escapeHtml(skill.category || 'Capability')}</span></div><strong class="tool-name">${escapeHtml(skill.name)}</strong><div class="tool-meter" aria-label="${escapeHtml(skill.name)} proficiency ${skill.proficiency} of 5">${[1, 2, 3, 4, 5].map((level) => `<span class="${level <= skill.proficiency ? 'active' : ''}"></span>`).join('')}</div></article>`).join('')}</div></section>` : ''}
      ${mediaCards}
      ${awardCards}
    </main>
    <footer class="footer" id="contact">
      <div>
        <a class="footer-brand" href="#top"><span class="footer-mark">${navMark}</span><span>${escapeHtml(data.user.displayName || data.user.username || 'Aqua.dev')}</span></a>
        <p class="footer-copy">${escapeHtml(data.user.bio || 'A focused personal portfolio for selected works, skills, recognition, and collaboration.')}</p>
      </div>
      <div>
        <h3 class="footer-title">Navigate</h3>
        <nav class="footer-links"><a href="#about">About</a><a href="#works">Works</a>${data.config.showSkills && skills.length ? '<a href="#skills">Skills</a>' : ''}<a href="#contact">Contact</a></nav>
      </div>
      <div>
        <h3 class="footer-title">Contact</h3>
        <div class="footer-contact">${data.user.email ? `<a href="mailto:${escapeHtml(data.user.email)}">${escapeHtml(data.user.email)}</a>` : ''}${data.user.location ? `<span>${escapeHtml(data.user.location)}</span>` : ''}${socials.map((social) => `<a href="${escapeHtml(social.url)}" target="_blank" rel="noreferrer">${escapeHtml(social.platform)}</a>`).join('')}</div>
      </div>
      <div class="footer-bottom"><span>© 2026 ${escapeHtml(data.user.displayName || 'Aqua.dev')}. All rights reserved.</span><span>Built with SiteForge</span></div>
    </footer>
  </div>
  <button class="glass float" type="button" data-drawer-open>✉</button>
  <aside class="drawer" id="drawer"><div><div class="drawer-head"><strong>Start a Collaboration</strong><button type="button" data-drawer-close>×</button></div><p class="muted-copy">Have a project idea, role opportunity, or portfolio conversation? Use the public contact channels below.</p><div class="box"><span class="muted" style="font-size:10px">Contact Email</span><br>${data.user.email ? `<a href="mailto:${escapeHtml(data.user.email)}">${escapeHtml(data.user.email)}</a>` : '<span class="muted-copy">Email hidden for this published version.</span>'}</div>${data.user.location ? `<div class="box"><span class="muted" style="font-size:10px">Location</span><br>${escapeHtml(data.user.location)}</div>` : ''}${socials.length ? `<div class="box"><span class="muted" style="font-size:10px">Social Links</span><div class="chips" style="margin-top:10px">${socials.map((social) => `<a class="pill" href="${escapeHtml(social.url)}" target="_blank" rel="noreferrer">${escapeHtml(social.platform)}</a>`).join('')}</div></div>` : ''}</div><button class="gradient-btn" type="button" data-drawer-close>Close Contact Panel</button></aside>
  <div class="lightbox" id="lightbox"><img id="lightboxImg" src="" alt=""></div>
  <script>
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(event) {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    const deck = document.querySelector('.deck');
    const left = document.querySelector('.card-left');
    const center = document.querySelector('.card-center');
    const right = document.querySelector('.card-right');
    if (deck && left && center && right) {
      deck.addEventListener('mousemove', function(event) {
        const rect = deck.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        left.style.transform = 'rotateY(' + (20 + x * 15) + 'deg) translateZ(' + (-30 + y * 15) + 'px) rotateX(' + (4 - y * 15) + 'deg)';
        center.style.transform = 'translateZ(40px) translateY(' + (-10 + y * 15) + 'px) rotateY(' + (x * 12) + 'deg) rotateX(' + (-y * 12) + 'deg)';
        right.style.transform = 'rotateY(' + (-20 + x * 15) + 'deg) translateZ(' + (-30 + y * 15) + 'px) rotateX(' + (4 - y * 15) + 'deg)';
      });
      deck.addEventListener('mouseleave', function() {
        left.style.transform = 'rotateY(20deg) translateZ(-30px) rotateX(4deg)';
        center.style.transform = 'translateZ(40px) translateY(-10px) rotateY(0deg) rotateX(0deg)';
        right.style.transform = 'rotateY(-20deg) translateZ(-30px) rotateX(4deg)';
      });
    }
    const drawer = document.getElementById('drawer');
    document.querySelectorAll('[data-drawer-open]').forEach(function(button){ button.addEventListener('click', function(){ drawer.classList.add('open'); }); });
    document.querySelectorAll('[data-drawer-close]').forEach(function(button){ button.addEventListener('click', function(){ drawer.classList.remove('open'); }); });
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    document.querySelectorAll('.image-trigger').forEach(function(button){ button.addEventListener('click', function(){ lightboxImg.src = button.dataset.src || ''; lightboxImg.alt = button.dataset.alt || ''; lightbox.classList.add('open'); }); });
    lightbox.addEventListener('click', function(){ lightbox.classList.remove('open'); lightboxImg.removeAttribute('src'); });
  </script>
</body>
</html>`;
}
