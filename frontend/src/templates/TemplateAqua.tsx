import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { getAboutSectionCopy, getOrderedSections, getSectionCopy } from '@siteforge/shared';
import type { Project, SiteData } from '@siteforge/shared';

function byOrder<T extends { displayOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function projectImage(project: Project) {
  return project.coverImage || project.images?.find((image) => image.imageUrl)?.imageUrl || '';
}

export function TemplateAqua({ data }: { data: SiteData }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const centerCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  const projects = useMemo(() => byOrder(data.projects).filter((project) => project.status !== 'archived'), [data.projects]);
  const featuredProject = projects.find((project) => project.isFeatured) || projects[0];
  const sideProjects = projects.filter((project) => project !== featuredProject);
  const leftProject = sideProjects[0] || featuredProject;
  const rightProject = sideProjects[1] || projects[1] || featuredProject;
  const deckProjects = useMemo(() => {
    const ordered = projects.length <= 2 ? projects : [leftProject, featuredProject, rightProject];
    const seen = new Set<Project>();
    return ordered.filter((project): project is Project => Boolean(project) && !seen.has(project) && Boolean(seen.add(project)));
  }, [featuredProject, leftProject, projects, rightProject]);
  const experiences = useMemo(() => byOrder(data.experiences).filter((experience) => experience.position.trim() || experience.company.trim()), [data.experiences]);
  const skills = useMemo(() => byOrder(data.skills).filter((skill) => skill.name.trim()), [data.skills]);
  const previewSkills = skills.slice(0, 8);
  const hiddenSkillCount = Math.max(0, skills.length - previewSkills.length);
  const awards = useMemo(() => byOrder(data.awards ?? []).filter((award) => award.title.trim()), [data.awards]);
  const videos = useMemo(
    () =>
      byOrder(data.videos ?? [])
        .filter((video) => video.videoUrl.trim())
        .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder),
    [data.videos]
  );
  const socials = useMemo(() => byOrder(data.socialLinks), [data.socialLinks]);
  const particles = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => ({
        id: index,
        left: `${(index * 23 + 7) % 100}%`,
        top: `${(index * 41 + 11) % 100}%`,
        size: `${3 + (index % 5)}px`,
        delay: `${-(index % 14) * 0.62}s`,
        duration: `${9 + (index % 7) * 1.45}s`,
        color: index % 5 === 0 ? '#10b981' : index % 3 === 0 ? '#d946ef' : '#8570ee',
        opacity: 0.13 + (index % 5) * 0.04,
        streak: index % 9 === 0
      })),
    []
  );

  const metricYears = data.experiences.length ? `${Math.max(1, data.experiences.length)}+` : '1+';
  const aboutCopy = getAboutSectionCopy(data, { label: 'Now booking new collaborations', title: 'Crafting Immersive Interfaces', description: 'Creative developer and UI designer specializing in interactive experiences, custom portfolio systems, and polished digital products.' });
  const projectsCopy = getSectionCopy(data, 'projects', { label: 'Featured Project', title: 'Selected works in orbit', description: 'A focused deck for the strongest projects in your portfolio.' });
  const experienceCopy = getSectionCopy(data, 'experience', { label: 'Experience', title: 'Experience Timeline', description: 'Roles, education, responsibilities, and results come from the form.' });
  const skillsCopy = getSectionCopy(data, 'skills', { label: 'Selected Tools', title: 'Industry tools I master.', description: 'A compact view of your most important skills.' });
  const videosCopy = getSectionCopy(data, 'videos', { label: 'Motion Proof', title: 'Videos and demos' });
  const awardsCopy = getSectionCopy(data, 'awards', { label: 'Recognition', title: 'Honors and proof points' });
  const contactCopy = getSectionCopy(data, 'contact', { label: 'Contact', title: 'Start a Collaboration', description: 'Have a project idea, role opportunity, or portfolio conversation? Use the public contact channels below.' });
  const sectionOrder = Object.fromEntries(getOrderedSections(data).map((section, index) => [section, index])) as Record<string, number>;
  const navTargets: Record<string, string> = { projects: 'projects', experience: 'experience', skills: 'skills', videos: 'videos', awards: 'awards', contact: 'contact' };
  const navLabels: Record<string, string> = { projects: 'Works', experience: 'Experience', skills: 'Skills', videos: 'Videos', awards: 'Awards', contact: 'Contact' };
  const navSections = getOrderedSections(data).filter((section) => {
    if (section === 'projects') return projects.length;
    if (section === 'experience') return data.config.showExperience && experiences.length;
    if (section === 'skills') return data.config.showSkills && skills.length;
    if (section === 'videos') return data.config.showVideos && videos.length;
    if (section === 'awards') return data.config.showAwards && awards.length && !data.config.showSkills;
    return section === 'contact';
  });
  const orbitSkillSignal = skills.length
    ? `${skills.slice(0, 3).map((skill) => skill.name).join(', ')}${skills.length > 3 ? ` +${skills.length - 3} more` : ''}`
    : 'Add skills in the form';

  function handleDeckMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    if (leftCardRef.current) leftCardRef.current.style.transform = `rotateY(${20 + x * 15}deg) translateZ(${-30 + y * 15}px) rotateX(${4 - y * 15}deg)`;
    if (centerCardRef.current) centerCardRef.current.style.transform = `translateZ(40px) translateY(${-10 + y * 15}px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    if (rightCardRef.current) rightCardRef.current.style.transform = `rotateY(${-20 + x * 15}deg) translateZ(${-30 + y * 15}px) rotateX(${4 - y * 15}deg)`;
  }

  function resetDeck() {
    if (leftCardRef.current) leftCardRef.current.style.transform = 'rotateY(20deg) translateZ(-30px) rotateX(4deg)';
    if (centerCardRef.current) centerCardRef.current.style.transform = 'translateZ(40px) translateY(-10px) rotateY(0deg) rotateX(0deg)';
    if (rightCardRef.current) rightCardRef.current.style.transform = 'rotateY(-20deg) translateZ(-30px) rotateX(4deg)';
  }

  function projectVariant(index: number, count: number): 'left' | 'center' | 'right' {
    if (count === 1) return 'center';
    if (count === 2) return index === 0 ? 'left' : 'right';
    return index === 0 ? 'left' : index === 1 ? 'center' : 'right';
  }

  function projectRef(variant: 'left' | 'center' | 'right') {
    if (variant === 'left') return leftCardRef;
    if (variant === 'center') return centerCardRef;
    return rightCardRef;
  }

  function scrollToSection(sectionId: string, event?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    event?.preventDefault();
    const target = document.getElementById(sectionId);
    const preview = document.getElementById('preview');
    if (!target) return;

    if (preview?.contains(target)) {
      const previewRect = preview.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      preview.scrollTo({
        top: preview.scrollTop + targetRect.top - previewRect.top,
        behavior: 'smooth'
      });
      window.history.replaceState(null, '', `#${sectionId}`);
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${sectionId}`);
  }

  function ProjectMiniCard({ project, variant }: { project?: Project; variant: 'left' | 'center' | 'right' }) {
    if (!project) return null;
    const image = projectImage(project);
    const isFeatured = project.isFeatured;
    return (
      <div ref={projectRef(variant)} className={`aqua-glass aqua-project-card aqua-card-${variant} ${isFeatured ? 'aqua-featured-card' : ''}`}>
        {image ? <button className="aqua-cover" type="button" onClick={() => setPreviewImage({ src: image, alt: project.title })}><img src={image} alt={project.title} /></button> : null}
        <div>
          {isFeatured ? <div className="aqua-pill aqua-featured-pill">Featured Project</div> : null}
          <h3>{project.title || 'Untitled Project'}</h3>
          <div className="aqua-pill">{project.category || 'Selected Work'}</div>
          <p className="aqua-project-copy">{project.description || 'A selected portfolio project with polished interaction and visual craft.'}</p>
          <button className="aqua-detail-btn" type="button" onClick={() => setSelectedProject(project)}>Details</button>
        </div>
        <div className="aqua-chip-row">
          {(project.tools || project.role || 'Design, React').split(',').slice(0, 2).map((tool) => (
            <span key={tool.trim()}>{tool.trim()}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="aqua-root">
      <style>{`
        .aqua-root { min-height: 100vh; position: relative; overflow: hidden; background-color: #05030a; background-image: radial-gradient(circle at 50% -20%, rgba(133,112,238,.22) 0%, transparent 60%), radial-gradient(circle at 10% 40%, rgba(133,112,238,.05) 0%, transparent 40%), radial-gradient(circle at 90% 70%, rgba(217,70,239,.06) 0%, transparent 40%), radial-gradient(circle at 50% 120%, rgba(133,112,238,.08) 0%, transparent 50%); color: white; font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; }
        .aqua-grid-lines { position:absolute; inset:0; display:flex; justify-content:space-between; padding:0 4%; pointer-events:none; z-index:0; }
        .aqua-grid-lines span { width:1px; background:linear-gradient(to bottom, rgba(133,112,238,.02), rgba(133,112,238,.08), rgba(133,112,238,.02)); }
        .aqua-particles { position:absolute; inset:0; z-index:0; overflow:hidden; pointer-events:none; }
        .aqua-particle { position:absolute; width:var(--size); height:var(--size); left:var(--left); top:var(--top); border-radius:999px; background:var(--color); opacity:var(--opacity); box-shadow:0 0 24px color-mix(in srgb, var(--color) 72%, transparent), 0 0 52px color-mix(in srgb, var(--color) 26%, transparent); animation:aqua-particle-drift var(--duration) ease-in-out var(--delay) infinite alternate; }
        .aqua-particle:nth-child(4n) { filter:blur(.4px); }
        .aqua-particle:nth-child(6n) { width:calc(var(--size) + 2px); height:1px; border-radius:999px; }
        .aqua-particle-streak { width:42px; height:1px; border-radius:999px; background:linear-gradient(90deg, transparent, var(--color), transparent); transform:rotate(-22deg); box-shadow:0 0 18px color-mix(in srgb, var(--color) 76%, transparent); }
        .aqua-content { position:relative; z-index:1; }
        .aqua-muted { color:#9595b1; }
        .aqua-purple { color:#8570ee; }
        .aqua-pink { color:#d946ef; }
        .aqua-green { color:#10b981; }
        .aqua-header { max-width:1280px; margin:16px auto 0; padding:0 24px; display:flex; align-items:center; justify-content:space-between; gap:24px; }
        .aqua-nav { display:flex; gap:28px; font-size:13px; font-weight:700; color:#9595b1; }
        .aqua-nav a:hover { color:#fff; }
        .aqua-logo { display:flex; align-items:center; gap:10px; font-size:22px; font-weight:900; letter-spacing:-.04em; }
        .aqua-logo-mark { width:34px; height:34px; border-radius:50%; display:grid; place-items:center; background:linear-gradient(135deg,#8570ee,#d946ef); box-shadow:0 0 24px rgba(133,112,238,.35); }
        .aqua-btn { border-radius:999px; border:1px solid rgba(133,112,238,.28); background:rgba(255,255,255,.05); color:#fff; padding:10px 18px; font-size:12px; font-weight:900; transition:.3s ease; }
        .aqua-btn:hover { transform:translateY(-2px); background:rgba(255,255,255,.08); }
        .aqua-main { max-width:1280px; margin:48px auto 0; padding:0 24px 64px; }
        .aqua-hero { display:grid; grid-template-columns:180px minmax(0,1fr) 180px; align-items:center; gap:32px; margin-bottom:54px; }
        .aqua-metric-stack { display:flex; flex-direction:column; gap:28px; color:#fff; }
        .aqua-metric-stack.right { text-align:right; align-items:flex-end; }
        .aqua-circle-btn { width:44px; height:44px; border-radius:50%; display:grid; place-items:center; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:#9595b1; }
        .aqua-metric strong { display:block; font-size:30px; line-height:1; }
        .aqua-metric span { display:block; margin-top:7px; color:#9595b1; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.15em; }
        .aqua-hero-center { text-align:center; display:flex; flex-direction:column; align-items:center; }
        .aqua-booking { display:inline-flex; align-items:center; gap:9px; margin-bottom:24px; padding:8px 13px; border-radius:999px; color:#9595b1; font-size:11px; font-weight:700; }
        .aqua-booking i { width:7px; height:7px; border-radius:999px; background:#8570ee; animation:aqua-pulse-dot 1.6s ease-in-out infinite; }
        .aqua-identity { margin:0 0 14px; color:#10b981; font-size:clamp(13px, 1.45vw, 18px); font-weight:800; letter-spacing:.24em; text-transform:uppercase; }
        .aqua-hero h1 { max-width:880px; margin:0; font-size:clamp(36px, 5vw, 68px); line-height:1.08; letter-spacing:-.045em; font-weight:900; }
        .aqua-hero h1 span { background:linear-gradient(90deg,#dcd7ff,#8570ee,#d946ef); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .aqua-hero p { max-width:620px; margin:22px auto 30px; color:#9595b1; font-size:14px; line-height:1.8; }
        .aqua-start { display:flex; flex-direction:column; align-items:center; gap:9px; color:#9595b1; font-size:10px; font-weight:900; letter-spacing:.18em; text-transform:uppercase; }
        .aqua-start button { position:relative; width:52px; height:52px; border-radius:50%; background:#fff; color:#05030a; font-size:22px; font-weight:900; box-shadow:0 18px 42px rgba(133,112,238,.24); }
        .aqua-start button::before { content:""; position:absolute; inset:-5px; border-radius:inherit; background:linear-gradient(45deg,#8570ee,#d946ef); filter:blur(9px); opacity:.45; z-index:-1; animation:aqua-glow 3s ease-in-out infinite; }
        .aqua-glass { position:relative; background:rgba(13,10,25,.5); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.07); transition:transform .45s cubic-bezier(.16,1,.3,1), border-color .35s, box-shadow .35s, background .35s; }
        .aqua-glass::after { content:""; position:absolute; inset:-1px; border-radius:inherit; pointer-events:none; opacity:0; background:radial-gradient(220px circle at 50% 0%, rgba(133,112,238,.22), transparent 62%); transition:opacity .35s ease; }
        .aqua-glass:hover { border-color:rgba(133,112,238,.32); background:rgba(18,13,35,.62); box-shadow:0 22px 58px rgba(133,112,238,.12); }
        .aqua-glass:hover::after { opacity:1; }
        .aqua-deck { perspective:1500px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; margin:0 auto 70px; max-width:1120px; align-items:stretch; }
        .aqua-deck-1 { grid-template-columns:minmax(0,520px); justify-content:center; }
        .aqua-deck-2 { grid-template-columns:repeat(2,minmax(0,420px)); justify-content:center; }
        .aqua-project-card { min-height:288px; border-radius:28px; padding:22px; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; cursor:pointer; }
        .aqua-card-left { transform:rotateY(20deg) translateZ(-30px) rotateX(4deg); }
        .aqua-card-right { transform:rotateY(-20deg) translateZ(-30px) rotateX(4deg); }
        .aqua-card-center { min-height:330px; transform:translateZ(40px) translateY(-10px); border-color:rgba(133,112,238,.25); box-shadow:0 24px 60px rgba(133,112,238,.15); }
        .aqua-deck-1 .aqua-project-card, .aqua-deck-2 .aqua-project-card { min-height:330px; transform:none !important; }
        .aqua-featured-card { border-color:rgba(133,112,238,.36); box-shadow:0 24px 70px rgba(133,112,238,.17), inset 0 0 0 1px rgba(217,70,239,.08); }
        .aqua-featured-card::before { content:""; position:absolute; inset:0; pointer-events:none; background:linear-gradient(135deg, rgba(133,112,238,.16), transparent 46%, rgba(217,70,239,.1)); opacity:.9; }
        .aqua-featured-card > * { position:relative; z-index:1; }
        .aqua-cover { height:96px; margin:-8px -8px 16px; border-radius:20px; overflow:hidden; background:rgba(255,255,255,.04); }
        .aqua-cover img { width:100%; height:100%; object-fit:cover; filter:saturate(1.15) brightness(1.12); transition:transform .45s ease; }
        .aqua-cover:hover img { transform:scale(1.05); }
        .aqua-project-card h3 { margin:0 0 10px; font-size:19px; font-weight:850; }
        .aqua-pill { display:inline-flex; width:max-content; max-width:100%; margin-bottom:14px; border-radius:999px; background:rgba(255,255,255,.05); padding:5px 11px; color:#9595b1; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
        .aqua-project-card p { color:#9595b1; font-size:12px; line-height:1.75; }
        .aqua-project-copy { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
        .aqua-featured-pill { background:rgba(217,70,239,.14); color:#fff; }
        .aqua-detail-btn { margin-top:14px; border-radius:999px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.05); color:#fff; padding:8px 12px; font-size:10px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; transition:background .25s ease, transform .25s ease, border-color .25s ease; }
        .aqua-detail-btn:hover { transform:translateY(-2px); border-color:rgba(133,112,238,.42); background:rgba(133,112,238,.16); }
        .aqua-chip-row { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
        .aqua-chip-row span { border-radius:999px; background:rgba(133,112,238,.12); color:#dcd7ff; padding:7px 10px; font-size:10px; font-weight:800; transition:background .25s ease, color .25s ease, transform .25s ease; }
        .aqua-chip-row span:hover { transform:translateY(-2px); background:rgba(217,70,239,.18); color:#fff; }
        .aqua-orbit-showcase { max-width:760px; margin:-18px auto 56px; padding:18px 24px; border-radius:32px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:24px; }
        .aqua-orbit-copy { min-width:0; }
        .aqua-orbit-copy:nth-child(3) { text-align:right; }
        .aqua-orbit-copy span { display:block; color:#8570ee; font-size:10px; font-weight:900; letter-spacing:.18em; text-transform:uppercase; }
        .aqua-orbit-copy strong { display:block; margin-top:6px; color:#fff; font-size:15px; line-height:1.35; overflow-wrap:anywhere; }
        .aqua-orbit { height:150px; display:grid; place-items:center; position:relative; overflow:visible; }
        .aqua-orbit-line { position:absolute; left:50%; top:50%; width:192px; height:62px; border-radius:999px; transform:translate(-50%,-50%); background:radial-gradient(ellipse at center, transparent 58%, rgba(133,112,238,.32) 59%, rgba(217,70,239,.18) 62%, transparent 64%); box-shadow:0 0 28px rgba(133,112,238,.12), inset 0 0 28px rgba(217,70,239,.08); opacity:.9; }
        .aqua-orbit-line::after { content:""; position:absolute; inset:9px 22px; border-radius:inherit; border:1px solid rgba(255,255,255,.05); filter:blur(.2px); }
        .aqua-orbit-runner { position:absolute; left:50%; top:50%; width:0; height:0; transform-origin:0 0; }
        .aqua-orbit-saucer { position:absolute; left:0; top:0; width:34px; height:14px; border-radius:999px; background:linear-gradient(180deg,#f7efff 0%,#d946ef 42%,#5b3bd8 100%); box-shadow:0 0 18px rgba(217,70,239,.78), 0 8px 22px rgba(133,112,238,.22); animation:aqua-saucer-path 8s cubic-bezier(.45,0,.55,1) infinite; }
        .aqua-orbit-saucer::before { content:""; position:absolute; left:50%; top:-7px; width:16px; height:10px; border-radius:999px 999px 8px 8px; background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(133,112,238,.72)); transform:translateX(-50%); box-shadow:0 0 12px rgba(255,255,255,.28); }
        .aqua-orbit-saucer::after { content:""; position:absolute; left:7px; right:7px; bottom:-4px; height:5px; border-radius:999px; background:rgba(16,185,129,.72); filter:blur(3px); opacity:.78; }
        .aqua-planet { width:50px; height:50px; border-radius:50%; display:grid; place-items:center; background:radial-gradient(circle at 35% 25%, #f5e8ff 0 8%, #d946ef 24%, #8570ee 68%, #21135c 100%); box-shadow:0 0 28px rgba(133,112,238,.55), 0 0 70px rgba(217,70,239,.22); z-index:1; animation:aqua-planet-pulse 4s ease-in-out infinite; }
        .aqua-github { display:flex; justify-content:space-between; gap:12px; margin-top:18px; border-radius:15px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.05); padding:10px 12px; color:#8570ee; font-size:11px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }
        .aqua-section { max-width:1120px; margin:0 auto 64px; }
        .aqua-section-label { display:block; margin-bottom:6px; color:#8570ee; font-size:11px; font-weight:900; letter-spacing:.2em; text-transform:uppercase; }
        .aqua-section h2 { margin:0 0 24px; font-size:clamp(26px, 3vw, 38px); font-weight:900; letter-spacing:-.04em; }
        .aqua-bento { display:grid; grid-template-columns:1fr; gap:24px; }
        .aqua-panel { border-radius:28px; padding:24px; }
        .aqua-panel-head { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; font-size:14px; font-weight:900; }
        .aqua-status { border-radius:999px; padding:4px 10px; background:rgba(16,185,129,.1); color:#10b981; font-size:10px; }
        .aqua-box { border-radius:18px; border:1px solid rgba(255,255,255,.05); background:rgba(0,0,0,.4); padding:16px; margin-bottom:12px; }
        .aqua-box-label { display:flex; justify-content:space-between; margin-bottom:8px; color:#9595b1; font-size:11px; }
        .aqua-gradient-btn { width:100%; border-radius:18px; padding:14px 18px; background:linear-gradient(90deg,#8570ee,#d946ef); color:#fff; font-size:13px; font-weight:900; box-shadow:0 18px 44px rgba(133,112,238,.18); }
        .aqua-skill-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; border-top:1px solid rgba(255,255,255,.06); padding-top:22px; }
        .aqua-skill-grid span { display:block; color:#9595b1; font-size:10px; line-height:1.4; }
        .aqua-skill-grid strong { display:block; margin-top:6px; color:#10b981; font-size:16px; }
        .aqua-skill-meter { margin-top:10px; height:5px; overflow:hidden; border-radius:999px; background:rgba(255,255,255,.08); }
        .aqua-skill-meter b { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#8570ee,#d946ef); }
        .aqua-experience-list { display:grid; gap:12px; }
        .aqua-experience-item { border-radius:18px; border:1px solid rgba(255,255,255,.06); background:rgba(0,0,0,.26); padding:15px; }
        .aqua-experience-item h3 { margin:0; font-size:15px; font-weight:850; }
        .aqua-experience-item p { margin:7px 0 0; color:#9595b1; font-size:12px; line-height:1.6; }
        .aqua-tools { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
        .aqua-tool { border-radius:22px; padding:18px; color:#9595b1; font-size:12px; font-weight:800; transform:translateY(0); transition:transform .32s cubic-bezier(.16,1,.3,1), color .32s, border-color .32s; overflow:hidden; }
        .aqua-tool:hover { transform:translateY(-5px); color:#fff; border-color:rgba(217,70,239,.28); }
        .aqua-tool-top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
        .aqua-tool-orb { width:34px; height:34px; border-radius:14px; display:grid; place-items:center; background:linear-gradient(135deg,rgba(133,112,238,.24),rgba(217,70,239,.18)); color:#fff; box-shadow:0 0 24px rgba(133,112,238,.14); }
        .aqua-tool-category { color:#8570ee; font-size:10px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
        .aqua-tool-name { display:block; color:#fff; font-size:15px; font-weight:900; line-height:1.25; }
        .aqua-tool-meter { display:grid; grid-template-columns:repeat(5, minmax(0, 1fr)); gap:5px; margin-top:16px; }
        .aqua-tool-meter span { height:6px; border-radius:999px; background:rgba(255,255,255,.08); box-shadow:inset 0 0 0 1px rgba(255,255,255,.04); }
        .aqua-tool-meter span.active { background:linear-gradient(90deg,#8570ee,#d946ef); box-shadow:0 0 14px rgba(217,70,239,.32); }
        .aqua-media-grid, .aqua-award-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
        .aqua-media-card, .aqua-award-card { border-radius:22px; padding:18px; min-height:150px; transform:translateY(0); transition:transform .32s cubic-bezier(.16,1,.3,1), border-color .32s, box-shadow .32s; overflow:hidden; }
        .aqua-media-card.featured { grid-column:span 2; border-color:rgba(217,70,239,.34); background:linear-gradient(135deg,rgba(133,112,238,.18),rgba(217,70,239,.11)), rgba(13,10,25,.58); box-shadow:0 28px 72px rgba(133,112,238,.16); }
        .aqua-media-badge { display:inline-flex; width:max-content; margin-bottom:12px; border-radius:999px; background:rgba(217,70,239,.18); color:#fff; padding:6px 10px; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.14em; box-shadow:0 0 22px rgba(217,70,239,.22); }
        .aqua-media-card:hover, .aqua-award-card:hover { transform:translateY(-6px); }
        .aqua-media-card img, .aqua-media-card video { width:100%; height:130px; object-fit:cover; border-radius:16px; margin-bottom:14px; filter:brightness(1.12) saturate(1.12); }
        .aqua-media-card.featured img, .aqua-media-card.featured video { height:190px; }
        .aqua-media-card h3, .aqua-award-card h3 { margin:0 0 8px; font-size:16px; font-weight:850; }
        .aqua-media-card p, .aqua-award-card p { color:#9595b1; font-size:12px; line-height:1.65; }
        .aqua-footer { max-width:1280px; margin:0 auto 24px; padding:24px; border:1px solid rgba(255,255,255,.07); border-radius:30px; display:grid; grid-template-columns:1.35fr .8fr 1fr; gap:28px; color:#9595b1; font-size:12px; background:linear-gradient(135deg,rgba(13,10,25,.78),rgba(10,7,20,.5)); backdrop-filter:blur(22px); box-shadow:0 24px 70px rgba(0,0,0,.18); }
        .aqua-footer-brand { display:flex; align-items:center; gap:12px; color:#fff; font-size:18px; font-weight:900; }
        .aqua-footer-mark { width:42px; height:42px; border-radius:16px; display:grid; place-items:center; overflow:hidden; background:linear-gradient(135deg,#8570ee,#d946ef); box-shadow:0 0 28px rgba(133,112,238,.24); }
        .aqua-footer-mark img { width:100%; height:100%; object-fit:cover; }
        .aqua-footer-copy { margin:14px 0 0; max-width:360px; color:#9595b1; font-size:12px; line-height:1.7; }
        .aqua-footer-title { margin:0 0 12px; color:#fff; font-size:11px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; }
        .aqua-footer-links, .aqua-footer-contact { display:flex; flex-direction:column; align-items:flex-start; gap:10px; }
        .aqua-footer a { color:#9595b1; transition:color .25s ease, transform .25s ease; }
        .aqua-footer a:hover { color:#fff; transform:translateX(3px); }
        .aqua-footer-bottom { grid-column:1 / -1; display:flex; align-items:center; justify-content:space-between; gap:16px; padding-top:18px; border-top:1px solid rgba(255,255,255,.06); color:#6f6f8d; }
        .aqua-float { position:fixed; right:24px; bottom:24px; z-index:30; width:52px; height:52px; border-radius:50%; display:grid; place-items:center; font-size:20px; }
        .aqua-drawer { position:fixed; inset:0 0 0 auto; width:min(100%,390px); z-index:60; display:flex; flex-direction:column; justify-content:space-between; padding:24px; background:rgba(9,7,21,.96); backdrop-filter:blur(24px); border-left:1px solid rgba(255,255,255,.1); transform:translateX(105%); transition:transform .5s cubic-bezier(.16,1,.3,1); box-shadow:-30px 0 90px rgba(0,0,0,.42); }
        .aqua-drawer.open { transform:translateX(0); }
        .aqua-drawer-head { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,.06); padding-bottom:18px; margin-bottom:22px; }
        .aqua-drawer input, .aqua-drawer textarea { width:100%; border:0; outline:0; background:transparent; color:#fff; resize:none; font-size:14px; }
        .aqua-lightbox { position:fixed; inset:0; z-index:80; display:grid; place-items:center; padding:24px; background:rgba(2,6,23,.86); backdrop-filter:blur(8px); }
        .aqua-lightbox img { max-width:min(100%,1040px); max-height:86vh; object-fit:contain; border-radius:24px; box-shadow:0 24px 80px rgba(0,0,0,.5); }
        .aqua-project-modal { position:fixed; inset:0; z-index:78; display:grid; place-items:center; padding:24px; background:radial-gradient(circle at 50% 18%, rgba(133,112,238,.26), transparent 34%), rgba(4,3,10,.72); backdrop-filter:blur(14px); }
        .aqua-project-dialog { width:min(100%,820px); max-height:min(88vh,780px); overflow:auto; border-radius:34px; padding:0; background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.07)); border:1px solid rgba(255,255,255,.2); box-shadow:0 30px 110px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.18); }
        .aqua-project-dialog-hero { position:relative; min-height:180px; overflow:hidden; background:linear-gradient(135deg,rgba(133,112,238,.55),rgba(217,70,239,.36)); }
        .aqua-project-dialog-hero img { position:absolute; inset:0; height:100%; width:100%; object-fit:cover; opacity:.72; filter:saturate(1.08) brightness(1.08); }
        .aqua-project-dialog-hero::after { content:""; position:absolute; inset:0; background:linear-gradient(180deg,rgba(5,3,10,.08),rgba(5,3,10,.68)); }
        .aqua-project-dialog-head { position:relative; z-index:1; display:flex; align-items:flex-start; justify-content:space-between; gap:20px; padding:28px; }
        .aqua-project-dialog-content { padding:26px 28px 30px; background:linear-gradient(180deg,rgba(13,10,25,.72),rgba(13,10,25,.5)); }
        .aqua-project-dialog h3 { margin:0; max-width:620px; font-size:clamp(26px,3.2vw,42px); line-height:1.08; font-weight:950; letter-spacing:-.04em; text-shadow:0 18px 46px rgba(0,0,0,.4); }
        .aqua-project-dialog p { color:#e8e4ff; line-height:1.85; font-size:14px; }
        .aqua-project-dialog-body { white-space:pre-line; border-radius:22px; border:1px solid rgba(255,255,255,.09); background:rgba(255,255,255,.055); padding:18px; }
        .aqua-project-dialog-close { border-radius:999px; background:rgba(255,255,255,.88); color:#05030a; padding:9px 14px; font-size:12px; font-weight:950; box-shadow:0 12px 30px rgba(0,0,0,.24); transition:transform .25s ease, background .25s ease; }
        .aqua-project-dialog-close:hover { transform:translateY(-2px); background:#fff; }
        .aqua-project-dialog-meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
        .aqua-project-dialog-meta span { border-radius:999px; background:rgba(255,255,255,.1); color:#fff; padding:8px 11px; font-size:11px; font-weight:850; }
        .aqua-reveal { opacity:0; transform:translateY(24px) scale(.985); animation:aqua-fade-up .86s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes aqua-fade-up { to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes aqua-particle-drift { 0% { transform:translate3d(0,0,0) scale(.85); opacity:calc(var(--opacity) * .55); } 45% { transform:translate3d(28px,-34px,0) scale(1.22); opacity:var(--opacity); } 100% { transform:translate3d(-22px,26px,0) scale(.96); opacity:calc(var(--opacity) * .82); } }
        @keyframes aqua-pulse-dot { 0%,100% { opacity:.35; transform:scale(.85); } 50% { opacity:1; transform:scale(1.25); } }
        @keyframes aqua-glow { 0%,100% { transform:scale(1); opacity:.32; } 50% { transform:scale(1.16); opacity:.65; } }
        @keyframes aqua-saucer-path { 0%,100% { transform:translate(94px,-50%) scale(1); z-index:3; } 25% { transform:translate(-17px,24px) scale(.9); z-index:0; } 50% { transform:translate(-112px,-50%) scale(.78); z-index:0; opacity:.78; } 75% { transform:translate(-17px,-38px) scale(1.08); z-index:3; opacity:1; } }
        @keyframes aqua-planet-pulse { 0%,100% { transform:scale(1); filter:saturate(1); } 50% { transform:scale(1.06); filter:saturate(1.2); } }
        @media (max-width: 980px) { .aqua-nav { display:none; } .aqua-hero { grid-template-columns:1fr; text-align:center; } .aqua-metric-stack, .aqua-metric-stack.right { flex-direction:row; justify-content:center; align-items:center; text-align:center; flex-wrap:wrap; order:2; } .aqua-hero-center { order:1; } .aqua-deck, .aqua-deck-1, .aqua-deck-2, .aqua-bento, .aqua-media-grid, .aqua-award-grid, .aqua-footer { grid-template-columns:1fr; } .aqua-card-left, .aqua-card-center, .aqua-card-right { transform:none !important; min-height:auto; } .aqua-tools { grid-template-columns:repeat(2,minmax(0,1fr)); } .aqua-orbit-showcase { grid-template-columns:1fr; text-align:center; } .aqua-orbit-copy:nth-child(3) { text-align:center; } }
        @media (max-width: 620px) { .aqua-header { flex-direction:column; align-items:flex-start; } .aqua-main { margin-top:32px; padding-inline:16px; } .aqua-hero h1 { font-size:42px; } .aqua-skill-grid { grid-template-columns:1fr; } .aqua-panel { padding:18px; border-radius:22px; } .aqua-footer { margin-inline:16px; padding-bottom:92px; } .aqua-footer-bottom { flex-direction:column; align-items:flex-start; } }
      `}</style>

      <div className="aqua-grid-lines" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <div className="aqua-particles" aria-hidden="true">
        {particles.map((particle) => (
          <span
            className={`aqua-particle ${particle.streak ? 'aqua-particle-streak' : ''}`}
            key={particle.id}
            style={
              {
                '--left': particle.left,
                '--top': particle.top,
                '--size': particle.size,
                '--delay': particle.delay,
                '--duration': particle.duration,
                '--color': particle.color,
                '--opacity': particle.opacity
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="aqua-content">
        <header className="aqua-header aqua-reveal" style={{ animationDelay: '0.1s' }}>
          <nav className="aqua-nav">
            <a href="#about" onClick={(event) => scrollToSection('about', event)}>About</a>
            {navSections.map((section) => <a key={section} href={`#${navTargets[section]}`} onClick={(event) => scrollToSection(navTargets[section], event)}>{navLabels[section]}</a>)}
          </nav>
          <a className="aqua-logo" href="#top" aria-label="Home" onClick={(event) => scrollToSection('top', event)}>
            <span className="aqua-logo-mark">{data.user.avatarUrl ? <img className="h-full w-full rounded-full object-cover" src={data.user.avatarUrl} alt={data.user.displayName} /> : (data.user.displayName || 'A').slice(0, 1)}</span>
            <span>{data.user.username || data.user.displayName || 'AQUA.dev'}</span>
          </a>
          <button className="aqua-btn" type="button" onClick={() => setIsDrawerOpen(true)}>Hire Me</button>
        </header>

        <main className="aqua-main flex flex-col" id="top">
          <section className="aqua-hero" id="about" style={{ order: -2 }}>
            <div className="aqua-metric-stack aqua-reveal" style={{ animationDelay: '0.35s' }}>
              <button className="aqua-circle-btn" type="button" onClick={(event) => scrollToSection('projects', event)}>↘</button>
              <div className="aqua-metric"><strong>{metricYears}</strong><span>Experience</span></div>
              <div className="aqua-metric"><strong>{projects.length}+</strong><span>Delivered Projects</span></div>
            </div>

            <div className="aqua-hero-center aqua-reveal" style={{ animationDelay: '0.2s' }}>
              <p className="aqua-identity">{data.user.title || 'Creative Portfolio'}</p>
              <h1>
                <span>{aboutCopy.title}</span>
              </h1>
              <p>{aboutCopy.description || data.user.fullBio || 'Creative developer and UI designer specializing in interactive experiences, custom portfolio systems, and polished digital products.'}</p>
              <div className="aqua-start">
                <span>Start a project</span>
                <button type="button" onClick={() => setIsDrawerOpen(true)}>→</button>
              </div>
            </div>

            <div className="aqua-metric-stack right aqua-reveal" style={{ animationDelay: '0.4s' }}>
              <button className="aqua-circle-btn" type="button" onClick={() => setIsDrawerOpen(true)}>↗</button>
              <div className="aqua-metric"><strong>{data.user.location || 'Remote'}</strong><span>Current Base</span></div>
              <div className="aqua-metric"><strong>{awards.length || skills.length}</strong><span>Proof Points</span></div>
            </div>
          </section>

          <section className="aqua-glass aqua-orbit-showcase aqua-reveal" aria-label="Aqua orbit signature" style={{ animationDelay: '0.45s', order: -1 }}>
            <div className="aqua-orbit-copy">
              <span>Orbit Signal</span>
              <strong>{featuredProject?.category || 'Selected portfolio system'}</strong>
            </div>
            <div className="aqua-orbit"><div className="aqua-orbit-line" /><div className="aqua-orbit-runner"><div className="aqua-orbit-saucer" /></div><div className="aqua-planet">✦</div></div>
            <div className="aqua-orbit-copy">
              <span>Skill Signal</span>
              <strong title={skills.map((skill) => skill.name).join(', ')}>{orbitSkillSignal}</strong>
            </div>
          </section>

          {projects.length ? (
            <section className="aqua-section aqua-reveal" id="projects" style={{ animationDelay: '0.5s', order: sectionOrder.projects }}>
              <span className="aqua-section-label">{projectsCopy.label}</span>
              <h2>{projectsCopy.title}</h2>
              {projectsCopy.description ? <p className="mb-8 text-xs leading-6 text-[#9595b1]">{projectsCopy.description}</p> : null}
              <div className={`aqua-deck aqua-deck-${Math.min(deckProjects.length, 3)}`} onMouseMove={deckProjects.length >= 3 ? handleDeckMove : undefined} onMouseLeave={deckProjects.length >= 3 ? resetDeck : undefined}>
                {deckProjects.map((project, index) => (
                  <ProjectMiniCard project={project} variant={projectVariant(index, deckProjects.length)} key={project.id || project.slug || project.title} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="aqua-section aqua-reveal" id="experience" style={{ animationDelay: '0.6s', order: sectionOrder.experience }}>
            <span className="aqua-section-label">{experienceCopy.label}</span>
            <h2>{experienceCopy.title}</h2>
            {experienceCopy.description ? <p className="mb-6 text-xs leading-6 text-[#9595b1]">{experienceCopy.description}</p> : null}
            <div className="aqua-bento">
              <div className="aqua-glass aqua-panel">
                <div className="aqua-panel-head"><span>Experience Timeline</span><span className="aqua-status">{data.config.showExperience ? 'From Form' : 'Hidden'}</span></div>
                {data.config.showExperience && data.experiences.length ? (
                  <div className="aqua-experience-list">
                    {byOrder(data.experiences).slice(0, 3).map((experience) => (
                      <article className="aqua-experience-item" key={experience.id || `${experience.company}-${experience.position}`}>
                        <div className="aqua-box-label">
                          <span>{experience.startDate || 'Start'} - {experience.isCurrent ? 'Now' : experience.endDate || 'Present'}</span>
                          <span>{experience.type}</span>
                        </div>
                        <h3>{experience.position || 'Role'} · {experience.company || 'Organization'}</h3>
                        {experience.description ? <p>{experience.description}</p> : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-6 text-[#9595b1]">经历模块关闭或尚未填写，此处不会展示无关占位内容。</p>
                )}
              </div>

            </div>
          </section>

          {data.config.showSkills && skills.length ? (
            <section className="aqua-section aqua-reveal" id="skills" style={{ animationDelay: '0.7s', order: Math.min(sectionOrder.skills ?? 99, sectionOrder.awards ?? 99) }}>
              <div className="mb-8 text-center">
                <span className="text-xs uppercase tracking-[.22em] text-[#9595b1]">{skillsCopy.label}</span>
                {skillsCopy.title ? <h2 className="mt-3 text-3xl font-black">{skillsCopy.title}</h2> : null}
                {skillsCopy.description ? <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-[#9595b1]">{skillsCopy.description}</p> : null}
              </div>
              <div className="aqua-tools">
                {previewSkills.map((skill, index) => (
                  <article className="aqua-glass aqua-tool" key={skill.id || skill.name}>
                    <div className="aqua-tool-top">
                      <span className="aqua-tool-orb">{String(index + 1).padStart(2, '0')}</span>
                      <span className="aqua-tool-category">{skill.category || 'Capability'}</span>
                    </div>
                    <strong className="aqua-tool-name">{skill.name}</strong>
                    <div className="aqua-tool-meter" aria-label={`${skill.name} proficiency ${skill.proficiency} of 5`}>
                      {[1, 2, 3, 4, 5].map((level) => <span className={level <= skill.proficiency ? 'active' : ''} key={level} />)}
                    </div>
                  </article>
                ))}
              </div>
              {hiddenSkillCount ? (
                <button className="aqua-btn mt-8" type="button" onClick={() => setShowAllSkills(true)}>View all skills +{hiddenSkillCount}</button>
              ) : null}
            </section>
          ) : null}

          {data.config.showVideos && videos.length ? (
            <section className="aqua-section aqua-reveal" id="videos" style={{ order: sectionOrder.videos }}>
              <span className="aqua-section-label">{videosCopy.label}</span>
              <h2>{videosCopy.title}</h2>
              {videosCopy.description ? <p className="mb-6 text-xs leading-6 text-[#9595b1]">{videosCopy.description}</p> : null}
              <div className="aqua-media-grid">
                {videos.slice(0, 3).map((video) => (
                  <a className={`aqua-glass aqua-media-card ${video.isFeatured ? 'featured' : ''}`} href={video.videoUrl} target="_blank" rel="noreferrer" key={video.id || video.videoUrl}>
                    {video.isFeatured ? <span className="aqua-media-badge">Featured Demo</span> : null}
                    {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} /> : null}
                    <h3>{video.title}</h3>
                    <p>{video.description || video.platform}</p>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {data.config.showAwards && awards.length ? (
            <section className="aqua-section aqua-reveal" id="awards" style={{ order: sectionOrder.awards }}>
              <span className="aqua-section-label">{awardsCopy.label}</span>
              <h2>{awardsCopy.title}</h2>
              {awardsCopy.description ? <p className="mb-6 text-xs leading-6 text-[#9595b1]">{awardsCopy.description}</p> : null}
              <div className="aqua-award-grid">{awards.slice(0, 3).map((award) => <article className="aqua-glass aqua-award-card" key={award.id || award.title}><div className="aqua-pill">{award.date || award.issuer}</div><h3>{award.title}</h3><p>{award.description || award.issuer}</p></article>)}</div>
            </section>
          ) : null}
        </main>

        <footer className="aqua-footer" id="contact">
          <div>
            <a className="aqua-footer-brand" href="#top" onClick={(event) => scrollToSection('top', event)}>
              <span className="aqua-footer-mark">{data.user.avatarUrl ? <img src={data.user.avatarUrl} alt={data.user.displayName} /> : (data.user.displayName || 'A').slice(0, 1)}</span>
              <span>{data.user.displayName || data.user.username || 'Aqua.dev'}</span>
            </a>
            <p className="aqua-footer-copy">{data.user.bio || 'A focused personal portfolio for selected works, skills, recognition, and collaboration.'}</p>
          </div>
          <div>
            <h3 className="aqua-footer-title">Navigate</h3>
            <nav className="aqua-footer-links">
              <a href="#about" onClick={(event) => scrollToSection('about', event)}>About</a>
              <a href="#projects" onClick={(event) => scrollToSection('projects', event)}>Works</a>
              {data.config.showSkills && skills.length ? <a href="#skills" onClick={(event) => scrollToSection('skills', event)}>Skills</a> : null}
              <a href="#contact" onClick={(event) => scrollToSection('contact', event)}>Contact</a>
            </nav>
          </div>
          <div>
            <h3 className="aqua-footer-title">Contact</h3>
            <div className="aqua-footer-contact">
              {data.user.email ? <a href={`mailto:${data.user.email}`}>{data.user.email}</a> : null}
              {data.user.location ? <span>{data.user.location}</span> : null}
              {socials.map((social) => <a key={social.id || social.url} href={social.url} target="_blank" rel="noreferrer">{social.platform}</a>)}
            </div>
          </div>
          <div className="aqua-footer-bottom">
            <span>© 2026 {data.user.displayName || 'Aqua.dev'}. All rights reserved.</span>
            <span>Built with SiteForge</span>
          </div>
        </footer>
      </div>

      <button className="aqua-glass aqua-float" type="button" onClick={() => setIsDrawerOpen(true)}>✉</button>
      <aside className={`aqua-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div>
          <div className="aqua-drawer-head"><strong>{contactCopy.title}</strong><button type="button" onClick={() => setIsDrawerOpen(false)}>×</button></div>
          {contactCopy.description ? <p className="mb-4 text-xs leading-6 text-[#9595b1]">{contactCopy.description}</p> : null}
          <div className="aqua-box"><label className="aqua-muted mb-1 block text-[10px]">Contact Email</label>{data.user.email ? <a className="text-sm font-bold text-white" href={`mailto:${data.user.email}`}>{data.user.email}</a> : <span className="text-sm text-[#9595b1]">Email hidden for this published version.</span>}</div>
          {data.user.location ? <div className="aqua-box"><label className="aqua-muted mb-1 block text-[10px]">Location</label><span className="text-sm text-white">{data.user.location}</span></div> : null}
          {socials.length ? <div className="aqua-box"><label className="aqua-muted mb-2 block text-[10px]">Social Links</label><div className="flex flex-wrap gap-2">{socials.map((social) => <a className="aqua-pill" href={social.url} target="_blank" rel="noreferrer" key={social.id || social.url}>{social.platform}</a>)}</div></div> : null}
        </div>
        <button className="aqua-gradient-btn" type="button" onClick={() => setIsDrawerOpen(false)}>Close Contact Panel</button>
      </aside>
      {showAllSkills ? (
        <div className="aqua-project-modal" role="dialog" aria-modal="true" aria-label="All skills" onClick={() => setShowAllSkills(false)}>
          <div className="aqua-project-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="aqua-project-dialog-hero">
              <div className="aqua-project-dialog-head">
                <div>
                  <div className="aqua-pill">{skillsCopy.label}</div>
                  <h3>All Skills</h3>
                </div>
                <button className="aqua-project-dialog-close" type="button" onClick={() => setShowAllSkills(false)}>Close</button>
              </div>
            </div>
            <div className="aqua-project-dialog-content">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {skills.map((skill, index) => (
                  <article className="aqua-glass aqua-tool" key={skill.id || skill.name}>
                    <div className="aqua-tool-top">
                      <span className="aqua-tool-orb">{String(index + 1).padStart(2, '0')}</span>
                      <span className="aqua-tool-category">{skill.category || 'Capability'}</span>
                    </div>
                    <strong className="aqua-tool-name">{skill.name}</strong>
                    <div className="aqua-tool-meter" aria-label={`${skill.name} proficiency ${skill.proficiency} of 5`}>
                      {[1, 2, 3, 4, 5].map((level) => <span className={level <= skill.proficiency ? 'active' : ''} key={level} />)}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {selectedProject ? (
        <div className="aqua-project-modal" role="dialog" aria-modal="true" aria-label={`${selectedProject.title} details`} onClick={() => setSelectedProject(null)}>
          <div className="aqua-project-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="aqua-project-dialog-hero">
              {projectImage(selectedProject) ? <img src={projectImage(selectedProject)} alt="" /> : null}
              <div className="aqua-project-dialog-head">
                <div>
                  <div className="aqua-pill">{selectedProject.category || 'Selected Work'}</div>
                  <h3>{selectedProject.title || 'Untitled Project'}</h3>
                </div>
                <button className="aqua-project-dialog-close" type="button" onClick={() => setSelectedProject(null)}>Close</button>
              </div>
            </div>
            <div className="aqua-project-dialog-content">
              {selectedProject.description ? <p>{selectedProject.description}</p> : null}
              {selectedProject.content ? <p className="aqua-project-dialog-body mt-4">{selectedProject.content}</p> : null}
              <div className="aqua-project-dialog-meta">
                {selectedProject.role ? <span>{selectedProject.role}</span> : null}
                {selectedProject.tools ? selectedProject.tools.split(',').map((tool) => <span key={tool.trim()}>{tool.trim()}</span>) : null}
                {selectedProject.startDate ? <span>{selectedProject.startDate}{selectedProject.endDate ? ` - ${selectedProject.endDate}` : ''}</span> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {previewImage ? <button className="aqua-lightbox" type="button" onClick={() => setPreviewImage(null)}><img src={previewImage.src} alt={previewImage.alt} /></button> : null}
    </div>
  );
}
