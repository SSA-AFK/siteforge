import { Mail, MapPin, Play, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Award, Project, SiteData, VideoItem } from '@siteforge/shared';

const cyan = '#49c5b6';
const lime = '#a3e635';
const pink = '#ff9398';

function sortByOrder<T extends { displayOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url);
}

function ScrambleText({ children, className = '' }: { children: string; className?: string }) {
  const [text, setText] = useState(children);
  const frameRef = useRef<number | null>(null);

  function scramble() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const chars = '!<>-_\\/[]{}+*^?#________';
    let frame = 0;
    const max = Math.max(12, children.length * 2);
    const tick = () => {
      setText(children.split('').map((char, index) => (frame > index * 2 ? char : chars[Math.floor(Math.random() * chars.length)])).join(''));
      frame += 1;
      if (frame <= max) frameRef.current = requestAnimationFrame(tick);
      else setText(children);
    };
    tick();
  }

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  return <span className={className} onMouseEnter={scramble}>{text}</span>;
}

function CornerFrame() {
  return (
    <>
      <span className="absolute left-0 top-0 z-20 h-4 w-4 border-l-2 border-t-2 border-[#49c5b6]/55 transition group-hover:border-[#49c5b6]" />
      <span className="absolute right-0 top-0 z-20 h-4 w-4 border-r-2 border-t-2 border-[#49c5b6]/25 transition group-hover:border-[#49c5b6]/80" />
      <span className="absolute bottom-0 left-0 z-20 h-4 w-4 border-b-2 border-l-2 border-[#49c5b6]/25 transition group-hover:border-[#49c5b6]/80" />
      <span className="absolute bottom-0 right-0 z-20 h-4 w-4 border-b-2 border-r-2 border-[#49c5b6]/55 transition group-hover:border-[#49c5b6]" />
    </>
  );
}

function ProjectNode({ project, index }: { project: Project; index: number }) {
  const colors = [cyan, pink, lime];
  const accent = colors[index % colors.length];
  const gallery = sortByOrder(project.images ?? []).filter((image) => image.imageUrl).slice(0, 2);
  return (
    <article data-aura-card-index={index} style={{ '--aura-panel-accent': accent } as CSSProperties} className={`aura-panel aura-interactive aura-reveal group relative overflow-hidden border border-[#49c5b6]/15 bg-[#04030a]/75 p-7 backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-[#49c5b6]/80 hover:shadow-[0_0_55px_rgba(73,197,182,.2)] ${project.isFeatured ? 'md:col-span-2 border-[#49c5b6]/45 shadow-[0_0_70px_rgba(73,197,182,.14)]' : ''}`}>
      <CornerFrame />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold tracking-[0.22em]" style={{ color: accent }}>[NODE_{String(index + 1).padStart(2, '0')}_SYS]</p>
        {project.isFeatured ? <span className="border border-[#49c5b6]/40 bg-[#49c5b6]/10 px-2 py-1 text-[9px] font-bold tracking-[0.2em] text-[#49c5b6]">FEATURED</span> : null}
      </div>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h3 className={`${project.isFeatured ? 'text-2xl' : 'text-xl'} font-bold text-white transition group-hover:text-[#49c5b6]`}>{project.title || 'Untitled Project'}</h3>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{project.category}{project.role ? ` / ${project.role}` : ''}</p>
        </div>
        {(project.endDate || project.startDate) ? <span className="shrink-0 border border-white/10 px-2 py-1 font-mono text-[10px] text-slate-500">{project.endDate || project.startDate}</span> : null}
      </div>
      {project.coverImage ? (
        <a href={project.coverImage} target="_blank" rel="noreferrer" className="mt-7 block overflow-hidden border border-white/10 bg-black/50">
          <img src={project.coverImage} alt={project.title} className={`${project.isFeatured ? 'h-72' : 'h-52'} w-full object-cover brightness-105 saturate-110 transition duration-700 group-hover:scale-105`} />
        </a>
      ) : null}
      {project.description ? <p className="mt-5 text-xs leading-7 text-slate-400">{project.description}</p> : null}
      {project.tools ? <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#49c5b6]/70">TOOLS: {project.tools}</p> : null}
      {gallery.length ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {gallery.map((image) => (
            <a key={image.id || image.imageUrl} href={image.imageUrl} target="_blank" rel="noreferrer" className="overflow-hidden border border-white/10 bg-black/40">
              <img src={image.imageUrl} alt={image.caption || project.title} className="h-24 w-full object-cover brightness-110 saturate-110 transition hover:scale-105" />
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function VideoTerminal({ video, onOpen }: { video: VideoItem; onOpen: (video: VideoItem) => void }) {
  const canOpenModal = isDirectVideoUrl(video.videoUrl);
  return (
    <article style={{ '--aura-panel-accent': video.isFeatured ? pink : cyan } as CSSProperties} className={`aura-panel aura-interactive aura-reveal group relative overflow-hidden border border-[#49c5b6]/20 bg-black/60 p-4 transition hover:-translate-y-1 hover:border-[#49c5b6]/80 hover:shadow-[0_0_55px_rgba(73,197,182,.2)] ${video.isFeatured ? 'md:col-span-2 border-[#ff9398]/50 shadow-[0_0_65px_rgba(255,147,152,.16)]' : ''}`}>
      <CornerFrame />
      {video.isFeatured ? <div className="mb-3 flex items-center justify-between text-[10px] font-bold tracking-[0.22em] text-[#ff9398]"><span>PRIORITY STREAM</span><span>FEATURED</span></div> : null}
      <div className={`relative flex ${video.isFeatured ? 'aspect-[21/9]' : 'aspect-video'} items-center justify-center overflow-hidden bg-slate-950`}>
        {canOpenModal ? (
          <button type="button" onClick={() => onOpen(video)} className="aura-interactive relative h-full w-full">
            {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover brightness-105 saturate-110" /> : null}
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-tr from-slate-950/80 to-slate-900/40">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-[#49c5b6] text-[#49c5b6] transition group-hover:scale-110"><Play className="h-6 w-6 fill-current" /></span>
            </div>
          </button>
        ) : (
          <a href={video.videoUrl} target="_blank" rel="noreferrer" className="aura-interactive relative h-full w-full">
            {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover brightness-105 saturate-110" /> : null}
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-tr from-slate-950/80 to-slate-900/40">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-[#49c5b6] text-[#49c5b6] transition group-hover:scale-110"><Play className="h-6 w-6 fill-current" /></span>
            </div>
          </a>
        )}
        <span className="absolute left-4 top-4 text-[10px] text-[#49c5b6]/50">REC [LIVE]</span>
        <span className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-500">{video.platform.toUpperCase()}</span>
      </div>
      <h3 className="mt-5 text-lg font-bold text-white">{video.title || 'Video Stream'}</h3>
      {video.description ? <p className="mt-3 text-xs leading-7 text-slate-400">{video.description}</p> : null}
    </article>
  );
}

function AwardTerminal({ award, index }: { award: Award; index: number }) {
  const accent = [cyan, pink, lime][index % 3];
  return (
    <article style={{ '--aura-panel-accent': accent } as CSSProperties} className="aura-panel aura-reveal group relative overflow-hidden border border-[#49c5b6]/15 bg-[#04030a]/75 p-6 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-[#49c5b6]/70">
      <CornerFrame />
      <div className="relative z-10 flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#49c5b6]/40 text-[#49c5b6]"><Star className="h-4 w-4" /></span>
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#49c5b6]">AWARD_{String(index + 1).padStart(2, '0')} {award.date ? `// ${award.date}` : ''}</p>
          <h3 className="mt-3 text-lg font-bold text-white">{award.title}</h3>
          {award.issuer ? <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">{award.issuer}</p> : null}
          {award.description ? <p className="mt-3 text-xs leading-7 text-slate-400">{award.description}</p> : null}
        </div>
      </div>
    </article>
  );
}

function SkillProtocolCard({ skill, index }: { skill: SiteData['skills'][number]; index: number }) {
  const level = Math.max(0, Math.min(5, skill.proficiency || 0));
  const percent = level * 20;
  const accent = [cyan, pink, lime][index % 3];
  return (
    <article className="aura-reveal aura-interactive aura-skill-card group relative overflow-hidden border border-[#49c5b6]/15 bg-[#04030a]/70 p-5" style={{ '--skill-percent': `${percent}%`, '--skill-accent': accent } as CSSProperties}>
      <CornerFrame />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.24em]" style={{ color: accent }}>PROTOCOL_{String(index + 1).padStart(2, '0')}</p>
          <h3 className="mt-3 text-xl font-bold text-white">{skill.name}</h3>
          {skill.category ? <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">{skill.category}</p> : null}
        </div>
        <div className="aura-skill-orb">
          <span>{level}</span>
        </div>
      </div>
      <div className="relative z-10 mt-7 grid grid-cols-5 gap-1.5">
        {Array.from({ length: 5 }).map((_, segment) => (
          <span key={segment} className={`h-7 border ${segment < level ? 'border-[#49c5b6]/70 bg-[#49c5b6]/20 shadow-[0_0_18px_rgba(73,197,182,.18)]' : 'border-white/10 bg-white/[.03]'}`} />
        ))}
      </div>
      <div className="relative z-10 mt-5 h-px overflow-hidden bg-white/10">
        <span className="block h-full bg-gradient-to-r from-[#49c5b6] via-[#a3e635] to-[#ff9398]" style={{ width: `${percent}%` }} />
      </div>
      <div className="relative z-10 mt-4 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-slate-600">
        <span>SYNC {percent}%</span>
        <span>READY</span>
      </div>
    </article>
  );
}

export function TemplateAura({ data }: { data: SiteData }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const hoverRef = useRef({ x: 0, y: 0 });
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const projects = sortByOrder(data.projects);
  const experiences = sortByOrder(data.experiences);
  const skills = sortByOrder(data.skills);
  const awards = sortByOrder(data.awards ?? []).filter((award) => award.title.trim());
  const videos = sortByOrder(data.videos ?? []).filter((video) => video.videoUrl.trim());
  const socials = sortByOrder(data.socialLinks);

  useEffect(() => {
    const root = rootRef.current;
    function onMove(event: MouseEvent) {
      const rect = root?.getBoundingClientRect();
      root?.style.setProperty('--mouse-x', `${rect ? event.clientX - rect.left : event.clientX}px`);
      root?.style.setProperty('--mouse-y', `${rect ? event.clientY - rect.top : event.clientY}px`);
      mouseRef.current = { x: event.clientX / window.innerWidth, y: 1 - event.clientY / window.innerHeight };
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!root || !cursor || !dot) return undefined;
    const cursorElement = cursor;
    const dotElement = dot;
    let raf = 0;
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let dx = cx;
    let dy = cy;

    function onMove(event: MouseEvent) {
      dx = event.clientX;
      dy = event.clientY;
      dotElement.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
    }

    function onOver(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest('.aura-interactive');
      cursorElement.classList.toggle('aura-cursor-active', Boolean(interactive));
      const card = target?.closest('[data-aura-card-index]');
      if (card instanceof HTMLElement) {
        const index = Number(card.dataset.auraCardIndex || 0);
        hoverRef.current = index % 3 === 0 ? { x: -0.5, y: -0.1 } : index % 3 === 1 ? { x: 0, y: -0.4 } : { x: 0.5, y: -0.1 };
      }
    }

    function onOut(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.aura-interactive')) cursorElement.classList.remove('aura-cursor-active');
      if (target?.closest('[data-aura-card-index]')) hoverRef.current = { x: 0, y: 0 };
    }

    function animate() {
      cx += (dx - cx) * 0.18;
      cy += (dy - cy) * 0.18;
      cursorElement.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(animate);
    }

    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseover', onOver);
    root.addEventListener('mouseout', onOut);
    animate();
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseover', onOver);
      root.removeEventListener('mouseout', onOut);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('.aura-reveal'));
    const reveal = (node: HTMLElement) => node.classList.add('aura-visible');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(node);
      } else {
        observer.observe(node);
      }
    });
    return () => observer.disconnect();
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const canvasElement = canvas;
    const context = canvasElement.getContext('2d');
    if (!context) return undefined;
    const ctx = context;
    let frame = 0;
    let raf = 0;
    const particles = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 1.8 + 0.35,
      vx: (Math.random() - 0.5) * 0.0009,
      vy: (Math.random() - 0.5) * 0.0009
    }));
    function resize() {
      canvasElement.width = canvasElement.clientWidth * window.devicePixelRatio;
      canvasElement.height = canvasElement.clientHeight * window.devicePixelRatio;
    }
    function draw() {
      frame += 0.016;
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const width = canvasElement.clientWidth;
      const height = canvasElement.clientHeight;
      const scrollProgress = document.documentElement.scrollHeight > height
        ? window.scrollY / (document.documentElement.scrollHeight - height)
        : 0;
      const mouse = mouseRef.current;
      const flowX = hoverRef.current.x * 0.0018 + (mouse.x - 0.5) * 0.0008;
      const flowY = hoverRef.current.y * 0.0018 + (0.5 - mouse.y) * 0.0008;
      ctx.strokeStyle = 'rgba(73,197,182,.12)';
      for (let i = 0; i < 22; i += 1) {
        const y = height * 0.68 + i * 18;
        ctx.beginPath();
        ctx.moveTo(width * -0.2, y);
        ctx.lineTo(width * 1.2, y + Math.sin(frame * 1.6 + i) * 26);
        ctx.stroke();
      }
      const points = particles.map((particle) => {
        particle.x += particle.vx / particle.z + flowX;
        particle.y += particle.vy / particle.z + flowY + Math.sin(frame * 0.35 + particle.z) * 0.0002;
        if (particle.x < -0.04) particle.x = 1.04;
        if (particle.x > 1.04) particle.x = -0.04;
        if (particle.y < -0.04) particle.y = 1.04;
        if (particle.y > 1.04) particle.y = -0.04;
        const depth = 1 / particle.z;
        return {
          x: particle.x * width,
          y: particle.y * height + Math.sin(frame * 0.6 + particle.x * 8) * 10 * depth + scrollProgress * 28 * depth,
          size: Math.max(0.8, 2.2 * depth),
          alpha: Math.min(0.72, 0.18 + depth * 0.42)
        };
      });
      points.forEach((point, index) => {
        for (let j = index + 1; j < points.length; j += 1) {
          const next = points[j];
          const dx = point.x - next.x;
          const dy = point.y - next.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 88) {
            ctx.globalAlpha = (1 - distance / 88) * 0.16;
            ctx.strokeStyle = index % 5 === 0 ? 'rgba(255,147,152,.45)' : 'rgba(73,197,182,.55)';
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
          }
        }
      });
      points.forEach((point, index) => {
        ctx.globalAlpha = point.alpha;
        ctx.fillStyle = index % 7 === 0 ? 'rgba(255,147,152,.85)' : 'rgba(73,197,182,.85)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      const glowX = width * (0.58 + Math.sin(scrollProgress * Math.PI * 2) * 0.14) + hoverRef.current.x * 70;
      const glowY = height * (0.48 + Math.cos(scrollProgress * Math.PI * 1.4) * 0.1) + hoverRef.current.y * 70;
      const glowRadius = Math.min(width, height) * 0.42;
      const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
      gradient.addColorStop(0, 'rgba(73,197,182,.2)');
      gradient.addColorStop(0.55, 'rgba(255,147,152,.08)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      raf = requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div ref={rootRef} className="aura-root relative min-h-screen overflow-hidden bg-[#030208] px-6 font-mono text-slate-300 selection:bg-[#49c5b6] selection:text-black [--mouse-x:50%] [--mouse-y:50%]">
      <style>{`
        .aura-stage { position: absolute; inset: 0; pointer-events: none; }
        .aura-fixed-layer { position: absolute; inset: 0; pointer-events: none; }
        .aura-scanlines { background: linear-gradient(to bottom, transparent, transparent 50%, rgba(0,243,255,.018) 50%, rgba(0,243,255,.018)); background-size: 100% 4px; }
        .aura-sweep { background: linear-gradient(to bottom, transparent, rgba(73,197,182,.08), transparent); animation: auraScan 10s linear infinite; }
        @keyframes auraScan { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
        .aura-grid { background-size: 50px 50px; background-image: linear-gradient(to right, rgba(73,197,182,.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(73,197,182,.035) 1px, transparent 1px); }
        .aura-screen-corner { position: absolute; z-index: 30; width: 24px; height: 24px; pointer-events: none; border-color: rgba(73,197,182,.3); }
        .aura-screen-corner.tl { top: 16px; left: 16px; border-top: 2px solid; border-left: 2px solid; }
        .aura-screen-corner.tr { top: 16px; right: 16px; border-top: 2px solid; border-right: 2px solid; }
        .aura-screen-corner.bl { bottom: 16px; left: 16px; border-bottom: 2px solid; border-left: 2px solid; }
        .aura-screen-corner.br { bottom: 16px; right: 16px; border-bottom: 2px solid; border-right: 2px solid; }
        .aura-reveal { opacity: 0; transform: translate3d(0, 48px, 0); transition: opacity 1.1s cubic-bezier(.16,1,.3,1), transform 1.1s cubic-bezier(.16,1,.3,1); }
        .aura-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        .aura-cursor { transform: translate3d(var(--mouse-x), var(--mouse-y), 0) translate(-50%, -50%); transition: width .28s ease, height .28s ease, border-color .28s ease, background-color .28s ease; }
        .aura-cursor-dot { transform: translate3d(var(--mouse-x), var(--mouse-y), 0) translate(-50%, -50%); }
        .aura-cursor-active { width: 55px; height: 55px; border-color: #ff9398; background: rgba(255,147,152,.06); }
        .aura-noise { background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px); background-size: 3px 3px; mix-blend-mode: screen; opacity: .05; }
        .aura-panel { clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--aura-panel-accent, #49c5b6) 12%, transparent), inset 0 0 36px rgba(73,197,182,.045), 0 20px 80px rgba(0,0,0,.28); }
        .aura-panel::before { content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--aura-panel-accent, #49c5b6) 18%, transparent), transparent 34%), linear-gradient(120deg, transparent 0%, color-mix(in srgb, var(--aura-panel-accent, #49c5b6) 16%, transparent) 44%, transparent 62%); transform: translateX(-125%); opacity: .9; transition: transform .95s cubic-bezier(.16,1,.3,1); }
        .aura-panel::after { content: ""; position: absolute; inset: 1px; z-index: 0; pointer-events: none; background-image: linear-gradient(rgba(73,197,182,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(73,197,182,.035) 1px, transparent 1px), repeating-linear-gradient(0deg, transparent 0 7px, rgba(255,255,255,.025) 8px); background-size: 18px 18px, 18px 18px, auto; opacity: .72; mix-blend-mode: screen; }
        .aura-panel:hover::before { transform: translateX(125%); }
        .aura-panel > :not(style) { position: relative; z-index: 1; }
        .aura-skill-card { clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--skill-accent) 14%, transparent), inset 0 0 36px rgba(73,197,182,.045), 0 20px 80px rgba(0,0,0,.28); transition: transform .55s cubic-bezier(.16,1,.3,1), border-color .55s cubic-bezier(.16,1,.3,1), box-shadow .55s cubic-bezier(.16,1,.3,1); }
        .aura-skill-card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, transparent 0%, color-mix(in srgb, var(--skill-accent) 17%, transparent) 45%, transparent 62%); transform: translateX(-120%); transition: transform .85s cubic-bezier(.16,1,.3,1); }
        .aura-skill-card::after { content: ""; position: absolute; inset: 1px; pointer-events: none; background: radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--skill-accent) 17%, transparent), transparent 34%), linear-gradient(rgba(73,197,182,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(73,197,182,.03) 1px, transparent 1px), repeating-linear-gradient(0deg, transparent 0 7px, rgba(255,255,255,.025) 8px); background-size: auto, 18px 18px, 18px 18px, auto; opacity:.78; }
        .aura-skill-card:hover { transform:translateY(-6px); border-color: color-mix(in srgb, var(--skill-accent) 75%, transparent); box-shadow:0 0 46px color-mix(in srgb, var(--skill-accent) 18%, transparent), inset 0 0 30px color-mix(in srgb, var(--skill-accent) 7%, transparent); }
        .aura-skill-card:hover::before { transform: translateX(120%); }
        .aura-skill-orb { width: 58px; height: 58px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 999px; color: white; font-size: 15px; font-weight: 800; background: conic-gradient(var(--skill-accent) var(--skill-percent), rgba(255,255,255,.08) 0), radial-gradient(circle, #04030a 58%, transparent 60%); box-shadow: 0 0 24px color-mix(in srgb, var(--skill-accent) 38%, transparent); }
        .aura-skill-orb span { display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid rgba(255,255,255,.08); border-radius: 999px; background: rgba(4,3,10,.92); }
        @media (hover: hover) and (pointer: fine) { .aura-root { cursor: none; } .aura-root a, .aura-root button { cursor: none; } }
      `}</style>
      <canvas ref={canvasRef} className="aura-stage z-0 h-full w-full" />
      <div className="aura-fixed-layer aura-grid z-[1]" />
      <div className="aura-fixed-layer z-[2] opacity-70" style={{ background: 'radial-gradient(circle 350px at var(--mouse-x) var(--mouse-y), rgba(73,197,182,.13), transparent 80%)' }} />
      <div className="aura-fixed-layer aura-noise z-20" />
      <div className="aura-fixed-layer aura-scanlines z-50" />
      <div className="aura-fixed-layer aura-sweep z-50" />
      <div className="aura-screen-corner tl" />
      <div className="aura-screen-corner tr" />
      <div className="aura-screen-corner bl" />
      <div className="aura-screen-corner br" />
      <div ref={cursorRef} className="aura-cursor pointer-events-none fixed left-0 top-0 z-[60] hidden h-5 w-5 rounded-full border border-[#49c5b6]/50 md:block" />
      <div ref={cursorDotRef} className="aura-cursor-dot pointer-events-none fixed left-0 top-0 z-[61] hidden h-1.5 w-1.5 rounded-full bg-[#49c5b6] md:block" />
      <nav className="fixed left-0 top-0 z-40 flex w-full items-center justify-between border-b border-white/5 px-6 py-5 backdrop-blur-md md:px-10">
        <a href="#home" className="aura-interactive text-sm font-bold tracking-[0.22em] text-white"><ScrambleText>{(data.user.username || data.user.displayName || 'AURA').toUpperCase()}</ScrambleText></a>
        <div className="hidden space-x-10 text-xs tracking-[0.2em] md:flex">
          <a href="#home" className="aura-interactive transition hover:text-[#49c5b6]">INDEX</a>
          <a href="#projects" className="aura-interactive transition hover:text-[#49c5b6]">PROJECTS</a>
          {data.config.showVideos && videos.length ? <a href="#video-section" className="aura-interactive transition hover:text-[#49c5b6]">REELS</a> : null}
          {data.config.showAwards && awards.length ? <a href="#awards" className="aura-interactive transition hover:text-[#49c5b6]">AWARDS</a> : null}
          {data.config.showExperience && experiences.length ? <a href="#resume" className="aura-interactive transition hover:text-[#49c5b6]">BIOGRAPHY</a> : null}
        </div>
        <div className="border border-[#49c5b6]/30 px-3 py-1 text-xs text-[#49c5b6]">CORE_V3.0</div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl">
        <section id="home" className="flex min-h-screen flex-col items-start justify-center pt-20">
          <div className="aura-reveal mb-8 border-l-2 border-[#49c5b6] pl-6">
            <p className="mb-1 text-xs uppercase tracking-[0.4em] text-[#49c5b6]">{data.user.title || 'SYSTEM ONLINE // CORE_V3'}</p>
            <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{data.user.location || 'GPU MULTI-AXIS WAVE DEFORMATION'}</span>
          </div>
          <h1 className="aura-reveal mb-6 text-5xl font-bold leading-none tracking-tighter text-white md:text-8xl">
            <ScrambleText>{data.user.displayName || 'CYBERNETIC'}</ScrambleText><br />
            <span className="bg-gradient-to-r from-[#49c5b6] via-[#a3e635] to-[#ff9398] bg-clip-text text-transparent">{data.user.bio || 'METAVERSE'}</span>
          </h1>
          <p className="aura-reveal mb-8 max-w-md text-xs leading-7 text-slate-400">{data.user.fullBio || 'A cyber terminal portfolio for spatial interfaces, multimedia demos, and high-signal creative systems.'}</p>
          <a href="#projects" className="aura-interactive aura-reveal relative inline-block border border-[#49c5b6]/40 px-8 py-4 text-xs tracking-[0.22em] text-[#49c5b6] transition hover:bg-[#49c5b6] hover:text-black">
            <CornerFrame /> INITIALIZE SCAN //
          </a>
        </section>

        <section id="projects" className="border-t border-white/5 py-28">
          <div className="aura-reveal mb-16"><p className="mb-2 text-xs tracking-[0.22em] text-[#49c5b6]">// SELECTED TELEMETRY</p><h2 className="text-4xl font-bold text-white"><ScrambleText>CORE DATA MATRIX</ScrambleText></h2></div>
          <div className={`grid grid-cols-1 gap-8 ${data.config.layout === 'list' ? '' : 'md:grid-cols-3'}`}>
            {projects.map((project, index) => <ProjectNode key={project.id || project.slug} project={project} index={index} />)}
          </div>
        </section>

        {data.config.showVideos && videos.length ? (
          <section id="video-section" className="border-t border-white/5 py-28">
            <div className="aura-reveal mb-14"><p className="mb-2 text-xs tracking-[0.22em] text-[#49c5b6]">// REELS & DEMOS</p><h2 className="text-4xl font-bold text-white"><ScrambleText>MULTIMEDIA TERMINAL</ScrambleText></h2></div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">{videos.map((video) => <VideoTerminal key={video.id || video.videoUrl} video={video} onOpen={setSelectedVideo} />)}</div>
          </section>
        ) : null}

        {data.config.showAwards && awards.length ? (
          <section id="awards" className="border-t border-white/5 py-28">
            <div className="aura-reveal mb-14"><p className="mb-2 text-xs tracking-[0.22em] text-[#49c5b6]">// RECOGNITION LOG</p><h2 className="text-4xl font-bold text-white"><ScrambleText>HONOR DATA VAULT</ScrambleText></h2></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{awards.map((award, index) => <AwardTerminal key={award.id || award.title} award={award} index={index} />)}</div>
          </section>
        ) : null}

        {data.config.showExperience && experiences.length ? (
          <section id="resume" className="border-t border-white/5 py-28">
            <div className="aura-reveal mb-16"><p className="mb-2 text-xs tracking-[0.22em] text-[#49c5b6]">// EXPERIENCE CHRONOLOGY</p><h2 className="text-4xl font-bold text-white"><ScrambleText>BIOGRAPHY DATABASE</ScrambleText></h2></div>
            <div className="relative space-y-14 border-l border-white/10 pl-8 md:pl-12">
              {experiences.map((experience, index) => (
                <article key={experience.id || experience.company} className="aura-reveal relative">
                  <span className="absolute -left-[41px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-[#49c5b6] bg-[#030208] md:-left-[57px]"><span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#49c5b6]" /></span>
                  <div className="mb-2 flex flex-col justify-between gap-1 md:flex-row md:items-center">
                    <span className="text-xs font-bold tracking-[0.18em]" style={{ color: index % 2 ? pink : cyan }}>{experience.startDate}{experience.isCurrent ? ' - PRESENT' : experience.endDate ? ` - ${experience.endDate}` : ''}</span>
                    <span className="text-[10px] uppercase text-slate-500">{experience.company}</span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{experience.position}</h3>
                  {experience.description ? <p className="max-w-3xl whitespace-pre-line text-xs leading-7 text-slate-400">{experience.description}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.config.showSkills && skills.length ? (
          <section id="skills" className="border-t border-white/5 py-28">
            <div className="aura-reveal mb-14"><p className="mb-2 text-xs tracking-[0.22em] text-[#49c5b6]">// CAPABILITY STACK</p><h2 className="text-4xl font-bold text-white"><ScrambleText>SKILL PROTOCOLS</ScrambleText></h2></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {skills.map((skill, index) => <SkillProtocolCard key={skill.id || skill.name} skill={skill} index={index} />)}
            </div>
          </section>
        ) : null}

        <section id="contact" className="border-t border-white/5 py-28 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-6xl"><ScrambleText>CONNECT TO PORT</ScrambleText></h2>
          <p className="mx-auto mb-10 max-w-sm text-xs leading-7 text-slate-500">Establish a secure channel for collaboration, roles, or experimental digital systems.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {data.user.email ? <a href={`mailto:${data.user.email}`} className="aura-interactive inline-flex items-center gap-2 border border-[#49c5b6] px-6 py-4 text-xs tracking-[0.18em] text-[#49c5b6] transition hover:bg-[#49c5b6] hover:text-black"><Mail className="h-4 w-4" /> EMAIL</a> : null}
            {data.user.location ? <span className="inline-flex items-center gap-2 border border-white/10 px-6 py-4 text-xs text-slate-500"><MapPin className="h-4 w-4" /> {data.user.location}</span> : null}
            {socials.map((social) => <a key={social.id || social.url} href={social.url} className="aura-interactive border border-white/10 px-6 py-4 text-xs tracking-[0.18em] text-slate-400 transition hover:border-[#49c5b6] hover:text-[#49c5b6]">{social.platform}</a>)}
          </div>
        </section>
      </main>

      {selectedVideo ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <button type="button" onClick={() => setSelectedVideo(null)} className="aura-interactive absolute right-8 top-8 border border-white/10 px-4 py-2 text-xs tracking-[0.18em] text-white transition hover:border-[#49c5b6] hover:text-[#49c5b6]">CLOSE_STREAM [X]</button>
          <div className="relative aspect-video w-full max-w-4xl border border-white/10 bg-black shadow-2xl">
            <video className="h-full w-full object-cover" src={selectedVideo.videoUrl} poster={selectedVideo.thumbnailUrl} controls autoPlay loop playsInline />
          </div>
        </div>
      ) : null}

      <footer className="relative border-t border-white/5 py-10 text-center text-[10px] tracking-[0.2em] text-slate-600">
        2026 {data.user.displayName || 'AURA STUDIO'}. CORE ENGINE POWERED BY SITEFORGE.
      </footer>
    </div>
  );
}
