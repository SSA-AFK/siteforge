import { Layers, Mail, MapPin, Play, Sparkles, Star, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getOrderedSections, getSectionCopy } from '@siteforge/shared';
import type { Project, SiteData, VideoItem } from '@siteforge/shared';

const fallbackHero = 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=1600&q=80';
const fallbackProject = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';

function sortByOrder<T extends { displayOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url);
}

function projectImage(project?: Project) {
  return project?.coverImage || project?.images?.find((image) => image.imageUrl)?.imageUrl || fallbackProject;
}

function initials(name: string) {
  return (name || 'S').trim().slice(0, 1).toUpperCase();
}

function experiencePeriod(experience: SiteData['experiences'][number]) {
  return `${experience.startDate || 'Start'}${experience.isCurrent ? ' - Now' : experience.endDate ? ` - ${experience.endDate}` : ''}`;
}

function SectionTitle({ label, title, copy }: { label: string; title: string; copy?: string }) {
  return (
    <div className="jakarta-reveal mx-auto mb-12 max-w-3xl text-center">
      <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-indigo-600">{label}</span>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B0F19] md:text-4xl">{title}</h2>
      {copy ? <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">{copy}</p> : null}
    </div>
  );
}

function ProjectCard({ project, index, layout, onPreview }: { project: Project; index: number; layout: SiteData['config']['layout']; onPreview: (src: string, alt: string) => void }) {
  const featured = layout !== 'list' && project.isFeatured;
  return (
    <article className={`jakarta-reveal group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] ${featured ? 'md:col-span-2' : ''}`} style={{ transitionDelay: `${(index % 3) * 90}ms` }}>
      <button type="button" onClick={() => onPreview(projectImage(project), project.title)} className={`relative block w-full overflow-hidden bg-slate-50 ${featured ? 'aspect-[21/9]' : 'aspect-[4/3]'}`}>
        <img src={projectImage(project)} alt={project.title} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-70" />
        {project.isFeatured ? <span className="absolute left-5 top-5 rounded-full bg-indigo-600 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white shadow-lg shadow-indigo-500/20">Featured</span> : null}
      </button>
      <div className="p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{project.category || 'Project'}</p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0B0F19]">{project.title || 'Untitled Project'}</h3>
          </div>
          <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">#{String(index + 1).padStart(2, '0')}</span>
        </div>
        {project.description ? <p className="mt-4 text-sm leading-7 text-slate-500">{project.description}</p> : null}
        {(project.role || project.tools || project.startDate) ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.role ? <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">{project.role}</span> : null}
            {project.tools ? <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">{project.tools}</span> : null}
            {project.startDate ? <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">{project.startDate}{project.endDate ? ` - ${project.endDate}` : ''}</span> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function VideoCard({ video, index }: { video: VideoItem; index: number }) {
  const direct = isDirectVideoUrl(video.videoUrl);
  return (
    <article className={`jakarta-reveal overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] ${video.isFeatured ? 'md:col-span-2' : ''}`} style={{ transitionDelay: `${(index % 3) * 90}ms` }}>
      <div className={`relative overflow-hidden bg-slate-950 ${video.isFeatured ? 'aspect-[21/9]' : 'aspect-video'}`}>
        {direct ? (
          <video src={video.videoUrl} poster={video.thumbnailUrl} controls className="h-full w-full object-cover" />
        ) : (
          <a href={video.videoUrl} target="_blank" rel="noreferrer" className="group/video block h-full">
            {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover opacity-80 transition duration-700 group-hover/video:scale-105" /> : <div className="grid h-full place-items-center text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">Open Video</div>}
            <span className="absolute inset-0 grid place-items-center bg-slate-950/30">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-indigo-600 shadow-xl"><Play className="h-5 w-5 fill-current" /></span>
            </span>
          </a>
        )}
        {video.isFeatured ? <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">Featured Demo</span> : null}
      </div>
      <div className="p-7">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600">{video.platform}</p>
        <h3 className="mt-2 text-2xl font-extrabold text-[#0B0F19]">{video.title || 'Video Showcase'}</h3>
        {video.description ? <p className="mt-3 text-sm leading-7 text-slate-500">{video.description}</p> : null}
      </div>
    </article>
  );
}

export function TemplateJakarta({ data }: { data: SiteData }) {
  const projects = useMemo(() => sortByOrder(data.projects).filter((project) => project.status !== 'archived'), [data.projects]);
  const skills = sortByOrder(data.skills).filter((skill) => skill.name.trim());
  const previewSkills = skills.slice(0, 10);
  const hiddenSkillCount = Math.max(0, skills.length - previewSkills.length);
  const experiences = sortByOrder(data.experiences).filter((experience) => experience.position || experience.company);
  const awards = sortByOrder(data.awards ?? []).filter((award) => award.title.trim());
  const videos = sortByOrder(data.videos ?? []).filter((video) => video.videoUrl.trim()).sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder);
  const socials = sortByOrder(data.socialLinks);
  const heroImage = (data.config.heroImages ?? []).filter(Boolean)[0] || data.user.avatarUrl || fallbackHero;
  const featuredProject = projects.find((project) => project.isFeatured) || projects[0];
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<SiteData['experiences'][number] | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.jakarta-reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('jakarta-active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [data, projects.length, videos.length, skills.length, awards.length, experiences.length]);

  useEffect(() => {
    const sectionIds = [
      'home',
      ...getOrderedSections(data).filter((section) => {
        if (section === 'projects') return projects.length;
        if (section === 'videos') return data.config.showVideos && videos.length;
        if (section === 'skills') return data.config.showSkills && skills.length;
        if (section === 'awards') return data.config.showAwards && awards.length;
        if (section === 'experience') return data.config.showExperience && experiences.length;
        return section === 'contact';
      })
    ];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) {
        setActiveSection(visible.target.id);
      }
    }, { threshold: [0.18, 0.35, 0.6], rootMargin: '-96px 0px -45% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [data, projects.length, videos.length, skills.length, awards.length, experiences.length]);

  useEffect(() => {
    const preview = document.getElementById('preview');
    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 20 || (preview?.scrollTop ?? 0) > 20);
    };
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    preview?.addEventListener('scroll', updateScrolled, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrolled);
      preview?.removeEventListener('scroll', updateScrolled);
    };
  }, []);

  const portfolioMetrics = [
    { label: 'Projects', value: projects.length, tone: 'bg-indigo-500' },
    { label: 'Skills', value: skills.length, tone: 'bg-violet-500' },
    { label: 'Videos', value: videos.length, tone: 'bg-blue-500' },
    { label: 'Honors', value: awards.length, tone: 'bg-amber-400' }
  ];
  const navLinkClass = (sectionId: string) => `jakarta-nav-link ${activeSection === sectionId ? 'is-active' : ''}`;
  const projectsCopy = getSectionCopy(data, 'projects', { label: 'Selected Work', title: 'A polished system for your best projects', description: 'Project images and gallery assets stay front and center, with featured work promoted into a wider card.' });
  const skillsCopy = getSectionCopy(data, 'skills', { label: 'Tools and capabilities', title: 'Tools and capabilities' });
  const videosCopy = getSectionCopy(data, 'videos', { label: 'Video Proof', title: 'Demos, reels, and walkthroughs', description: 'If a video is marked as featured, it expands into the main demo slot.' });
  const experienceCopy = getSectionCopy(data, 'experience', { label: 'Experience', title: 'Experience becomes a guided story' });
  const awardsCopy = getSectionCopy(data, 'awards', { label: 'Recognition', title: 'Honors and proof points' });
  const contactCopy = getSectionCopy(data, 'contact', { label: 'Contact', title: 'Ready to start a new conversation?', description: 'Portfolio reviews, project collaboration, role opportunities, and creative conversations can all start here.' });
  const sectionOrder = Object.fromEntries(getOrderedSections(data).map((section, index) => [section, index])) as Record<string, number>;
  const navSections = getOrderedSections(data).filter((section) => {
    if (section === 'projects') return projects.length;
    if (section === 'videos') return data.config.showVideos && videos.length;
    if (section === 'skills') return data.config.showSkills && skills.length;
    if (section === 'contact') return true;
    return false;
  });
  const navLabels: Record<string, string> = { projects: 'Work', videos: 'Videos', skills: 'Skills', contact: 'Contact' };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAFAFC] font-sans text-slate-800">
      <style>{`
        .jakarta-reveal { opacity:0; transform:translateY(20px); transition:opacity 1.2s cubic-bezier(.16,1,.3,1), transform 1.2s cubic-bezier(.16,1,.3,1); }
        .jakarta-active { opacity:1; transform:translateY(0); }
        .jakarta-nav-link { position:relative; display:inline-flex; align-items:center; padding:10px 0; color:#64748b; transition:color .25s ease; }
        .jakarta-nav-link::after { content:""; position:absolute; left:0; right:0; bottom:2px; height:2px; border-radius:999px; background:#4f46e5; transform:scaleX(0); transform-origin:left; transition:transform .28s ease; }
        .jakarta-nav-link::before { content:""; width:6px; height:6px; margin-right:7px; border-radius:999px; background:#4f46e5; box-shadow:0 0 14px rgba(79,70,229,.42); opacity:0; transform:scale(.65); transition:opacity .25s ease, transform .25s ease; }
        .jakarta-nav-link:hover, .jakarta-nav-link.is-active { color:#4f46e5; }
        .jakarta-nav-link.is-active::after { transform:scaleX(1); }
        .jakarta-nav-link.is-active::before { opacity:1; transform:scale(1); }
      `}</style>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-300 ${isScrolled ? 'border-slate-200 bg-white/88 shadow-[0_16px_40px_rgba(15,23,42,0.08)]' : 'border-slate-100 bg-white/75'}`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 md:px-8 ${isScrolled ? 'h-16' : 'h-20'}`}>
          <a href="#home" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">{data.user.avatarUrl ? <img src={data.user.avatarUrl} alt={data.user.displayName} className="h-full w-full rounded-xl object-cover" /> : <Layers className="h-5 w-5" />}</span>
            <span className="text-lg font-extrabold tracking-tight text-[#0B0F19]">{data.user.displayName || data.user.username || 'creator'}</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#home" className={navLinkClass('home')}>Home</a>
            {navSections.map((section) => <a key={section} href={`#${section}`} className={navLinkClass(section)}>{navLabels[section]}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            {data.user.email ? <a href={`mailto:${data.user.email}`} className="hidden items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 sm:flex"><User className="h-4 w-4" /> Contact</a> : null}
            <a href="#projects" className="rounded-lg bg-[#0B0F19] px-5 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm transition hover:bg-black">Get Started</a>
          </div>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden pb-28 pt-20">
        <div className="relative z-10 mx-auto max-w-7xl px-8 text-center">
          <div className="jakarta-reveal">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.24em] text-indigo-600">{data.user.title || 'Personal Portfolio'}</p>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0B0F19] md:text-[64px]">{data.user.bio || 'Build a portfolio that feels polished and alive'}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">{data.user.fullBio || 'Use a clean SaaS-inspired system to present your identity, selected projects, videos, skills, awards, and collaboration channels.'}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <a href={videos.length ? '#videos' : '#projects'} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"><Play className="h-4 w-4 fill-indigo-600 text-indigo-600" /> Watch Demo</a>
              <a href="#projects" className="rounded-xl bg-indigo-600 px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-700">Explore Work</a>
            </div>
          </div>

          <div className="jakarta-reveal relative mx-auto mt-20 aspect-[16/9] max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/70 bg-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <img src={heroImage} alt={data.user.displayName || 'Portfolio space'} className="absolute inset-0 h-full w-full object-cover opacity-55 saturate-110 contrast-105" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.58),rgba(255,255,255,.28)_42%,rgba(255,255,255,.68)),radial-gradient(circle_at_20%_80%,rgba(99,102,241,.18),transparent_36%)]" />
            <svg className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block" xmlns="http://www.w3.org/2000/svg">
              <path d="M 120 180 Q 250 180 250 250 T 400 240 T 600 250 T 800 260" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-5 text-left md:p-8">
              <div className="flex flex-wrap gap-5 text-[10px] font-extrabold tracking-wider text-slate-400 md:gap-8 md:text-[11px]">
                {['PROFILE READY', 'PROJECT ADDED', 'LIVE PREVIEW', 'ONLINE LINK'].map((item, index) => (
                  <div key={item} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${index === 0 ? 'animate-pulse bg-indigo-500' : 'bg-slate-300'}`} /> {item}</div>
                ))}
              </div>
              <div className="mt-auto grid grid-cols-1 items-end gap-4 md:grid-cols-3 md:gap-6">
                <div className="rounded-2xl border border-white/5 bg-[#0B0F19] p-6 text-white shadow-xl transition hover:-translate-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-100">Selected Identity</span>
                  <h4 className="mt-2 text-base font-bold">{data.user.displayName || 'Your Name'} · {data.user.location || 'Live Portfolio'}</h4>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[0_15px_30px_rgba(0,0,0,0.03)] transition hover:-translate-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Now Featuring</span>
                  <div className="my-5 text-3xl font-extrabold tracking-tight text-[#0B0F19] md:text-4xl">{featuredProject ? 'Featured Work' : 'Portfolio Ready'}</div>
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500 px-4 py-2 text-[11px] font-semibold text-white">{featuredProject?.title || 'Add your first project'}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6 text-slate-800 shadow-[0_15px_30px_rgba(0,0,0,0.03)] transition hover:-translate-y-1">
                  <h4 className="mb-3 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Portfolio Status</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700"><span>{projects.length} Projects</span><span className="text-slate-400">Work</span></div>
                    <div className="flex justify-between border-t border-slate-50 pt-2 font-semibold text-slate-700"><span>{skills.length} Skills</span><span className="text-slate-400">Stack</span></div>
                    <div className="flex justify-between border-t border-slate-50 pt-2 font-semibold text-slate-700"><span>{videos.length} Videos</span><span className="text-slate-400">Media</span></div>
                    <div className="flex justify-between border-t border-slate-50 pt-2 font-semibold text-slate-700"><span>{awards.length} Honors</span><span className="text-slate-400">Proof</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col">
      {false && data.config.showSkills && skills.length ? (
        <section id="skills" className="border-y border-slate-100 bg-white py-16">
          <div className="mx-auto max-w-7xl px-8">
            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{skillsCopy.label}</p>
            <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0B0F19]">{skillsCopy.title}</h2>
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:grid-cols-2 lg:grid-cols-5">
              {previewSkills.map((skill) => (
                <div key={skill.id || skill.name} className="border-b border-r border-slate-100 bg-white px-6 py-7 transition hover:bg-slate-50/50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-1.5 text-sm font-extrabold tracking-wide text-slate-700"><Sparkles className="h-4 w-4 flex-none text-indigo-500" /> <span className="truncate">{skill.name}</span></span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600">{skill.proficiency}/5</span>
                  </div>
                  {skill.category ? <p className="mt-2 truncate text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{skill.category}</p> : null}
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${skill.proficiency * 20}%` }} />
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-1.5" aria-label={`熟练度 ${skill.proficiency}/5`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <span key={index} className={`h-1.5 rounded-full ${index < skill.proficiency ? 'bg-indigo-500' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {hiddenSkillCount ? (
              <div className="mt-8 text-center">
                <button type="button" onClick={() => setShowAllSkills(true)} className="rounded-xl bg-[#0B0F19] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-black">
                  查看全部技能 +{hiddenSkillCount}
                </button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {projects.length ? (
        <section id="projects" className="bg-[#FAFAFC] py-24" style={{ order: sectionOrder.projects }}>
          <div className="mx-auto max-w-7xl px-8">
            <SectionTitle label={projectsCopy.label} title={projectsCopy.title} copy={projectsCopy.description} />
            <div className={`grid grid-cols-1 gap-8 ${data.config.layout === 'list' ? '' : 'md:grid-cols-2'}`}>
              {projects.map((project, index) => <ProjectCard key={project.id || project.slug} project={project} index={index} layout={data.config.layout} onPreview={(src, alt) => setPreviewImage({ src, alt })} />)}
            </div>
          </div>
        </section>
      ) : null}

      {data.config.showVideos && videos.length ? (
        <section id="videos" className="bg-white py-24" style={{ order: sectionOrder.videos }}>
          <div className="mx-auto max-w-7xl px-8">
            <SectionTitle label={videosCopy.label} title={videosCopy.title} copy={videosCopy.description} />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {videos.map((video, index) => <VideoCard key={video.id || video.videoUrl} video={video} index={index} />)}
            </div>
          </div>
        </section>
      ) : null}

      {data.config.showSkills && skills.length ? (
        <section id="skills" className="border-y border-slate-100 bg-white py-16" style={{ order: sectionOrder.skills }}>
          <div className="mx-auto max-w-7xl px-8">
            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{skillsCopy.label}</p>
            <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0B0F19]">{skillsCopy.title}</h2>
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:grid-cols-2 lg:grid-cols-5">
              {skills.slice(0, 10).map((skill) => (
                <div key={skill.id || skill.name} className="border-b border-r border-slate-100 bg-white px-6 py-7 transition hover:bg-slate-50/50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-1.5 text-sm font-extrabold tracking-wide text-slate-700"><Sparkles className="h-4 w-4 flex-none text-indigo-500" /> <span className="truncate">{skill.name}</span></span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600">{skill.proficiency}/5</span>
                  </div>
                  {skill.category ? <p className="mt-2 truncate text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{skill.category}</p> : null}
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${skill.proficiency * 20}%` }} />
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-1.5" aria-label={`Skill level ${skill.proficiency}/5`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <span key={index} className={`h-1.5 rounded-full ${index < skill.proficiency ? 'bg-indigo-500' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.config.showExperience && experiences.length ? (
        <section id="experience" className="bg-[#0B0F19] py-24 text-white" style={{ order: sectionOrder.experience }}>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="jakarta-reveal min-w-0">
              <span className="text-xs font-extrabold uppercase tracking-[0.24em] text-indigo-300">{experienceCopy.label}</span>
              <h2 className="mt-4 max-w-[12ch] text-4xl font-extrabold tracking-tight md:text-5xl">{experienceCopy.title}</h2>
              {experienceCopy.description ? <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">{experienceCopy.description}</p> : null}
              <div className="mt-8 grid grid-cols-2 gap-3" aria-label="Portfolio content overview">
                {portfolioMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
                    <span className={`mb-4 block h-1.5 w-8 rounded-full ${metric.tone}`} />
                    <span className="block text-2xl font-extrabold text-white">{metric.value}</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="jakarta-reveal min-w-0 rounded-[2rem] border border-white/10 bg-white/[.03] p-5 md:p-6">
              <div className="grid gap-4">
                {experiences.slice(0, 4).map((experience, index) => (
                  <button key={experience.id || experience.company} type="button" onClick={() => setSelectedExperience(experience)} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300/45 hover:bg-white/[.07]">
                    <div className="absolute left-0 top-0 h-full w-1 bg-indigo-400/70" />
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-300">{String(index + 1).padStart(2, '0')} / {experience.type}</p>
                        <h3 className="mt-2 break-words text-lg font-extrabold leading-snug text-white">{experience.position || 'Experience'}</h3>
                        {experience.company ? <p className="mt-1 break-words text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{experience.company}</p> : null}
                      </div>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/[.05] px-3 py-1 text-xs font-semibold text-slate-300">
                        {experiencePeriod(experience)}
                      </span>
                    </div>
                    {experience.description ? <p className="mt-4 line-clamp-2 break-words text-sm leading-6 text-slate-400">{experience.description}</p> : null}
                    <span className="mt-4 inline-flex text-xs font-extrabold text-indigo-300 transition group-hover:text-white">查看详情</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {data.config.showAwards && awards.length ? (
        <section id="awards" className="bg-[#FAFAFC] py-24" style={{ order: sectionOrder.awards }}>
          <div className="mx-auto max-w-7xl px-8">
            <SectionTitle label={awardsCopy.label} title={awardsCopy.title} copy={awardsCopy.description} />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {awards.map((award, index) => (
                <article key={award.id || award.title} className="jakarta-reveal rounded-3xl border border-slate-100 bg-white p-8 shadow-sm" style={{ transitionDelay: `${(index % 2) * 90}ms` }}>
                  <div className="flex items-center gap-1 text-amber-400">{Array.from({ length: 5 }, (_, star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div>
                  <h3 className="mt-5 text-xl font-extrabold text-[#0B0F19]">{award.title}</h3>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">{award.issuer}{award.date ? ` / ${award.date}` : ''}</p>
                  {award.description ? <p className="mt-4 text-sm leading-7 text-slate-500">{award.description}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="contact" className="bg-white py-24" style={{ order: sectionOrder.contact }}>
        <div className="mx-auto max-w-7xl px-8">
          <div className="jakarta-reveal overflow-hidden rounded-[2rem] bg-[#0B0F19] p-8 text-white md:p-12">
            <div className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-indigo-300">{contactCopy.label}</p>
                <h2 className="mt-4 text-4xl font-extrabold tracking-tight">{contactCopy.title}</h2>
                {contactCopy.description ? <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">{contactCopy.description}</p> : null}
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                {data.user.email ? <a href={`mailto:${data.user.email}`} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-bold text-white transition hover:bg-indigo-700"><Mail className="h-4 w-4" /> Contact Me</a> : null}
                {data.user.location ? <span className="inline-flex items-center gap-2 text-sm text-slate-400"><MapPin className="h-4 w-4" /> {data.user.location}</span> : null}
                <div className="flex flex-wrap gap-2 md:justify-end">{socials.map((social) => <a key={social.id || social.url} href={social.url} className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-indigo-400 hover:text-white">{social.platform}</a>)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      <footer className="border-t border-slate-900 bg-[#0B0F19] py-16 text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white">{initials(data.user.displayName || data.user.username)}</span><span className="text-base font-extrabold tracking-tight text-white">{data.user.displayName || 'creator'}</span></div>
          <p className="text-xs">Copyright 2026 - {data.user.displayName || 'Portfolio'}. Built with SiteForge.</p>
        </div>
      </footer>

      {previewImage ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true" onClick={() => setPreviewImage(null)}>
          <button type="button" className="absolute right-6 top-6 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-900" onClick={() => setPreviewImage(null)}>Close</button>
          <img src={previewImage.src} alt={previewImage.alt} className="max-h-[86vh] max-w-[92vw] rounded-3xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
      {selectedExperience ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" onClick={() => setSelectedExperience(null)}>
          <div className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-100 bg-white p-6 text-[#0B0F19] shadow-2xl md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-indigo-600">{selectedExperience.type} / {experiencePeriod(selectedExperience)}</p>
                <h3 className="mt-3 break-words text-3xl font-extrabold tracking-tight">{selectedExperience.position || 'Experience'}</h3>
                {selectedExperience.company ? <p className="mt-2 break-words text-sm font-bold uppercase tracking-[0.16em] text-slate-400">{selectedExperience.company}</p> : null}
              </div>
              <button type="button" className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200" onClick={() => setSelectedExperience(null)}>Close</button>
            </div>
            {selectedExperience.description ? <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-600">{selectedExperience.description}</p> : <p className="text-sm leading-7 text-slate-500">暂无详细描述。</p>}
          </div>
        </div>
      ) : null}
      {showAllSkills ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true" onClick={() => setShowAllSkills(false)}>
          <div className="max-h-[86vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-indigo-600">{skillsCopy.label}</p>
                <h3 className="mt-2 text-3xl font-extrabold text-[#0B0F19]">全部技能</h3>
              </div>
              <button type="button" className="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200" onClick={() => setShowAllSkills(false)}>Close</button>
            </div>
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <div key={skill.id || skill.name} className="border-b border-r border-slate-100 bg-white px-6 py-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-1.5 text-sm font-extrabold tracking-wide text-slate-700"><Sparkles className="h-4 w-4 flex-none text-indigo-500" /> <span className="truncate">{skill.name}</span></span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600">{skill.proficiency}/5</span>
                  </div>
                  {skill.category ? <p className="mt-2 truncate text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{skill.category}</p> : null}
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${skill.proficiency * 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
