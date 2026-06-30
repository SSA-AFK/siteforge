import { ArrowRight, Mail, MapPin, Play, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Project, SiteData, VideoItem } from '@siteforge/shared';

const fallbackHero = 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=1600&q=80';
const fallbackProject = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80';

function sortByOrder<T extends { displayOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url);
}

function projectImage(project?: Project) {
  return project?.coverImage || project?.images?.find((image) => image.imageUrl)?.imageUrl || fallbackProject;
}

function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`solace-spotlight relative overflow-hidden ${className}`}>{children}</div>;
}

function VideoCard({ video }: { video: VideoItem }) {
  const direct = isDirectVideoUrl(video.videoUrl);
  return (
    <article className="solace-reveal overflow-hidden rounded-[2rem] border border-white/10 bg-[#021b13]/80 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-black/50">
        {direct ? (
          <video className="h-full w-full object-cover" src={video.videoUrl} poster={video.thumbnailUrl} controls />
        ) : (
          <a href={video.videoUrl} target="_blank" rel="noreferrer" className="solace-interactive block h-full w-full">
            {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover brightness-110" /> : null}
            <span className="absolute inset-0 grid place-items-center bg-black/35">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-[#00f294] bg-[#00f294]/10 text-[#00f294]"><Play className="h-5 w-5 fill-current" /></span>
            </span>
          </a>
        )}
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#00f294]">{video.platform}</p>
      <h3 className="mt-2 text-xl font-semibold">{video.title || 'Video'}</h3>
      {video.description ? <p className="mt-3 text-xs leading-6 text-[#a3e3cc]/75">{video.description}</p> : null}
    </article>
  );
}

export function TemplateSolace({ data }: { data: SiteData }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const projects = useMemo(() => sortByOrder(data.projects).filter((project) => project.status !== 'archived'), [data.projects]);
  const featuredProjects = projects.filter((project) => project.isFeatured);
  const sliderProjects = (featuredProjects.length ? featuredProjects : projects).slice(0, 4);
  const skills = sortByOrder(data.skills).filter((skill) => skill.name.trim());
  const experiences = sortByOrder(data.experiences).filter((experience) => experience.position || experience.company);
  const awards = sortByOrder(data.awards ?? []).filter((award) => award.title.trim());
  const videos = sortByOrder(data.videos ?? []).filter((video) => video.videoUrl.trim());
  const socials = sortByOrder(data.socialLinks);
  const heroImages = (data.config.heroImages ?? []).filter(Boolean);
  const heroImage = heroImages[0] || data.user.avatarUrl || fallbackHero;
  const [activeSlide, setActiveSlide] = useState(0);
  const activeProject = sliderProjects[activeSlide] ?? projects[0];

  useEffect(() => {
    if (sliderProjects.length <= 1) return undefined;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % sliderProjects.length), 6000);
    return () => window.clearInterval(timer);
  }, [sliderProjects.length]);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!root || !cursor) return undefined;
    const rootElement = root;
    const cursorElement = cursor;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    function onMove(event: MouseEvent) {
      tx = event.clientX;
      ty = event.clientY;
      const target = event.target as HTMLElement | null;
      cursorElement.classList.toggle('solace-cursor-active', Boolean(target?.closest('.solace-interactive, a, button')));
      rootElement.querySelectorAll<HTMLElement>('.solace-spotlight').forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
      });
    }

    function animate() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cursorElement.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(animate);
    }

    rootElement.addEventListener('mousemove', onMove);
    animate();
    return () => {
      cancelAnimationFrame(raf);
      rootElement.removeEventListener('mousemove', onMove);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('.solace-reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('solace-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [data, activeSlide]);

  return (
    <div ref={rootRef} className="solace-root relative min-h-screen overflow-hidden bg-[#01110d] font-sans text-white selection:bg-[#00f294] selection:text-[#021b13]">
      <style>{`
        .solace-root { --brand-dark:#021b13; --brand-darker:#01110d; --brand-neon:#00f294; --brand-soft:#a3e3cc; --brand-muted:#637d77; }
        .solace-root::before { content:""; position:fixed; inset:0; pointer-events:none; z-index:1; opacity:.055; background-image:radial-gradient(rgba(255,255,255,.42) 1px, transparent 1px); background-size:4px 4px; mix-blend-mode:screen; }
        .solace-glow { position:absolute; width:520px; height:520px; border-radius:999px; background:radial-gradient(circle, rgba(0,242,148,.12), transparent 68%); filter:blur(72px); pointer-events:none; }
        .solace-glass { background:rgba(2,27,19,.48); backdrop-filter:blur(22px); border:1px solid rgba(255,255,255,.09); box-shadow:inset 0 1px 1px rgba(255,255,255,.1), 0 28px 70px rgba(0,0,0,.34); }
        .solace-spotlight::before { content:""; position:absolute; inset:0; z-index:1; pointer-events:none; opacity:0; transition:opacity .3s ease; background:radial-gradient(420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,242,148,.12), transparent 78%); }
        .solace-spotlight:hover::before { opacity:1; }
        .solace-spotlight > * { position:relative; z-index:2; }
        .solace-reveal { opacity:0; transform:translate3d(0, 42px, 0); transition:opacity .95s cubic-bezier(.16,1,.3,1), transform .95s cubic-bezier(.16,1,.3,1); }
        .solace-visible { opacity:1; transform:translate3d(0, 0, 0); }
        .solace-nav { background:rgba(255,255,255,.78); backdrop-filter:blur(22px); border:1px solid rgba(255,255,255,.58); box-shadow:0 18px 60px rgba(1,17,13,.16); }
        .solace-title-highlight { color:#00f294; text-shadow:0 0 38px rgba(0,242,148,.18); }
        .solace-skill-dock { background:rgba(1,17,13,.62); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,.08); box-shadow:0 18px 60px rgba(0,0,0,.22); }
        .solace-progress { transition:width .45s ease; }
        .solace-cursor { transition:width .24s ease, height .24s ease, border-color .24s ease, background-color .24s ease; }
        .solace-cursor-active { width:48px; height:48px; border-color:#00f294; background:rgba(0,242,148,.06); }
        @media (hover:hover) and (pointer:fine) { .solace-root { cursor:none; } .solace-root a, .solace-root button { cursor:none; } }
      `}</style>
      <div ref={cursorRef} className="solace-cursor pointer-events-none fixed left-0 top-0 z-[80] hidden h-8 w-8 rounded-full border border-white/30 md:block">
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00f294]" />
      </div>

      <section id="home" className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#021b13]">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 blur-[1px] brightness-110 saturate-75 transition duration-[4000ms] hover:scale-105" style={{ backgroundImage: `url("${heroImage}")` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#01110d] via-[#021b13]/75 to-[#021b13]/95" />
        <div className="solace-glow -left-32 -top-32" />
        <div className="solace-glow -right-28 bottom-12" />

        <header className="solace-reveal sticky top-0 z-50 mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between rounded-[1.75rem] px-6 py-4 solace-nav">
          <a href="#home" className="solace-interactive text-xl font-bold tracking-tight text-[#021b13]">{data.user.username || data.user.displayName || 'siteforge'}</a>
          <nav className="hidden items-center gap-8 text-xs font-semibold tracking-[0.28em] text-[#021b13]/60 md:flex">
            <a className="solace-interactive transition hover:text-[#00b875]" href="#home">HOME</a>
            <a className="solace-interactive transition hover:text-[#00b875]" href="#projects">WORK</a>
            {data.config.showSkills && skills.length ? <a className="solace-interactive transition hover:text-[#00b875]" href="#skills">SKILLS</a> : null}
            <a className="solace-interactive transition hover:text-[#00b875]" href="#contact">CONTACT</a>
          </nav>
          <a href="#contact" className="solace-interactive rounded-full border border-[#021b13]/15 px-5 py-2.5 text-xs font-semibold tracking-[0.18em] text-[#021b13] transition hover:border-[#00b875]/50 hover:bg-[#00f294]/15">CONTACT ME</a>
        </header>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-24 pt-20 lg:grid-cols-12">
          <div className="solace-reveal lg:col-span-7">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.36em] text-[#00f294]">{data.user.title || 'Creative Portfolio'}</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-tight text-white md:text-7xl">
              <span className="block text-white/78">{data.user.displayName || 'Your portfolio'}</span>
              <span className="solace-title-highlight block">{data.user.bio || 'Crafting better digital experiences.'}</span>
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#projects" className="solace-interactive inline-flex items-center gap-3 rounded-full bg-[#00f294] px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#021b13] shadow-[0_0_22px_rgba(0,242,148,.35)] transition hover:brightness-110">Explore Work <ArrowRight className="h-4 w-4" /></a>
              {data.user.location ? <span className="rounded-full border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#a3e3cc]/70">{data.user.location}</span> : null}
            </div>
          </div>
          <div className="solace-reveal lg:col-span-5" style={{ transitionDelay: '160ms' }}>
            <div className="solace-glass rounded-[2rem] p-7">
              {data.user.avatarUrl ? <img src={data.user.avatarUrl} alt={data.user.displayName} className="mb-6 h-16 w-16 rounded-2xl object-cover ring-1 ring-white/15" /> : null}
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#00f294]">Portfolio Signal</p>
              <p className="mt-5 max-w-sm text-sm leading-7 text-[#a3e3cc]/78">{data.user.fullBio || 'A refined portfolio template for focused storytelling, selected projects, measurable skills, and polished motion.'}</p>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                <span className="rounded-2xl border border-white/10 bg-white/[.04] p-3"><b className="block text-lg text-white">{projects.length}</b><small className="text-[10px] uppercase tracking-[0.16em] text-white/45">Works</small></span>
                {data.config.showSkills ? <span className="rounded-2xl border border-white/10 bg-white/[.04] p-3"><b className="block text-lg text-white">{skills.length}</b><small className="text-[10px] uppercase tracking-[0.16em] text-white/45">Skills</small></span> : null}
                {data.config.showAwards ? <span className="rounded-2xl border border-white/10 bg-white/[.04] p-3"><b className="block text-lg text-white">{awards.length}</b><small className="text-[10px] uppercase tracking-[0.16em] text-white/45">Honors</small></span> : null}
              </div>
            </div>
          </div>
        </div>

        {skills.length ? (
          <div className="solace-reveal relative z-10 mx-auto w-full max-w-7xl px-6 pb-8">
            <div className="solace-skill-dock flex flex-wrap items-center gap-3 rounded-[1.5rem] p-3 text-xs text-[#a3e3cc]/78">
              {skills.slice(0, 8).map((skill) => (
                <span key={skill.id || skill.name} className="solace-interactive inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 transition hover:border-[#00f294]/50 hover:text-[#00f294]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00f294] shadow-[0_0_12px_rgba(0,242,148,.65)]" />
                  <span>{skill.name}</span>
                  <small className="text-[10px] text-white/35">{skill.proficiency}/5</small>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {sliderProjects.length ? (
        <section id="projects" className="relative overflow-hidden bg-[#01110d] py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
            <div className="solace-reveal flex min-h-[420px] flex-col justify-between lg:col-span-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-[#637d77]">[ Selected Work ]</span>
                <h2 className="mt-6 text-4xl font-light leading-tight tracking-tight md:text-5xl">Confidence starts<br /><span className="font-normal text-[#a3e3cc]">with a focused story</span></h2>
                <a href={activeProject?.projectUrl || '#contact'} className="solace-interactive mt-8 inline-flex rounded-full bg-[#00f294] px-5 py-2.5 text-xs font-bold text-[#021b13] transition hover:brightness-110">View Project</a>
              </div>
              <div className="mt-12 space-y-8">
                <p className="min-h-[72px] max-w-sm text-xs leading-7 text-[#637d77]">{activeProject?.description || activeProject?.content || 'Add projects in the form to drive this slider.'}</p>
                <div className="flex max-w-xs items-center gap-2">
                  {sliderProjects.map((project, index) => (
                    <button key={project.id || project.slug || index} type="button" className="solace-interactive h-[3px] flex-1 overflow-hidden rounded-full bg-white/20" onClick={() => setActiveSlide(index)} aria-label={`Show ${project.title}`}>
                      <span className="solace-progress block h-full bg-[#00f294]" style={{ width: index === activeSlide ? '100%' : '0%' }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <SpotlightCard className="solace-reveal h-[550px] rounded-[2rem] shadow-2xl shadow-black/40 lg:col-span-7">
              <img src={projectImage(activeProject)} alt={activeProject?.title || 'Selected project'} className="h-full w-full object-cover object-center opacity-85 saturate-90 transition duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#01110d]/80 via-transparent to-transparent" />
              <div className="solace-glass absolute bottom-6 left-6 right-6 rounded-2xl p-6 md:left-auto md:w-[340px]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#00f294]">{activeProject?.category || 'Portfolio'}</p>
                <h3 className="mt-3 text-2xl font-semibold">{activeProject?.title || 'Untitled Project'}</h3>
                {activeProject?.role || activeProject?.tools ? <p className="mt-3 text-[11px] leading-6 text-white/65">{activeProject.role}{activeProject.role && activeProject.tools ? ' / ' : ''}{activeProject.tools}</p> : null}
              </div>
            </SpotlightCard>
          </div>
        </section>
      ) : null}

      {data.config.showExperience && experiences.length ? (
        <section className="bg-[#f8faf9] py-24 text-[#021b13]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="solace-reveal mb-14 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-[#637d77]">[ The Process ]</span>
              <h2 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">Experience built<br /><span className="text-slate-400">around real outcomes</span></h2>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {experiences.slice(0, 3).map((experience, index) => (
                <SpotlightCard key={experience.id || experience.company} className={`solace-reveal min-h-[310px] rounded-[2rem] p-8 ${index === 0 ? 'bg-[#021b13] text-white lg:col-span-5' : 'border border-emerald-100 bg-emerald-50/70 text-[#021b13] lg:col-span-7'}`}>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#00f294]">{experience.startDate}{experience.isCurrent ? ' - Now' : experience.endDate ? ` - ${experience.endDate}` : ''}</p>
                  <h3 className="mt-10 text-3xl font-light leading-tight">{experience.position}</h3>
                  <p className="mt-3 text-sm font-semibold text-[#637d77]">{experience.company}</p>
                  {experience.description ? <p className="mt-6 whitespace-pre-line text-sm leading-7 opacity-75">{experience.description}</p> : null}
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {projects.length > sliderProjects.length ? (
        <section className="bg-white py-24 text-[#021b13]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="solace-reveal mb-14 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-[#637d77]">[ The Approach ]</span>
              <h2 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">More work, cleaner proof</h2>
            </div>
            <div className={`grid grid-cols-1 gap-8 ${data.config.layout === 'list' ? '' : 'md:grid-cols-3'}`}>
              {projects.slice(sliderProjects.length).map((project) => (
                <article key={project.id || project.slug} className="solace-reveal group">
                  {project.coverImage ? <a href={project.coverImage} target="_blank" rel="noreferrer" className="solace-interactive block aspect-square overflow-hidden rounded-[2rem] bg-slate-100 shadow-sm"><img src={project.coverImage} alt={project.title} className="h-full w-full object-cover brightness-110 transition duration-700 group-hover:scale-105" /></a> : null}
                  <h3 className="mt-6 text-xl font-semibold">{project.title}</h3>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#637d77]">{project.category}</p>
                  <p className="mt-4 text-xs leading-6 text-[#637d77]">{project.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.config.showVideos && videos.length ? (
        <section className="bg-[#01110d] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="solace-reveal mb-12"><p className="text-xs font-bold uppercase tracking-[0.28em] text-[#00f294]">[ Motion Proof ]</p><h2 className="mt-4 text-4xl font-light">Video showcase</h2></div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">{videos.map((video) => <VideoCard key={video.id || video.videoUrl} video={video} />)}</div>
          </div>
        </section>
      ) : null}

      {((data.config.showSkills && skills.length) || (data.config.showAwards && awards.length)) ? (
        <section id="skills" className="bg-[#f8faf9] py-24 text-[#021b13]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-2">
            {data.config.showSkills && skills.length ? (
              <div className="solace-reveal rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#637d77]">[ Skill Stack ]</p>
                <div className="mt-8 space-y-5">
                  {skills.map((skill) => <div key={skill.id || skill.name}><div className="mb-2 flex justify-between text-sm font-semibold"><span>{skill.name}</span><span>{skill.proficiency}/5</span></div><div className="h-2 overflow-hidden rounded-full bg-emerald-100"><span className="block h-full rounded-full bg-[#00f294]" style={{ width: `${skill.proficiency * 20}%` }} /></div></div>)}
                </div>
              </div>
            ) : null}
            {data.config.showAwards && awards.length ? (
              <div className="solace-reveal rounded-[2rem] bg-[#021b13] p-8 text-white shadow-xl shadow-emerald-950/20">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#00f294]">[ Honors ]</p>
                <div className="mt-8 space-y-5">
                  {awards.map((award) => <article key={award.id || award.title} className="border-t border-white/10 pt-5"><div className="flex items-center gap-3 text-[#00f294]"><Star className="h-4 w-4" /><span className="text-xs font-bold">{award.date || award.issuer}</span></div><h3 className="mt-3 text-lg font-semibold">{award.title}</h3>{award.description ? <p className="mt-2 text-xs leading-6 text-[#a3e3cc]/70">{award.description}</p> : null}</article>)}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section id="contact" className="relative overflow-hidden bg-[#01110d] py-24 text-white">
        <div className="solace-glow bottom-[-220px] left-[20%]" />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
          <div className="solace-reveal space-y-8 lg:col-span-8">
            <h2 className="text-4xl font-light leading-tight tracking-tight md:text-6xl">Invest in the most<br />important <span className="font-normal text-[#00f294]">story you have.</span></h2>
            <p className="max-w-md text-xs leading-7 text-[#637d77]">Available for selected collaborations, portfolio reviews, product design work, and digital experience projects.</p>
          </div>
          <div className="solace-reveal flex flex-col items-start gap-4 lg:col-span-4 lg:items-end">
            {data.user.email ? <a href={`mailto:${data.user.email}`} className="solace-interactive inline-flex items-center gap-3 rounded-full bg-[#00f294] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#021b13]"><Mail className="h-4 w-4" /> Contact Me</a> : null}
            {data.user.location ? <span className="inline-flex items-center gap-2 text-xs text-[#a3e3cc]/70"><MapPin className="h-4 w-4" /> {data.user.location}</span> : null}
            <div className="flex flex-wrap gap-2 lg:justify-end">{socials.map((social) => <a key={social.id || social.url} href={social.url} className="solace-interactive rounded-full border border-white/10 px-4 py-2 text-xs text-[#a3e3cc]/70 transition hover:border-[#00f294] hover:text-[#00f294]">{social.platform}</a>)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
