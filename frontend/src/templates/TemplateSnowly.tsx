import { AlertTriangle, ArrowRight, Award as AwardIcon, BriefcaseBusiness, ChevronLeft, ChevronRight, Github, Linkedin, Mail, MapPin, PhoneCall, Sparkles, Star, Wand2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { getAboutSectionCopy, getOrderedSections, getSectionCopy } from '@siteforge/shared';
import type { Award, Project, SiteData, SocialLink } from '@siteforge/shared';

interface TemplateSnowlyProps {
  data: SiteData;
}

const snowlyNavTargets: Record<string, string> = { projects: 'work', videos: 'videos', awards: 'awards', skills: 'skills', contact: 'contact' };
const snowlyNavLabels: Record<string, string> = { projects: 'Work', videos: 'Videos', awards: 'Awards', skills: 'Skills', contact: 'Contact' };

function textColor(primaryColor: string) {
  return { color: primaryColor };
}

function bgColor(primaryColor: string) {
  return { backgroundColor: primaryColor };
}

function iconForSocial(link: SocialLink) {
  const key = `${link.icon || link.platform}`.toLowerCase();
  if (key.includes('github')) return <Github className="h-4 w-4" />;
  if (key.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
  if (key.includes('mail') || key.includes('email')) return <Mail className="h-4 w-4" />;
  return <ArrowRight className="h-4 w-4" />;
}

function isDirectVideoUrl(url: string) {
  return url.startsWith('blob:') || /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url);
}

function formatExperiencePeriod(startDate: string, endDate?: string, isCurrent?: boolean) {
  return `${startDate || '开始时间'} - ${isCurrent ? 'Now' : endDate || '结束时间'}`;
}

function EmptyMediaPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 px-4 text-center text-xs font-bold uppercase tracking-wide text-slate-400">
      {label}
    </div>
  );
}
function ProjectCard({
  project,
  featured,
  primaryColor,
  onPreview,
  animation = 'fade-up',
  delay = 0
}: {
  project: Project;
  featured?: boolean;
  primaryColor: string;
  onPreview: (image: { src: string; alt: string }) => void;
  animation?: 'fade-up' | 'fade-left' | 'fade-right';
  delay?: number;
}) {
  const gallery = [...(project.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 4);

  return (
    <article data-aos={animation} style={{ transitionDelay: `${delay}ms` }} className={`group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${featured ? 'lg:col-span-2' : ''}`}>
      <div className="relative h-64 overflow-hidden bg-slate-200">
        {project.coverImage ? (
          <button type="button" className="h-full w-full cursor-zoom-in" onClick={() => onPreview({ src: project.coverImage, alt: project.title })} aria-label={`预览 ${project.title}`}>
            <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          </button>
        ) : (
          <EmptyMediaPlaceholder label="请选择封面图" />
        )}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-slate-700 backdrop-blur">
          {project.category}
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-xl font-black text-slate-950">{project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
          {project.role ? <span className="rounded-full bg-slate-100 px-3 py-1">{project.role}</span> : null}
          {project.tools ? <span className="rounded-full bg-slate-100 px-3 py-1">{project.tools}</span> : null}
          {project.startDate ? <span className="rounded-full bg-slate-100 px-3 py-1">{project.startDate}{project.endDate ? ` - ${project.endDate}` : ''}</span> : null}
        </div>
        {project.content ? <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{project.content}</p> : null}
        {gallery.length ? (
          <div className="grid grid-cols-2 gap-2">
            {gallery.filter((image) => image.imageUrl).map((image) => (
              <figure key={image.id || image.imageUrl} className="overflow-hidden rounded-xl bg-slate-100">
                <button type="button" className="h-28 w-full cursor-zoom-in" onClick={() => onPreview({ src: image.imageUrl, alt: image.caption || project.title })} aria-label={`预览 ${image.caption || project.title}`}>
                  <img src={image.imageUrl} alt={image.caption || project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </button>
                {image.caption ? <figcaption className="px-3 py-2 text-[11px] font-bold text-slate-500">{image.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-4">
          {project.projectUrl ? (
            <a href={project.projectUrl} className="inline-flex items-center gap-2 text-sm font-extrabold" style={textColor(primaryColor)}>
              查看项目 <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}
          {project.githubUrl ? (
            <a href={project.githubUrl} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500">
              Source <Github className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function AwardCard({ award, primaryColor, delay = 0 }: { award: Award; primaryColor: string; delay?: number }) {
  return (
    <article data-aos="fade-up" style={{ transitionDelay: `${delay}ms` }} className="group h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md" style={bgColor(primaryColor)}>
          <AwardIcon className="h-5 w-5" />
        </div>
        {award.date ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500">{award.date}</span> : null}
      </div>
      <p className="text-xs font-extrabold uppercase tracking-wider" style={textColor(primaryColor)}>{award.issuer}</p>
      <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">{award.title}</h3>
      {award.description ? <p className="mt-3 text-sm leading-6 text-slate-500">{award.description}</p> : null}
    </article>
  );
}

export function TemplateSnowly({ data }: TemplateSnowlyProps) {
  const { user, config } = data;
  const primaryColor = config.primaryColor || '#3b0764';
  const visibleProjects = [...data.projects].sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleExperiences = [...data.experiences].sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleSkills = [...data.skills].sort((a, b) => a.displayOrder - b.displayOrder);
  const previewSkills = visibleSkills.slice(0, 6);
  const hiddenSkillCount = Math.max(0, visibleSkills.length - previewSkills.length);
  const visibleAwards = [...data.awards].sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleSocials = [...data.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleVideos = [...data.videos].sort((a, b) => a.displayOrder - b.displayOrder);
  const heroImages = (config.heroImages ?? []).filter(Boolean);
  const [heroIndex, setHeroIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const heroImage = heroImages[heroIndex] || 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&w=1920&q=80';
  const showHeroControls = heroImages.length > 1;
  const navLinkClass = (sectionId: string) =>
    `relative py-1 transition-colors hover:text-slate-950 ${activeSection === sectionId ? 'text-slate-950' : ''}`;
  const aboutCopy = getAboutSectionCopy(data, { label: 'About', title: 'A focused space for your work, story, and capabilities.' });
  const projectsCopy = getSectionCopy(data, 'projects', { label: 'Selected Work', title: 'Recent projects with practical depth.' });
  const awardsCopy = getSectionCopy(data, 'awards', { label: 'Awards', title: 'Honors and professional recognition.' });
  const skillsCopy = getSectionCopy(data, 'skills', { label: 'Skills', title: 'Tools and strengths.' });
  const videosCopy = getSectionCopy(data, 'videos', { label: 'Video', title: 'Stories, demos, and walkthroughs.' });
  const experienceCopy = getSectionCopy(data, 'experience', { label: 'Experience', title: 'Experience' });
  const contactCopy = getSectionCopy(data, 'contact', { label: 'Contact', title: 'Available for selected collaborations', description: 'Portfolio reviews, freelance projects, and role opportunities can start here.' });
  const sectionOrder = Object.fromEntries(getOrderedSections(data).map((section, index) => [section, index])) as Record<string, number>;
  const aboutBody = user.fullBio || user.bio || '';
  const aboutDescription = aboutCopy.description?.trim() && aboutCopy.description.trim() !== aboutBody.trim()
    ? aboutCopy.description
    : '';
  const navSections = getOrderedSections(data).filter((section) => {
    if (section === 'projects') return visibleProjects.length;
    if (section === 'videos') return config.showVideos && visibleVideos.length;
    if (section === 'awards') return config.showAwards && visibleAwards.length;
    if (section === 'skills') return config.showSkills && visibleSkills.length;
    return section === 'contact';
  });

  function showHeroImage(index: number) {
    if (!heroImages.length) return;
    setHeroIndex((index + heroImages.length) % heroImages.length);
  }

  useEffect(() => {
    setHeroIndex(0);
  }, [heroImages.length]);

  useEffect(() => {
    if (!showHeroControls) return undefined;
    const timer = window.setInterval(() => {
      setHeroIndex((index) => (index + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroImages.length, showHeroControls]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.sf-reveal, [data-aos]'));
    const reveal = (element: HTMLElement) => {
      element.classList.add('sf-visible');
      element.classList.add('aos-animate');
    };

    if (!('IntersectionObserver' in window)) {
      elements.forEach(reveal);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

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

  useEffect(() => {
    const sectionIds = ['about', ...navSections.map((section) => snowlyNavTargets[section])];
    const sections = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return undefined;

    function updateActiveSection() {
      const navHeight = document.querySelector('nav')?.getBoundingClientRect().height ?? 0;
      const activationLine = navHeight + window.innerHeight * 0.22;
      let currentSection = '';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= activationLine && rect.bottom > navHeight + 24) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    }

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [config.showAwards, config.showSkills, config.showVideos, data.config.moduleOrder, navSections, visibleAwards.length, visibleProjects.length, visibleSkills.length, visibleVideos.length]);

  return (
    <div className="min-h-screen bg-[#fafbfe] font-sans text-slate-800">
      <nav className="sticky top-0 z-40 border-b border-white/45 bg-white/82 shadow-sm shadow-slate-900/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <a href="#hero-section" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-xl font-black text-white shadow-md" style={bgColor(primaryColor)}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName || 'Avatar'} className="h-full w-full object-cover" />
              ) : (
                user.displayName.slice(0, 1) || 'S'
              )}
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-950">{user.displayName || 'SiteForge'}</span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex" style={{ '--active-nav-color': primaryColor } as CSSProperties}>
            <a href="#about" className={navLinkClass('about')} style={activeSection === 'about' ? ({ color: '#0f172a' } as CSSProperties) : undefined}>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full" style={{ backgroundColor: activeSection === 'about' ? primaryColor : 'transparent' }} />
              About
            </a>
            {navSections.map((section) => (
              <a key={section} href={`#${snowlyNavTargets[section]}`} className={navLinkClass(snowlyNavTargets[section])} style={activeSection === snowlyNavTargets[section] ? ({ color: '#0f172a' } as CSSProperties) : undefined}>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full" style={{ backgroundColor: activeSection === snowlyNavTargets[section] ? primaryColor : 'transparent' }} />
                {snowlyNavLabels[section]}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            {visibleSocials.slice(0, 3).map((link) => (
              <a key={link.id || link.url} href={link.url} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:text-white" style={{ '--hover-color': primaryColor } as CSSProperties} onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = primaryColor)} onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = '#f8fafc')}>
                {iconForSocial(link)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section id="hero-section" className="relative flex min-h-[720px] items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover opacity-95 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/40 to-transparent" />
        </div>
        <div className="relative z-10 flex w-full items-center px-4 py-20 md:px-8 lg:px-[7vw]">
          <div data-aos="fade-right" className="sf-hero-card ml-0 mr-auto max-w-[640px] rounded-3xl border border-white/25 p-8 text-white shadow-2xl backdrop-blur-2xl md:p-12 lg:p-14" style={{ background: `linear-gradient(135deg, ${primaryColor}99 0%, ${primaryColor}85 54%, #2400448f 100%)`, boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.18), 0 28px 80px rgb(0 0 0 / 0.35)' }}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold shadow-inner shadow-white/10">
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              {user.location || 'Personal Website'} · {showHeroControls ? '图片轮播' : '静态封面'}
            </div>
            <h1 className="mb-6 text-4xl font-black leading-[0.98] tracking-tight md:text-6xl lg:text-7xl">{user.title || 'Build your personal digital presence'}</h1>
            <p className="mb-10 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">{user.bio || 'Use SiteForge to turn your profile, work, and ideas into a polished personal website.'}</p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a href="#work" className="rounded-xl bg-white px-7 py-4 text-center text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:scale-105 hover:bg-slate-50 active:scale-95" style={textColor(primaryColor)}>
                Explore Work
              </a>
              <a href="#contact" className="rounded-xl border border-white/20 bg-black/20 px-7 py-4 text-center text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:scale-105 hover:bg-black/30 active:scale-95">
                Contact Me
              </a>
            </div>
          </div>
        </div>
        {showHeroControls ? (
          <>
            <div className="absolute bottom-8 left-4 z-20 flex items-center gap-2 md:left-8 lg:left-[7vw]">
              {heroImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  aria-label={`Hero image ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${index === heroIndex ? 'w-12 bg-white shadow-lg' : 'w-2 bg-white/45 hover:bg-white/75'}`}
                  onClick={() => showHeroImage(index)}
                />
              ))}
            </div>
            <div className="absolute bottom-8 right-4 z-20 flex items-center gap-3 md:right-8">
              <button
                type="button"
                aria-label="Previous hero image"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white shadow-xl backdrop-blur transition hover:scale-105 hover:bg-white/25 active:scale-95"
                onClick={() => showHeroImage(heroIndex - 1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next hero image"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white shadow-xl backdrop-blur transition hover:scale-105 hover:bg-white/25 active:scale-95"
                onClick={() => showHeroImage(heroIndex + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : null}
      </section>

      <section id="about" className="sf-reveal mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl" data-aos="fade-up">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider" style={textColor(primaryColor)}>
              <Sparkles className="h-4 w-4" /> {aboutCopy.label}
            </span>
            <h2 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">{aboutCopy.title}</h2>
            {aboutDescription ? <p className="mt-4 text-sm leading-7 text-slate-500">{aboutDescription}</p> : null}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5" data-aos="fade-right">
            <img src={user.avatarUrl || 'https://i.pravatar.cc/300?img=11'} alt={user.displayName} className="sf-float-subtle aspect-square w-full rounded-3xl object-cover shadow-xl" />
          </div>
          <div className="space-y-6 lg:col-span-7" data-aos="fade-left">
            <p className="text-lg leading-8 text-slate-600">{aboutBody}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-4xl font-black" style={textColor(primaryColor)}>{visibleProjects.length}+</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Projects</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-4xl font-black" style={textColor(primaryColor)}>{visibleSkills.length}+</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Skills</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col">
      {visibleProjects.length > 0 ? (
        <section id="work" className="sf-reveal border-y border-slate-200/70 bg-white px-4 py-20 md:px-8" style={{ order: sectionOrder.projects }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl" data-aos="fade-up">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider" style={textColor(primaryColor)}>
                <BriefcaseBusiness className="h-4 w-4" /> {projectsCopy.label}
              </span>
              <h2 className="text-3xl font-black text-slate-950 md:text-5xl">{projectsCopy.title}</h2>
              {projectsCopy.description ? <p className="mt-4 text-sm leading-7 text-slate-500">{projectsCopy.description}</p> : null}
            </div>
            <div className={`grid gap-6 ${config.layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {visibleProjects.map((project, index) => (
                <ProjectCard key={project.id || project.slug} project={project} featured={project.isFeatured && config.layout !== 'list'} primaryColor={primaryColor} onPreview={setPreviewImage} animation={index % 2 === 0 ? 'fade-right' : 'fade-left'} delay={(index % 3) * 100} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {config.showAwards && visibleAwards.length > 0 ? (
        <section id="awards" className="sf-reveal bg-slate-50 px-4 py-20 md:px-8" style={{ order: sectionOrder.awards }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl" data-aos="fade-up">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider shadow-sm" style={textColor(primaryColor)}>
                <AwardIcon className="h-4 w-4" /> {awardsCopy.label}
              </span>
              <h2 className="text-3xl font-black text-slate-950 md:text-5xl">{awardsCopy.title}</h2>
              {awardsCopy.description ? <p className="mt-4 text-sm leading-7 text-slate-500">{awardsCopy.description}</p> : null}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleAwards.map((award, index) => (
                <AwardCard key={award.id || `${award.title}-${award.issuer}`} award={award} primaryColor={primaryColor} delay={(index % 3) * 100} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {config.showSkills && visibleSkills.length > 0 ? (
        <section id="skills" className="sf-reveal mx-auto max-w-7xl px-4 py-20 md:px-8" style={{ order: sectionOrder.skills }}>
          <div className="mb-10 max-w-2xl" data-aos="fade-up">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider" style={textColor(primaryColor)}>
              <Wand2 className="h-4 w-4" /> {skillsCopy.label}
            </span>
            <h2 className="text-3xl font-black text-slate-950 md:text-5xl">{skillsCopy.title}</h2>
            {skillsCopy.description ? <p className="mt-4 text-sm leading-7 text-slate-500">{skillsCopy.description}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {previewSkills.map((skill, index) => (
              <div key={skill.id || skill.name} data-aos="fade-up" style={{ transitionDelay: `${(index % 3) * 100}ms` }} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-950">{skill.name}</h3>
                  <span className="text-xs font-bold text-slate-400">{skill.category}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full" style={{ ...bgColor(primaryColor), width: `${skill.proficiency * 20}%` }} />
                </div>
              </div>
            ))}
          </div>
          {hiddenSkillCount ? (
            <button type="button" onClick={() => setShowAllSkills(true)} className="mt-8 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
              查看全部技能 +{hiddenSkillCount}
            </button>
          ) : null}
        </section>
      ) : null}

      {config.showVideos && visibleVideos.length > 0 ? (
        <section id="videos" className="sf-reveal border-y border-slate-200/70 bg-white px-4 py-20 md:px-8" style={{ order: sectionOrder.videos }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl" data-aos="fade-up">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider" style={textColor(primaryColor)}>
                <Sparkles className="h-4 w-4" /> {videosCopy.label}
              </span>
              <h2 className="text-3xl font-black text-slate-950 md:text-5xl">{videosCopy.title}</h2>
              {videosCopy.description ? <p className="mt-4 text-sm leading-7 text-slate-500">{videosCopy.description}</p> : null}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {visibleVideos.map((video, index) => (
                <article key={video.id || video.videoUrl} data-aos={index % 2 === 0 ? 'fade-right' : 'fade-left'} style={{ transitionDelay: `${(index % 3) * 100}ms` }} className={`overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ${video.isFeatured ? 'lg:col-span-2' : ''}`}>
                  {isDirectVideoUrl(video.videoUrl) ? (
                    <div className="bg-slate-950">
                      <video src={video.videoUrl} poster={video.thumbnailUrl} className="h-64 w-full object-cover" controls />
                      <div className="p-5">
                        <p className="text-xs font-black uppercase tracking-wider" style={textColor(primaryColor)}>{video.platform}</p>
                        <h3 className="mt-2 text-xl font-black text-slate-950">{video.title}</h3>
                        {video.description ? <p className="mt-2 text-sm leading-6 text-slate-500">{video.description}</p> : null}
                      </div>
                    </div>
                  ) : (
                  <a href={video.videoUrl} className="group block" target="_blank" rel="noreferrer">
                    <div className="relative h-64 overflow-hidden bg-slate-900">
                      {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" /> : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                      <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wider" style={textColor(primaryColor)}>{video.platform}</div>
                      <div className="absolute bottom-5 left-5 right-5">
                        <h3 className="text-xl font-black text-white">{video.title}</h3>
                        {video.description ? <p className="mt-2 text-sm leading-6 text-white/75">{video.description}</p> : null}
                      </div>
                    </div>
                  </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {config.showExperience && visibleExperiences.length > 0 ? (
        <section id="experience" className="sf-reveal bg-slate-50 px-4 py-20 md:px-8" style={{ order: sectionOrder.experience }}>
          <div className="mx-auto max-w-7xl">
            <div data-aos="fade-up" className="mb-10 max-w-2xl">
              <span className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider" style={textColor(primaryColor)}>{experienceCopy.label}</span>
              <h2 className="text-3xl font-black text-slate-950 md:text-5xl">{experienceCopy.title}</h2>
              {experienceCopy.description ? <p className="mt-4 text-sm leading-7 text-slate-500">{experienceCopy.description}</p> : null}
            </div>
            <div className="grid gap-4">
              {visibleExperiences.map((experience, index) => (
                <div key={experience.id || `${experience.company}-${experience.startDate}`} data-aos="fade-up" style={{ transitionDelay: `${(index % 3) * 100}ms` }} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider" style={textColor(primaryColor)}>{experience.type === 'education' ? 'Education' : 'Work'}</p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">{experience.position}</h3>
                      <p className="text-sm font-bold text-slate-500">{experience.company}</p>
                    </div>
                    <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500">{formatExperiencePeriod(experience.startDate, experience.endDate, experience.isCurrent)}</p>
                  </div>
                  {experience.description ? <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{experience.description}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="contact" className="sf-reveal" style={{ order: sectionOrder.contact }}>
        <div className="px-4 py-12 text-white md:px-8" style={bgColor(primaryColor)}>
          <div data-aos="fade-up" className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
                <AlertTriangle className="h-7 w-7 text-amber-300" />
              </div>
              <div className="hidden">
                <h2 className="text-xl font-black md:text-2xl">准备好开启下一次合作？</h2>
                <p className="mt-1 text-xs font-light text-white/75">作品交流、项目合作或职位机会，都可以从这里开始。</p>
              </div>
              <div>
                <h2 className="text-xl font-black md:text-2xl">{contactCopy.title}</h2>
                <p className="mt-1 text-xs font-light text-white/75">{contactCopy.description}</p>
              </div>
            </div>
            <a href={user.email ? `mailto:${user.email}` : '#contact'} className="flex items-center gap-3.5 rounded-2xl bg-white px-6 py-3.5 text-slate-950 shadow-xl transition hover:scale-105 hover:shadow-2xl active:scale-95">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={bgColor(primaryColor)}>
                <PhoneCall className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start a conversation</p>
                <p className="text-sm font-black text-slate-950">{user.email || 'Get in touch'}</p>
              </div>
            </a>
          </div>
        </div>

        <footer className="border-t border-purple-950/20 bg-slate-950 px-4 pb-8 pt-16 text-slate-300 md:px-8">
          <div data-aos="fade-up" className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-4">
              <a href="#hero-section" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-xl font-black text-white" style={bgColor(primaryColor)}>
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.displayName || 'Avatar'} className="h-full w-full object-cover" /> : user.displayName.slice(0, 1) || 'S'}
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">{user.displayName || 'SiteForge'}</span>
              </a>
              <p className="max-w-sm text-xs leading-relaxed text-slate-400">
                {user.bio || '用作品、经历和想法构建一个清晰、可信、可持续更新的个人网站。'}
              </p>
            </div>
            <div className="space-y-4 lg:col-span-4">
              <h4 className="text-sm font-bold text-white">Quick Links</h4>
              <div className="flex flex-col gap-2 text-xs">
                <a href="#hero-section" className="transition-colors duration-300 hover:text-purple-400">Home</a>
                <a href="#about" className="transition-colors duration-300 hover:text-purple-400">About</a>
                <a href="#work" className="transition-colors duration-300 hover:text-purple-400">Work</a>
                {config.showAwards && visibleAwards.length > 0 ? <a href="#awards" className="transition-colors duration-300 hover:text-purple-400">Awards</a> : null}
                {config.showSkills && visibleSkills.length > 0 ? <a href="#skills" className="transition-colors duration-300 hover:text-purple-400">Skills</a> : null}
              </div>
            </div>
            <div className="space-y-4 lg:col-span-4">
              <h4 className="text-sm font-bold text-white">Contact</h4>
              <div className="flex flex-col gap-3 text-xs">
                {user.email ? <a href={`mailto:${user.email}`} className="flex items-center gap-2 transition-colors duration-300 hover:text-purple-400"><Mail className="h-4 w-4" style={textColor(primaryColor)} /> {user.email}</a> : null}
                {user.location ? <span className="flex items-center gap-2"><MapPin className="h-4 w-4" style={textColor(primaryColor)} /> {user.location}</span> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {visibleSocials.map((link) => (
                    <a key={link.id || link.url} href={link.url} className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:scale-110 hover:bg-white/10 hover:text-white active:scale-95" aria-label={link.platform}>
                      {iconForSocial(link)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-7xl border-t border-slate-800 pt-8 text-center text-[11px] text-slate-500">
            <p>© 2026 {user.displayName || '个人作品集'}. All rights reserved.</p>
          </div>
        </footer>
      </section>
      </div>

      <section className="hidden">
        <div data-aos="fade-up" className="mx-auto grid max-w-7xl grid-cols-1 gap-10 rounded-3xl p-8 text-white shadow-xl md:p-12 lg:grid-cols-12" style={bgColor(primaryColor)}>
          <div className="space-y-4 lg:col-span-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white/70">联系我</span>
            <h2 className="text-3xl font-black md:text-5xl">期待与你交流新的机会。</h2>
            <p className="max-w-md text-sm leading-7 text-white/75">如果你对我的作品感兴趣，或有项目合作、职位机会、创意想法想进一步沟通，欢迎通过以下方式联系我。</p>
          </div>
          <div className="space-y-4 lg:col-span-6">
            {user.email ? <a className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-bold" href={`mailto:${user.email}`}><Mail className="h-5 w-5" />{user.email}</a> : null}
            {user.location ? <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-bold"><MapPin className="h-5 w-5" />{user.location}</div> : null}
            <div className="flex flex-wrap gap-3">
              {visibleSocials.map((link) => (
                <a key={link.id || link.url} href={link.url} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold" style={textColor(primaryColor)}>
                  {iconForSocial(link)} {link.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="hidden">
        <p>© 2026 {user.displayName || '个人作品集'}. All rights reserved.</p>
      </footer>

      {previewImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="图片预览" onClick={() => setPreviewImage(null)}>
          <div className="relative max-h-full w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-sm font-black text-slate-900 shadow-lg transition hover:bg-white" onClick={() => setPreviewImage(null)}>
              关闭
            </button>
            <img src={previewImage.src} alt={previewImage.alt} className="max-h-[86vh] w-full rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      ) : null}
      {showAllSkills ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setShowAllSkills(false)}>
          <div className="max-h-[86vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider" style={textColor(primaryColor)}>{skillsCopy.label}</p>
                <h3 className="mt-2 text-3xl font-black text-slate-950">全部技能</h3>
              </div>
              <button type="button" className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200" onClick={() => setShowAllSkills(false)}>
                关闭
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {visibleSkills.map((skill) => (
                <div key={skill.id || skill.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h4 className="font-extrabold text-slate-950">{skill.name}</h4>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{skill.proficiency}/5</span>
                  </div>
                  {skill.category ? <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{skill.category}</p> : null}
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full" style={{ ...bgColor(primaryColor), width: `${skill.proficiency * 20}%` }} />
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

