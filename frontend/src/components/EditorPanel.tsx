import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Lock, Plus, RotateCcw, Save, Trash2, Upload } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { defaultConfig, normalizeModuleOrder } from '@siteforge/shared';
import type { Award, Experience, OrderedSectionKey, Project, ProjectImage, SectionCopy, SectionKey, Skill, SocialLink, TemplateId, VideoItem } from '@siteforge/shared';
import { useSiteStore } from '../store/siteStore';
import { publishSite } from '../utils/exportHtml';
import { importReactiveResumeJson, type ResumeImportReport } from '../utils/importResume';
import { defaultPrivacySettings, type PrivacySettings } from '../utils/privacy';
import { ImageUploadField } from './ImageUploadField';
import { PublishSettingsModal } from './PublishSettingsModal';
import { VideoUploadField } from './VideoUploadField';

function nextId(items: Array<{ id?: number }>) {
  return Math.max(0, ...items.map((item) => item.id || 0)) + 1;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}

function projectKey(project: Project, index: number) {
  return project.id !== undefined ? `project-${project.id}` : `project-${project.slug || project.displayOrder}-${index}`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
      <span>{label}</span>
      {children}
    </label>
  );
}

function FormSection({ title, description, defaultOpen = false, action, children }: { title: string; description?: string; defaultOpen?: boolean; action?: ReactNode; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <h2 className="text-sm font-black text-slate-950">{title}</h2>
          {description ? <p className="mt-1 truncate text-xs font-medium text-slate-500">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="space-y-3 border-t border-slate-100 p-3">
        {children}
      </div>
    </details>
  );
}

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-purple-700 focus:ring-4 focus:ring-purple-100';
const rangeInputClass = 'w-full accent-blue-600';

const sectionCopyFields: Array<{ key: SectionKey; name: string; hint: string; needs?: 'experience' | 'skills' | 'videos' | 'awards' }> = [
  { key: 'projects', name: 'Work / Projects', hint: '作品项目模块' },
  { key: 'experience', name: 'Experience', hint: '经历时间线模块', needs: 'experience' },
  { key: 'skills', name: 'Skills', hint: '技能模块', needs: 'skills' },
  { key: 'videos', name: 'Videos', hint: '视频展示模块', needs: 'videos' },
  { key: 'awards', name: 'Awards', hint: '荣誉奖项模块', needs: 'awards' },
  { key: 'contact', name: 'Contact', hint: '联系模块' }
];

const moduleOrderFields: Array<{ key: OrderedSectionKey; name: string; hint: string; needs?: 'experience' | 'skills' | 'videos' | 'awards' }> = [
  { key: 'projects', name: 'Work / Projects', hint: '作品项目展示' },
  { key: 'videos', name: 'Videos', hint: '图片或视频展示', needs: 'videos' },
  { key: 'experience', name: 'Experience', hint: '经历时间线', needs: 'experience' },
  { key: 'awards', name: 'Awards', hint: '荣誉奖项', needs: 'awards' },
  { key: 'skills', name: 'Skills', hint: '技能能力', needs: 'skills' },
  { key: 'contact', name: 'Contact', hint: '联系方式' }
];

function toMonthInputValue(value?: string) {
  if (!value) return '';
  if (/^\d{4}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(0, 7);
  return '';
}

export function EditorPanel() {
  const { data, templateId, setData, setTemplateId, updateUser, updateConfig, upsertProject, removeProject, upsertExperience, removeExperience, upsertSkill, removeSkill, upsertAward, removeAward, upsertSocialLink, removeSocialLink, upsertVideo, removeVideo, reset } = useSiteStore();
  const [publishedUrl, setPublishedUrl] = useState('');
  const [importReport, setImportReport] = useState<ResumeImportReport | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const templateCapabilities = {
    snowly: { primaryColor: true, heroImages: true, layout: true, awards: true, videos: true },
    elena: { primaryColor: false, heroImages: false, layout: true, awards: true, videos: true },
    aura: { primaryColor: false, heroImages: false, layout: true, awards: true, videos: true },
    solace: { primaryColor: false, heroImages: true, layout: true, awards: true, videos: true },
    jakarta: { primaryColor: false, heroImages: true, layout: true, awards: true, videos: true },
    aqua: { primaryColor: false, heroImages: false, layout: true, awards: true, videos: true }
  }[templateId];
  const shouldHidePrimaryColor = !templateCapabilities.primaryColor;

  function getEditableSectionCopy(key: SectionKey): Required<SectionCopy> {
    const defaults = defaultConfig.sectionCopies?.[key] ?? {};
    const current = data.config.sectionCopies?.[key] ?? {};
    return {
      label: current.label ?? defaults.label ?? '',
      title: current.title ?? defaults.title ?? '',
      description: current.description ?? defaults.description ?? ''
    };
  }

  function updateSectionCopy(key: SectionKey, patch: SectionCopy) {
    updateConfig({
      sectionCopies: {
        ...(data.config.sectionCopies ?? {}),
        [key]: {
          ...(data.config.sectionCopies?.[key] ?? {}),
          ...patch
        }
      }
    });
  }

  function isSectionCopyVisible(field: (typeof sectionCopyFields)[number]) {
    if (field.needs === 'experience') return data.config.showExperience;
    if (field.needs === 'skills') return data.config.showSkills;
    if (field.needs === 'videos') return templateCapabilities.videos && data.config.showVideos;
    if (field.needs === 'awards') return templateCapabilities.awards && data.config.showAwards;
    return true;
  }

  function getModuleField(key: OrderedSectionKey) {
    return moduleOrderFields.find((field) => field.key === key) ?? moduleOrderFields[0];
  }

  function isModuleSupported(field: (typeof moduleOrderFields)[number]) {
    if (field.needs === 'videos') return templateCapabilities.videos;
    if (field.needs === 'awards') return templateCapabilities.awards;
    return true;
  }

  function isModuleVisible(field: (typeof moduleOrderFields)[number]) {
    if (!isModuleSupported(field)) return false;
    if (field.needs === 'experience') return data.config.showExperience;
    if (field.needs === 'skills') return data.config.showSkills;
    if (field.needs === 'videos') return data.config.showVideos;
    if (field.needs === 'awards') return data.config.showAwards;
    return true;
  }

  function moveModule(sectionKey: OrderedSectionKey, direction: -1 | 1) {
    const moduleOrder = normalizeModuleOrder(data.config.moduleOrder);
    const fromIndex = moduleOrder.indexOf(sectionKey);
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || toIndex < 0 || toIndex >= moduleOrder.length) return;
    const nextOrder = [...moduleOrder];
    [nextOrder[fromIndex], nextOrder[toIndex]] = [nextOrder[toIndex], nextOrder[fromIndex]];
    updateConfig({ moduleOrder: nextOrder });
  }

  async function saveToServer() {
    const response = await fetch('/api/site/local', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('保存失败，请确认后端服务正在运行。');
    }
  }

  async function importResumeFile(file?: File) {
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      const result = importReactiveResumeJson(json, data);
      setData(result.data);
      setImportReport(result.report);
    } catch (error) {
      alert(error instanceof Error ? error.message : '导入失败，请确认文件是有效的 JSON。');
    } finally {
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  }

  async function publishCurrentSite(publicData = data) {
    setIsPublishing(true);
    try {
      const result = await publishSite(publicData, templateId);
      setPublishedUrl(result.url);
      setIsPublishModalOpen(false);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(result.url).catch(() => undefined);
      }
    } finally {
      setIsPublishing(false);
    }
  }

  function addProject() {
    const id = nextId(data.projects);
    const project: Project = {
      id,
      title: '',
      slug: `project-${id}`,
      category: '',
      coverImage: '',
      description: '',
      content: '',
      role: '',
      tools: '',
      displayOrder: data.projects.length,
      isFeatured: false,
      viewCount: 0,
      status: 'published'
    };
    upsertProject(project);
  }

  function addProjectImage(project: Project) {
    const images = project.images ?? [];
    const id = nextId(images);
    const image: ProjectImage = {
      id,
      imageUrl: '',
      caption: '',
      displayOrder: images.length,
      isCover: false
    };
    upsertProject({ ...project, images: [...images, image] });
  }

  function updateProjectImage(project: Project, image: ProjectImage) {
    upsertProject({
      ...project,
      images: (project.images ?? []).map((item) => (item.id === image.id ? image : item))
    });
  }

  function removeProjectImage(project: Project, imageId?: number) {
    upsertProject({
      ...project,
      images: (project.images ?? []).filter((image) => image.id !== imageId)
    });
  }

  function addHeroImage() {
    updateConfig({ heroImages: [...(data.config.heroImages ?? []), ''] });
  }

  function updateHeroImage(index: number, imageUrl: string) {
    updateConfig({
      heroImages: (data.config.heroImages ?? []).map((item, itemIndex) => (itemIndex === index ? imageUrl : item))
    });
  }

  function removeHeroImage(index: number) {
    updateConfig({
      heroImages: (data.config.heroImages ?? []).filter((_, itemIndex) => itemIndex !== index)
    });
  }

  function addExperience() {
    const id = nextId(data.experiences);
    const experience: Experience = {
      id,
      type: 'work',
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      displayOrder: data.experiences.length
    };
    upsertExperience(experience);
  }

  function addSkill() {
    const id = nextId(data.skills);
    const skill: Skill = {
      id,
      name: '',
      category: '',
      proficiency: 4,
      displayOrder: data.skills.length
    };
    upsertSkill(skill);
  }

  function addAward() {
    const id = nextId(data.awards);
    const award: Award = {
      id,
      title: '',
      issuer: '',
      date: '',
      description: '',
      displayOrder: data.awards.length
    };
    upsertAward(award);
  }

  function addSocial() {
    const id = nextId(data.socialLinks);
    const social: SocialLink = {
      id,
      platform: '',
      url: '',
      icon: '',
      displayOrder: data.socialLinks.length
    };
    upsertSocialLink(social);
  }

  function addVideo() {
    const id = nextId(data.videos);
    const video: VideoItem = {
      id,
      title: '',
      platform: 'custom',
      videoUrl: '',
      thumbnailUrl: '',
      description: '',
      displayOrder: data.videos.length,
      isFeatured: false
    };
    upsertVideo(video);
  }

  function clearCurrentData() {
    setData({
      ...data,
      user: {
        ...data.user,
        email: '',
        username: '',
        displayName: '',
        avatarUrl: '',
        title: '',
        bio: '',
        fullBio: '',
        location: ''
      },
      projects: [],
      experiences: [],
      skills: [],
      awards: [],
      socialLinks: [],
      videos: [],
      config: {
        ...data.config,
        heroImages: [],
        showExperience: false,
        showSkills: false,
        showVideos: false,
        showAwards: false
      }
    });
    setImportReport(null);
    setPublishedUrl('');
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-white">
      {shouldHidePrimaryColor ? <style>{'.sf-scrollbar label:has(input[type="color"]) { display: none; }'}</style> : null}
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-950">SiteForge</h1>
            <p className="mt-1 text-xs font-medium text-slate-500">Snowly 模板工作台</p>
          </div>
          <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50" onClick={reset} title="重置默认数据">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800" onClick={() => saveToServer().catch((error) => alert(error.message))}>
            <Save className="h-4 w-4" /> 保存
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-extrabold text-white transition hover:opacity-90" style={{ backgroundColor: templateCapabilities.primaryColor ? data.config.primaryColor : '#0f172a' }} onClick={() => setIsPublishModalOpen(true)}>
            <ExternalLink className="h-4 w-4" /> 发布
          </button>
        </div>
        <input ref={resumeInputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => importResumeFile(event.target.files?.[0])} />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" onClick={() => resumeInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> 导入简历 JSON
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs font-extrabold text-red-600 transition hover:bg-red-50" onClick={clearCurrentData}>
            <Trash2 className="h-4 w-4" /> 一键清空
          </button>
        </div>
        {importReport ? (
          <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
            <p className="font-black">导入完成</p>
            {importReport.filled.length ? <p className="mt-1">已填充：{importReport.filled.join('、')}</p> : null}
            {importReport.missing.length ? <p className="mt-1">待补充：{importReport.missing.join('、')}</p> : null}
            {importReport.skipped.length ? <p className="mt-1 text-amber-700">未导入：{importReport.skipped.join('；')}</p> : null}
          </div>
        ) : null}
        {publishedUrl ? (
          <a className="mt-3 block truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-white" href={publishedUrl} target="_blank" rel="noreferrer" title={publishedUrl}>
            {publishedUrl}
          </a>
        ) : null}
      </div>

      <div className="sf-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
        <FormSection title="个人信息" description="头像、名称、简介和位置" defaultOpen>
          <Field label="显示名称"><input className={inputClass} placeholder="例如：李明 / Alex Chen" value={data.user.displayName} onChange={(event) => updateUser({ displayName: event.target.value })} /></Field>
          <Field label="用户名"><input className={inputClass} placeholder="例如：alexchen" value={data.user.username} onChange={(event) => updateUser({ username: event.target.value })} /></Field>
          <Field label="邮箱"><input className={inputClass} type="email" placeholder="例如：hello@example.com" value={data.user.email} onChange={(event) => updateUser({ email: event.target.value })} /></Field>
          <ImageUploadField label="头像" value={data.user.avatarUrl || ''} placeholder="例如：https://example.com/avatar.jpg，或选择本地头像" onChange={(avatarUrl) => updateUser({ avatarUrl })} />
          <Field label="头衔"><input className={inputClass} placeholder="例如：产品设计师 / 前端开发者" value={data.user.title || ''} onChange={(event) => updateUser({ title: event.target.value })} /></Field>
          <Field label="一句话简介"><textarea className={inputClass} rows={3} placeholder="例如：用设计和技术构建清晰、好用的数字体验" value={data.user.bio || ''} onChange={(event) => updateUser({ bio: event.target.value })} /></Field>
          <Field label="详细介绍"><textarea className={inputClass} rows={4} placeholder="例如：介绍你的背景、专长、工作方式和代表成果" value={data.user.fullBio || ''} onChange={(event) => updateUser({ fullBio: event.target.value })} /></Field>
          <Field label="位置"><input className={inputClass} placeholder="例如：中国 · 杭州" value={data.user.location || ''} onChange={(event) => updateUser({ location: event.target.value })} /></Field>
        </FormSection>

        <FormSection title="网站配置" description="模板、主题和模块开关">
          <Field label="模板">
            <select className={inputClass} value={templateId} onChange={(event) => setTemplateId(event.target.value as TemplateId)}>
              <option value="snowly">Snowly / 亮色紫色作品集</option>
              <option value="elena">Elena / 暗色荧光交互作品集</option>
              <option value="aura">Aura / 赛博终端 WebGL 风格</option>
              <option value="solace">Solace / 深绿玻璃高级作品集</option>
              <option value="jakarta">Jakarta / 亮色 SaaS 产品作品集</option>
              <option value="aqua">Aqua / 紫粉玻璃互动作品集</option>
            </select>
          </Field>
          <Field label="主色"><input className={`${inputClass} h-12`} type="color" value={data.config.primaryColor} onChange={(event) => updateConfig({ primaryColor: event.target.value })} /></Field>
          <Field label="布局">
            <select className={inputClass} value={data.config.layout} onChange={(event) => updateConfig({ layout: event.target.value as typeof data.config.layout })}>
              <option value="grid">Grid</option>
              <option value="list">List</option>
              <option value="masonry">Masonry（首版按 Grid 展示）</option>
            </select>
          </Field>
          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-bold text-slate-700">显示经历 <input type="checkbox" checked={data.config.showExperience} onChange={(event) => updateConfig({ showExperience: event.target.checked })} /></label>
          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-bold text-slate-700">显示技能 <input type="checkbox" checked={data.config.showSkills} onChange={(event) => updateConfig({ showSkills: event.target.checked })} /></label>
          {templateCapabilities.videos ? <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-bold text-slate-700">显示视频 <input type="checkbox" checked={data.config.showVideos} onChange={(event) => updateConfig({ showVideos: event.target.checked })} /></label> : null}
          {templateCapabilities.awards ? <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-bold text-slate-700">显示荣誉奖项 <input type="checkbox" checked={data.config.showAwards} onChange={(event) => updateConfig({ showAwards: event.target.checked })} /></label> : null}
        </FormSection>

        <FormSection title="模块展示顺序" description="首页固定第一，其余模块可上移或下移">
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900">Home / About</p>
                <p className="text-xs font-medium text-slate-500">固定首屏，不参与排序</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500"><Lock className="h-3 w-3" /> 固定</span>
            </div>
            {normalizeModuleOrder(data.config.moduleOrder).map((sectionKey, index, order) => {
              const field = getModuleField(sectionKey);
              const supported = isModuleSupported(field);
              const visible = isModuleVisible(field);
              return (
                <div key={sectionKey} className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${visible ? 'border-slate-200 bg-white' : 'border-slate-200 bg-white/55'}`}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">{field.name}</p>
                    <p className="truncate text-xs font-medium text-slate-500">{field.hint}</p>
                    <p className={`mt-1 text-[11px] font-black ${visible ? 'text-emerald-600' : 'text-slate-400'}`}>{supported ? (visible ? '当前展示' : '当前隐藏') : '当前模板不支持'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35" disabled={index === 0} onClick={() => moveModule(sectionKey, -1)} aria-label={`Move ${field.name} up`}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35" disabled={index === order.length - 1} onClick={() => moveModule(sectionKey, 1)} aria-label={`Move ${field.name} down`}>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </FormSection>

        <FormSection title="模块标题文案" description="编辑各模块标签、主标题和副标题">
          {sectionCopyFields.filter((field) => field.key !== 'about').filter(isSectionCopyVisible).map((field) => {
            const copy = getEditableSectionCopy(field.key);
            return (
              <div key={field.key} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-700">{field.name}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">{field.hint}</p>
                </div>
                <Field label="标签">
                  <input className={inputClass} placeholder="例如：Selected Work" value={copy.label} onChange={(event) => updateSectionCopy(field.key, { label: event.target.value })} />
                </Field>
                <Field label="主标题">
                  <input className={inputClass} placeholder="例如：Recent projects with practical depth." value={copy.title} onChange={(event) => updateSectionCopy(field.key, { title: event.target.value })} />
                </Field>
                <Field label="副标题 / 描述">
                  <textarea className={inputClass} rows={2} placeholder="例如：用一句话说明这个模块展示的内容。" value={copy.description} onChange={(event) => updateSectionCopy(field.key, { description: event.target.value })} />
                </Field>
              </div>
            );
          })}
        </FormSection>

        {templateCapabilities.heroImages ? <FormSection
          title="Hero 背景图"
          description={`${(data.config.heroImages ?? []).length} 张图片，可自动轮播`}
          action={<button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" onClick={(event) => { event.preventDefault(); addHeroImage(); }} aria-label="添加 Hero 背景图"><Plus className="h-4 w-4" /></button>}
        >
          {(data.config.heroImages ?? []).map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                <ImageUploadField label={`Hero 图片 ${index + 1}`} value={imageUrl} placeholder="例如：https://example.com/hero.jpg，或选择本地背景图" onChange={(nextImageUrl) => updateHeroImage(index, nextImageUrl)} />
                <button className="mt-7 rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => removeHeroImage(index)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </FormSection> : null}

        <FormSection
          title="作品"
          description={`${data.projects.length} 个作品项目`}
          action={<button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" onClick={(event) => { event.preventDefault(); addProject(); }} aria-label="添加作品"><Plus className="h-4 w-4" /></button>}
        >
          {data.projects.map((project, index) => (
            <div key={projectKey(project, index)} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex justify-between gap-2">
                <input className={inputClass} placeholder="例如：品牌官网改版" value={project.title} onChange={(event) => upsertProject({ ...project, title: event.target.value, slug: slugify(event.target.value) })} />
                <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => project.id && removeProject(project.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
              <input className={inputClass} placeholder="例如：Web Design / Portfolio" value={project.category} onChange={(event) => upsertProject({ ...project, category: event.target.value })} />
              <ImageUploadField label="封面图" value={project.coverImage} placeholder="例如：https://example.com/project-cover.jpg，或选择本地封面图" onChange={(coverImage) => upsertProject({ ...project, coverImage })} />
              <input className={inputClass} placeholder="例如：产品设计 / 前端开发" value={project.role || ''} onChange={(event) => upsertProject({ ...project, role: event.target.value })} />
              <input className={inputClass} placeholder="例如：Figma, React, Tailwind" value={project.tools || ''} onChange={(event) => upsertProject({ ...project, tools: event.target.value })} />
              <textarea className={inputClass} rows={2} placeholder="例如：一句话说明项目目标和成果" value={project.description} onChange={(event) => upsertProject({ ...project, description: event.target.value })} />
              <input className={inputClass} placeholder="例如：https://your-project.com" value={project.projectUrl || ''} onChange={(event) => upsertProject({ ...project, projectUrl: event.target.value })} />
              <input className={inputClass} placeholder="例如：https://github.com/yourname/project" value={project.githubUrl || ''} onChange={(event) => upsertProject({ ...project, githubUrl: event.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} type="month" value={toMonthInputValue(project.startDate)} onChange={(event) => upsertProject({ ...project, startDate: event.target.value })} />
                <input className={inputClass} type="month" value={toMonthInputValue(project.endDate)} onChange={(event) => upsertProject({ ...project, endDate: event.target.value })} />
              </div>
              <textarea className={inputClass} rows={3} placeholder="支持多行：背景、过程、成果..." value={project.content} onChange={(event) => upsertProject({ ...project, content: event.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <select className={inputClass} value={project.status} onChange={(event) => upsertProject({ ...project, status: event.target.value as Project['status'] })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600">精选 <input type="checkbox" checked={project.isFeatured} onChange={(event) => upsertProject({ ...project, isFeatured: event.target.checked })} /></label>
              </div>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">项目图库</p>
                  <button className="rounded-md bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200" onClick={() => addProjectImage(project)}><Plus className="h-3.5 w-3.5" /></button>
                </div>
                {(project.images ?? []).map((image) => (
                  <div key={image.id || image.imageUrl} className="grid gap-2 rounded-md bg-slate-50 p-2">
                    <div className="flex gap-2">
                      <ImageUploadField label="图库图片" value={image.imageUrl} placeholder="例如：https://example.com/gallery-1.jpg，或选择本地图片" onChange={(imageUrl) => updateProjectImage(project, { ...image, imageUrl })} />
                      <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => removeProjectImage(project, image.id)}><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <input className={inputClass} placeholder="例如：首页视觉方案" value={image.caption || ''} onChange={(event) => updateProjectImage(project, { ...image, caption: event.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </FormSection>

        {templateCapabilities.awards ? <FormSection
          title="荣誉奖项"
          description={`${data.awards.length} 条奖项记录`}
          action={<button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" onClick={(event) => { event.preventDefault(); addAward(); }} aria-label="添加荣誉奖项"><Plus className="h-4 w-4" /></button>}
        >
          {data.awards.map((award) => (
            <div key={award.id || award.title} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex justify-between gap-2">
                <input className={inputClass} placeholder="例如：Awwwards Honorable Mention" value={award.title} onChange={(event) => upsertAward({ ...award, title: event.target.value })} />
                <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => award.id && removeAward(award.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
              <input className={inputClass} placeholder="例如：Awwwards / 红点设计奖" value={award.issuer} onChange={(event) => upsertAward({ ...award, issuer: event.target.value })} />
              <input className={inputClass} type="month" value={toMonthInputValue(award.date)} onChange={(event) => upsertAward({ ...award, date: event.target.value })} />
              <textarea className={inputClass} rows={2} placeholder="例如：说明获奖原因或认可内容" value={award.description || ''} onChange={(event) => upsertAward({ ...award, description: event.target.value })} />
            </div>
          ))}
        </FormSection> : null}

        {templateCapabilities.videos ? <FormSection
          title="视频"
          description={`${data.videos.length} 个视频条目`}
          action={<button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" onClick={(event) => { event.preventDefault(); addVideo(); }} aria-label="添加视频"><Plus className="h-4 w-4" /></button>}
        >
          {data.videos.map((video) => (
            <div key={video.id || video.videoUrl} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex justify-between gap-2">
                <input className={inputClass} placeholder="例如：作品集讲解视频" value={video.title} onChange={(event) => upsertVideo({ ...video, title: event.target.value })} />
                <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => video.id && removeVideo(video.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
              <select className={inputClass} value={video.platform} onChange={(event) => upsertVideo({ ...video, platform: event.target.value as VideoItem['platform'] })}>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="bilibili">Bilibili</option>
                <option value="custom">Custom</option>
              </select>
              <VideoUploadField label="视频文件 / 视频 URL" value={video.videoUrl} placeholder="例如：https://example.com/demo.mp4，或选择本地视频" onChange={(videoUrl) => upsertVideo({ ...video, videoUrl })} />
              <ImageUploadField label="视频封面" value={video.thumbnailUrl || ''} actionLabel="选择封面" placeholder="例如：https://example.com/video-cover.jpg，或选择本地封面图" onChange={(thumbnailUrl) => upsertVideo({ ...video, thumbnailUrl })} />
              <textarea className={inputClass} rows={2} placeholder="例如：介绍视频内容、亮点或演示流程" value={video.description || ''} onChange={(event) => upsertVideo({ ...video, description: event.target.value })} />
              <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600">精选视频 <input type="checkbox" checked={video.isFeatured} onChange={(event) => upsertVideo({ ...video, isFeatured: event.target.checked })} /></label>
            </div>
          ))}
        </FormSection> : null}

        <FormSection
          title="经历"
          description={`${data.experiences.length} 条经历`}
          action={<button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" onClick={(event) => { event.preventDefault(); addExperience(); }} aria-label="添加经历"><Plus className="h-4 w-4" /></button>}
        >
          {data.experiences.map((experience) => (
            <div key={experience.id || experience.company} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex justify-between gap-2">
                <input className={inputClass} placeholder="例如：高级前端工程师 / 视觉设计师" value={experience.position} onChange={(event) => upsertExperience({ ...experience, position: event.target.value })} />
                <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => experience.id && removeExperience(experience.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
              <input className={inputClass} placeholder="例如：某某科技 / 某某大学" value={experience.company} onChange={(event) => upsertExperience({ ...experience, company: event.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <select className={inputClass} value={experience.type} onChange={(event) => upsertExperience({ ...experience, type: event.target.value as Experience['type'] })}>
                  <option value="work">工作经历</option>
                  <option value="education">教育经历</option>
                </select>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600">至今 <input type="checkbox" checked={experience.isCurrent} onChange={(event) => upsertExperience({ ...experience, isCurrent: event.target.checked, endDate: event.target.checked ? '' : experience.endDate })} /></label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} type="month" value={toMonthInputValue(experience.startDate)} onChange={(event) => upsertExperience({ ...experience, startDate: event.target.value })} />
                <input className={inputClass} type="month" value={toMonthInputValue(experience.endDate)} disabled={experience.isCurrent} onChange={(event) => upsertExperience({ ...experience, endDate: event.target.value })} />
              </div>
              <textarea className={inputClass} rows={4} placeholder="支持多行：职责、成果、项目经验..." value={experience.description || ''} onChange={(event) => upsertExperience({ ...experience, description: event.target.value })} />
            </div>
          ))}
        </FormSection>

        <FormSection
          title="技能"
          description={`${data.skills.length} 项技能`}
          action={<button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" onClick={(event) => { event.preventDefault(); addSkill(); }} aria-label="添加技能"><Plus className="h-4 w-4" /></button>}
        >
          {data.skills.map((skill) => (
            <div key={skill.id || skill.name} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex justify-between gap-2">
                <input className={inputClass} placeholder="例如：React / Figma / 品牌设计" value={skill.name} onChange={(event) => upsertSkill({ ...skill, name: event.target.value })} />
                <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => skill.id && removeSkill(skill.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
              <input className={inputClass} placeholder="例如：Frontend / Design / Interaction" value={skill.category || ''} onChange={(event) => upsertSkill({ ...skill, category: event.target.value })} />
              <Field label="熟练度">
                <input className={rangeInputClass} type="range" min={1} max={5} value={skill.proficiency} onChange={(event) => upsertSkill({ ...skill, proficiency: Number(event.target.value) as Skill['proficiency'] })} />
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
                <span>当前等级</span>
                <span>{skill.proficiency}/5</span>
              </div>
            </div>
          ))}
        </FormSection>

        <FormSection
          title="社交链接"
          description={`${data.socialLinks.length} 个链接`}
          action={<button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" onClick={(event) => { event.preventDefault(); addSocial(); }} aria-label="添加社交链接"><Plus className="h-4 w-4" /></button>}
        >
          {data.socialLinks.map((social) => (
            <div key={social.id || social.url} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex justify-between gap-2">
                <input className={inputClass} placeholder="例如：GitHub / LinkedIn / 小红书" value={social.platform} onChange={(event) => upsertSocialLink({ ...social, platform: event.target.value })} />
                <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => social.id && removeSocialLink(social.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
              <input className={inputClass} placeholder="例如：https://github.com/yourname" value={social.url} onChange={(event) => upsertSocialLink({ ...social, url: event.target.value })} />
            </div>
          ))}
        </FormSection>
      </div>
      {isPublishModalOpen ? (
        <PublishSettingsModal
          data={data}
          templateId={templateId}
          settings={privacySettings}
          isPublishing={isPublishing}
          onClose={() => setIsPublishModalOpen(false)}
          onChange={setPrivacySettings}
          onPublish={(publicData) => publishCurrentSite(publicData).catch((error) => alert(error.message))}
        />
      ) : null}
    </aside>
  );
}
