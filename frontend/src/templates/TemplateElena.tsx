import { ArrowRight, Github, Linkedin, Mail, MapPin, Sparkles } from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { getOrderedSections, getSectionCopy } from '@siteforge/shared';
import type { Award, Project, SiteData, SocialLink, VideoItem } from '@siteforge/shared';

const accent = '#00E699';
const bg = '#04130f';
const panel = '#09221b';
const muted = '#899E97';

function iconForSocial(link: SocialLink) {
  const key = `${link.icon || link.platform}`.toLowerCase();
  if (key.includes('github')) return <Github className="h-4 w-4" />;
  if (key.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
  if (key.includes('mail') || key.includes('email')) return <Mail className="h-4 w-4" />;
  return <ArrowRight className="h-4 w-4" />;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url);
}

function handleTilt(event: MouseEvent<HTMLElement>) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const rotateX = (rect.height / 2 - y) / 42;
  const rotateY = (x - rect.width / 2) / 42;
  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
  card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.003, 1.003, 1.003)`;
}

function resetTilt(event: MouseEvent<HTMLElement>) {
  event.currentTarget.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
}

function ScrambleLink({ href, label }: { href: string; label: string }) {
  const [text, setText] = useState(label);
  const intervalRef = useRef<number | null>(null);

  function scramble() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let iteration = 0;
    intervalRef.current = window.setInterval(() => {
      setText(
        label
          .split('')
          .map((letter, index) => (index < iteration ? label[index] : letter === ' ' ? ' ' : letters[Math.floor(Math.random() * letters.length)]))
          .join('')
      );
      if (iteration >= label.length && intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      iteration += 1 / 3;
    }, 30);
  }

  useEffect(() => () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  }, []);

  return (
    <a href={href} onMouseEnter={scramble} className="tracking-[0.18em] text-[#899E97] transition hover:text-[#00E699]">
      {text}
    </a>
  );
}

function HighlightedHeroTitle({ text }: { text: string }) {
  const keyword = '创意和技术';
  if (!text.includes(keyword)) return <>{text}</>;
  const [before, after] = text.split(keyword);
  return (
    <>
      {before}
      <span className="text-[#00E699]">{keyword}</span>
      {after}
    </>
  );
}

function TiltCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <article
      className={`elena-tilt-card elena-reveal rounded-3xl border border-white/5 bg-[#09221b]/40 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-transform duration-500 ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
    >
      {children}
    </article>
  );
}

function ProjectCard({ project, index, layout }: { project: Project; index: number; layout: SiteData['config']['layout'] }) {
  const isWide = layout !== 'list' && project.isFeatured;
  const gallery = [...(project.images ?? [])].filter((image) => image.imageUrl.trim()).sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 4);
  return (
    <TiltCard className={`group flex min-h-[460px] flex-col justify-between p-8 ${isWide ? 'lg:col-span-8' : 'lg:col-span-4'} ${layout === 'list' ? 'lg:col-span-12' : ''}`} delay={(index % 3) * 100}>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white transition group-hover:text-[#00E699]">{project.title || 'Untitled Project'}</h3>
          <p className="mt-2 text-xs text-[#899E97]">{project.category}{project.role ? ` / ${project.role}` : ''}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {project.isFeatured ? <span className="rounded-full border border-[#00E699]/25 bg-[#00E699]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00E699]">Featured</span> : null}
          {(project.startDate || project.endDate) ? <span className="rounded-full border border-white/10 bg-[#04130f] px-3 py-1.5 font-mono text-xs text-white">{project.endDate || project.startDate}</span> : null}
        </div>
      </div>
      <div className="relative z-10 mt-10 h-80 overflow-hidden rounded-2xl border border-white/5 bg-black/30">
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover brightness-110 saturate-110 transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-[#899E97]">Select Cover Image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04130f]/70 via-transparent to-transparent opacity-55" />
        <div className="absolute inset-0 bg-[#00e699]/0 mix-blend-soft-light transition duration-500 group-hover:bg-[#00e699]/6" />
      </div>
      {project.description ? <p className="relative z-10 mt-5 text-sm leading-7 text-[#899E97]">{project.description}</p> : null}
      {gallery.length ? (
        <div className="relative z-10 mt-5 grid grid-cols-2 gap-3">
          {gallery.map((image) => (
            <a key={image.id || image.imageUrl} href={image.imageUrl} target="_blank" rel="noreferrer" className="group/gallery overflow-hidden rounded-2xl border border-white/5 bg-black/30">
              <img src={image.imageUrl} alt={image.caption || project.title} className="h-28 w-full object-cover brightness-110 saturate-110 transition duration-500 group-hover/gallery:scale-105" />
              {image.caption ? <span className="block px-3 py-2 text-[11px] font-semibold text-[#899E97]">{image.caption}</span> : null}
            </a>
          ))}
        </div>
      ) : null}
    </TiltCard>
  );
}

function VideoCard({ video, index }: { video: VideoItem; index: number }) {
  return (
    <TiltCard className={`overflow-hidden ${video.isFeatured ? 'lg:col-span-8' : 'lg:col-span-4'}`} delay={(index % 3) * 100}>
      <div className="relative z-10 h-80 overflow-hidden border-b border-white/5 bg-black/30">
        {isDirectVideoUrl(video.videoUrl) ? (
          <video src={video.videoUrl} poster={video.thumbnailUrl} controls className="h-full w-full object-cover" />
        ) : (
          <a href={video.videoUrl} target="_blank" rel="noreferrer" className="group/video relative block h-full">
            {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover brightness-110 saturate-110 transition duration-700 group-hover/video:scale-105" /> : <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-[#899E97]">Open Video</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-[#04130f]/75 via-transparent to-transparent opacity-60" />
            <span className="absolute left-5 top-5 rounded-full border border-white/10 bg-[#04130f]/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#00E699]">{video.platform}</span>
            <span className="absolute bottom-5 left-5 rounded-full bg-[#00E699] px-4 py-2 text-xs font-black tracking-[0.16em] text-black">WATCH</span>
          </a>
        )}
      </div>
      <div className="relative z-10 space-y-3 p-8">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{video.platform}</span>
        <h3 className="font-display text-2xl font-bold text-white">{video.title || 'Video Showcase'}</h3>
        {video.description ? <p className="text-sm leading-7 text-[#899E97]">{video.description}</p> : null}
      </div>
    </TiltCard>
  );
}

function AwardCard({ award, index }: { award: Award; index: number }) {
  return (
    <TiltCard className="group p-7" delay={(index % 3) * 100}>
      <div className="relative z-10 space-y-7">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#00E699]/20 bg-[#00E699]/12 font-display text-lg font-black text-[#00E699]">★</span>
          {award.date ? <span className="rounded-full border border-white/10 bg-[#04130f] px-3 py-1.5 font-mono text-xs text-[#899E97]">{award.date}</span> : null}
        </div>
        <div className="space-y-3">
          {award.issuer ? <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{award.issuer}</p> : null}
          <h3 className="font-display text-2xl font-bold leading-tight text-white transition group-hover:text-[#00E699]">{award.title || 'Untitled Award'}</h3>
          {award.description ? <p className="text-sm leading-7 text-[#899E97]">{award.description}</p> : null}
        </div>
      </div>
    </TiltCard>
  );
}

export function TemplateElena({ data }: { data: SiteData }) {
  const { user, config } = data;
  const projects = [...data.projects].sort((a, b) => a.displayOrder - b.displayOrder);
  const skills = [...data.skills].sort((a, b) => a.displayOrder - b.displayOrder);
  const previewSkills = skills.slice(0, 6);
  const hiddenSkillCount = Math.max(0, skills.length - previewSkills.length);
  const awards = [...(data.awards ?? [])].filter((award) => award.title.trim()).sort((a, b) => a.displayOrder - b.displayOrder);
  const experiences = [...data.experiences].sort((a, b) => a.displayOrder - b.displayOrder);
  const socials = [...data.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);
  const videos = [...(data.videos ?? [])].filter((video) => video.videoUrl.trim()).sort((a, b) => a.displayOrder - b.displayOrder);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const identityLabel = user.title || '设计师 / 开发者';
  const heroMainTitle = user.bio || '用创意和技术构建美好数字体验';
  const projectsCopy = getSectionCopy(data, 'projects', { label: '[ SELECTED PORTFOLIO ]', title: 'Recent visual codes crafted with technical depth' });
  const videosCopy = getSectionCopy(data, 'videos', { label: '[ MOTION PROOF ]', title: 'Project stories shown through video' });
  const awardsCopy = getSectionCopy(data, 'awards', { label: '[ RECOGNITION ]', title: 'Honors and signals earned through the work' });
  const experienceCopy = getSectionCopy(data, 'experience', { label: '[ THE PROCESS ]', title: 'Experience built around strategic goals' });
  const skillsCopy = getSectionCopy(data, 'skills', { label: '[ SKILL STACK ]', title: 'Capabilities shaped by hands-on project work' });
  const contactCopy = getSectionCopy(data, 'contact', { label: '[ CONTACT ]', title: 'Invest in the most important asset you have.', description: 'If the work resonates, reach out for project collaboration, role opportunities, or a creative conversation.' });
  const sectionOrder = Object.fromEntries(getOrderedSections(data).map((section, index) => [section, index])) as Record<string, number>;
  const navTargets: Record<string, string> = { projects: 'works', videos: 'videos', awards: 'awards', experience: 'process', skills: 'skills', contact: 'contact' };
  const navLabels: Record<string, string> = { projects: 'SELECTED WORKS', videos: 'VIDEO', awards: 'AWARDS', experience: 'THE PROCESS', skills: 'SKILLS', contact: 'CONTACT' };
  const navSections = getOrderedSections(data).filter((section) => {
    if (section === 'projects') return projects.length;
    if (section === 'videos') return config.showVideos && videos.length;
    if (section === 'awards') return config.showAwards && awards.length;
    if (section === 'experience') return config.showExperience && experiences.length;
    if (section === 'skills') return config.showSkills && skills.length;
    return section === 'contact';
  });

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.elena-reveal'));
    const reveal = (element: HTMLElement) => element.classList.add('visible');

    if (!('IntersectionObserver' in window)) {
      elements.forEach(reveal);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(element);
      } else {
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, [data]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_28%_18%,rgba(0,230,153,0.18),transparent_34%),linear-gradient(135deg,#04130f_0%,#061811_48%,#020807_100%)] px-6 font-sans text-white selection:bg-[#00E699] selection:text-black">
      <style>{`
        .font-display { font-family: 'Plus Jakarta Sans', Inter, sans-serif; }
        .elena-reveal { opacity: 0; transform: translateY(40px); transition: opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1); }
        .elena-reveal.visible { opacity: 1; transform: translateY(0); }
        .elena-tilt-card { position: relative; transform-style: preserve-3d; }
        .elena-tilt-card::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: radial-gradient(120px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(0,230,153,.22), transparent 72%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: 0; transition: opacity .35s; }
        .elena-tilt-card:hover::after { opacity: .55; }
        .elena-fluid { background: linear-gradient(135deg, #09221b 0%, #00e699 50%, #04130f 100%); background-size: 200% 200%; animation: elenaFluid 12s ease infinite; }
        @keyframes elenaFluid { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.045] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="pointer-events-none absolute left-[-15%] top-0 -z-0 h-[700px] w-[60%] rounded-full bg-[radial-gradient(circle,rgba(0,230,153,0.14)_0%,rgba(4,19,15,0)_70%)] blur-[140px]" />
      <div className="pointer-events-none absolute right-[-15%] top-[1500px] -z-0 h-[800px] w-[50%] rounded-full bg-[radial-gradient(circle,rgba(0,230,153,0.12)_0%,rgba(4,19,15,0)_70%)] blur-[140px]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between py-6">
        <a href="#hero" className="font-display text-xl font-extrabold tracking-tight text-[#00E699]">
          {(user.username || user.displayName || 'creator').toLowerCase()}<span className="text-white">.</span>
        </a>
        <nav className="hidden items-center gap-10 text-xs font-semibold md:flex">
          <ScrambleLink href="#hero" label="HOME" />
          {navSections.map((section) => <ScrambleLink key={section} href={`#${navTargets[section]}`} label={navLabels[section]} />)}
        </nav>
        <a href="#contact" className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold tracking-[0.16em] text-black transition hover:bg-[#00E699]">
          LET'S TALK
        </a>
      </header>

      <section id="hero" className="relative z-10 mx-auto grid min-h-[85vh] max-w-7xl grid-cols-1 items-center gap-12 pb-24 pt-12 lg:grid-cols-12 lg:gap-16">
        <div className="elena-reveal z-10 flex min-h-[560px] flex-col justify-center space-y-8 lg:col-span-8">
          <div className="space-y-5">
            <p className="font-display text-sm font-medium uppercase tracking-[0.32em] text-[#00E699] md:text-[18px]">{identityLabel}</p>
            <h1 className="font-display max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight md:text-7xl">
              <HighlightedHeroTitle text={heroMainTitle} />
            </h1>
          </div>
          <div className="max-w-xl space-y-7">
            <p className="text-sm leading-relaxed text-[#899E97] md:text-base">{user.fullBio || 'A dark, interactive portfolio built around visual craft, motion, and technical depth.'}</p>
            <a href="#works" className="inline-flex min-w-[210px] items-center justify-center gap-3 rounded-full bg-[#00E699] px-8 py-4 text-xs font-bold tracking-[0.2em] text-black transition hover:shadow-lg hover:shadow-[#00e699]/30">
              EXPLORE WORK <span aria-hidden="true">→</span>
            </a>
          </div>
          {config.showSkills && skills.length ? (
            <div className="flex flex-wrap items-center gap-3 pt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E699]">
              {skills.slice(0, 5).map((skill) => (
                <div key={skill.id || skill.name} className="rounded-full border border-white/10 bg-[#09221b]/45 px-4 py-2 backdrop-blur-xl"><span className="mr-2 opacity-40">◆</span>{skill.name}</div>
              ))}
            </div>
          ) : null}
        </div>
        <TiltCard className="elena-reveal relative ml-auto h-[420px] w-full overflow-hidden md:h-[540px] lg:col-span-4 lg:w-[92%]" delay={150}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.displayName} className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-105 transition duration-700 hover:scale-105" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-[#04130f]/85 via-[#04130f]/28 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04130f]/85 via-transparent to-transparent opacity-55" />
          <div className="absolute inset-0 bg-[#00e699]/5 mix-blend-soft-light" />
          <div className="absolute bottom-6 left-6 z-10 w-[min(280px,calc(100%-48px))] space-y-1 rounded-2xl border border-white/10 bg-[#09221b]/55 p-5 shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">[ IN ACTION ]</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00E699]" />
            </div>
            <p className="text-sm font-light text-[#899E97]">{user.location || 'Merging high design with high performance engineering.'}</p>
          </div>
        </TiltCard>
      </section>

      {false ? (
        <section className="elena-reveal relative z-10 -mx-6 mb-16 border-y border-white/5 bg-[#09221b]/20 py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E699]">
            {skills.slice(0, 5).map((skill) => (
              <div key={skill.id || skill.name} className="flex items-center gap-2"><span className="opacity-40">◆</span><span>{skill.name}</span></div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-col">
      <section id="works" className="relative z-10 mx-auto max-w-7xl space-y-12 py-20" style={{ order: sectionOrder.projects }}>
        <div className="elena-reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{projectsCopy.label}</span>
            <h2 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">{projectsCopy.title}</h2>
            {projectsCopy.description ? <p className="max-w-xl text-sm leading-7 text-[#899E97]">{projectsCopy.description}</p> : null}
          </div>
        </div>
        <div className={`grid grid-cols-1 gap-8 ${config.layout === 'list' ? 'lg:grid-cols-1' : 'lg:grid-cols-12'}`}>
          {projects.map((project, index) => <ProjectCard key={project.id || project.slug} project={project} index={index} layout={config.layout} />)}
        </div>
      </section>

      {config.showVideos && videos.length ? (
        <section id="videos" className="relative z-10 mx-auto max-w-7xl space-y-12 py-20" style={{ order: sectionOrder.videos }}>
          <div className="elena-reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{videosCopy.label}</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">{videosCopy.title}</h2>
              {videosCopy.description ? <p className="max-w-xl text-sm leading-7 text-[#899E97]">{videosCopy.description}</p> : null}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {videos.map((video, index) => <VideoCard key={video.id || video.videoUrl} video={video} index={index} />)}
          </div>
        </section>
      ) : null}

      {config.showAwards && awards.length ? (
        <section id="awards" className="relative z-10 mx-auto max-w-7xl space-y-12 py-20" style={{ order: sectionOrder.awards }}>
          <div className="elena-reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{awardsCopy.label}</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">{awardsCopy.title}</h2>
              {awardsCopy.description ? <p className="max-w-xl text-sm leading-7 text-[#899E97]">{awardsCopy.description}</p> : null}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {awards.map((award, index) => <AwardCard key={award.id || award.title} award={award} index={index} />)}
          </div>
        </section>
      ) : null}

      {config.showExperience && experiences.length ? (
        <section id="process" className="relative z-10 mx-auto max-w-7xl space-y-16 py-20" style={{ order: sectionOrder.experience }}>
          <div className="elena-reveal space-y-4 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{experienceCopy.label}</span>
            <h2 className="font-display text-3xl font-extrabold md:text-5xl">{experienceCopy.title}</h2>
            {experienceCopy.description ? <p className="mx-auto max-w-xl text-sm leading-7 text-[#899E97]">{experienceCopy.description}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {experiences.slice(0, 4).map((experience, index) => (
              <TiltCard key={experience.id || experience.company} className="space-y-8 p-8 md:p-10" delay={(index % 2) * 100}>
                <div className="relative z-10 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{experience.type} / {experience.startDate}{experience.isCurrent ? ' - Now' : experience.endDate ? ` - ${experience.endDate}` : ''}</span>
                  <h3 className="font-display text-2xl font-bold">{experience.position}</h3>
                  <p className="text-sm font-semibold text-[#899E97]">{experience.company}</p>
                  {experience.description ? <p className="whitespace-pre-line text-sm leading-7 text-[#899E97]">{experience.description}</p> : null}
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      ) : null}

      {config.showSkills && skills.length ? (
        <section id="skills" className="relative z-10 mx-auto max-w-7xl space-y-16 py-20" style={{ order: sectionOrder.skills }}>
          <div className="elena-reveal space-y-4 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{skillsCopy.label}</span>
            <h2 className="font-display text-3xl font-extrabold md:text-5xl">{skillsCopy.title}</h2>
            {skillsCopy.description ? <p className="mx-auto max-w-xl text-sm leading-7 text-[#899E97]">{skillsCopy.description}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {previewSkills.map((skill, index) => (
              <TiltCard key={skill.id || skill.name} className="flex flex-col justify-between space-y-8 p-6" delay={index * 100}>
                <div className="elena-fluid relative z-10 flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-white/5">
                  <span className="font-display select-none text-2xl font-black tracking-[0.2em] text-white/25">{skill.category || 'CRAFT'}</span>
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display text-xl font-bold text-white">{skill.name || 'Untitled Skill'}</h3>
                    <span className="rounded-full border border-white/10 bg-[#04130f] px-3 py-1.5 font-mono text-xs text-[#00E699]">{skill.proficiency}/5</span>
                  </div>
                  {skill.category ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00E699]">{skill.category}</p> : null}
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#00E699]" style={{ width: `${skill.proficiency * 20}%` }} />
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
          {hiddenSkillCount ? (
            <div className="text-center">
              <button type="button" onClick={() => setShowAllSkills(true)} className="rounded-full border border-[#00E699]/30 bg-[#00E699]/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#00E699] transition hover:bg-[#00E699] hover:text-black">
                View all skills +{hiddenSkillCount}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      <section id="contact" className="relative z-10 mx-auto max-w-7xl pb-28" style={{ order: sectionOrder.contact }}>
        <TiltCard className="elena-reveal overflow-hidden p-8 md:p-16">
          <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">{contactCopy.label}</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">{contactCopy.title}</h2>
              {contactCopy.description ? <p className="max-w-md text-sm leading-7 text-[#899E97]">{contactCopy.description}</p> : null}
              <div className="flex flex-wrap gap-3">
                {user.email ? <a href={`mailto:${user.email}`} className="inline-flex items-center gap-2 rounded-full bg-[#00E699] px-5 py-3 text-xs font-bold tracking-[0.16em] text-black"><Mail className="h-4 w-4" /> EMAIL</a> : null}
                {user.location ? <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-xs text-[#899E97]"><MapPin className="h-4 w-4" /> {user.location}</span> : null}
              </div>
            </div>
            <div className="space-y-4 lg:col-span-6">
              {socials.map((link) => (
                <a key={link.id || link.url} href={link.url} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#04130f]/60 px-5 py-4 text-sm text-white transition hover:border-[#00E699]">
                  <span className="inline-flex items-center gap-3">{iconForSocial(link)} {link.platform}</span>
                  <ArrowRight className="h-4 w-4 text-[#00E699]" />
                </a>
              ))}
            </div>
          </div>
        </TiltCard>
      </section>
      </div>

      {showAllSkills ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#04130f]/88 p-4 backdrop-blur-xl" role="dialog" aria-modal="true" onClick={() => setShowAllSkills(false)}>
          <div className="max-h-[86vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#09221b]/95 p-6 shadow-2xl shadow-black/40 md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E699]">[ Full Skill Stack ]</p>
                <h3 className="font-display mt-3 text-3xl font-extrabold text-white">Capabilities</h3>
              </div>
              <button type="button" onClick={() => setShowAllSkills(false)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-[#899E97] transition hover:border-[#00E699] hover:text-[#00E699]">Close</button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {skills.map((skill) => (
                <div key={skill.id || skill.name} className="rounded-2xl border border-white/10 bg-[#04130f]/70 p-5">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h4 className="font-display font-bold text-white">{skill.name || 'Untitled Skill'}</h4>
                    <span className="rounded-full border border-white/10 bg-[#09221b] px-3 py-1 text-xs text-[#00E699]">{skill.proficiency}/5</span>
                  </div>
                  {skill.category ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#00E699]">{skill.category}</p> : null}
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#00E699]" style={{ width: `${skill.proficiency * 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <footer className="-mx-6 border-t border-white/5 py-8 text-center text-xs text-[#899E97]">
        <p>© 2026 {user.displayName || 'Personal Portfolio'}. Crafted with SiteForge.</p>
      </footer>
    </div>
  );
}
