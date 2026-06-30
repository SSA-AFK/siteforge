import { create } from 'zustand';
import { defaultSiteData, type Award, type BlogPost, type Experience, type Project, type SiteConfig, type SiteData, type Skill, type SocialLink, type TemplateId, type User, type VideoItem } from '@siteforge/shared';

const STORAGE_KEY = 'siteforge:data:v1';
const TEMPLATE_STORAGE_KEY = 'siteforge:template:v1';

interface SiteStore {
  data: SiteData;
  templateId: TemplateId;
  setData: (data: SiteData) => void;
  setTemplateId: (templateId: TemplateId) => void;
  updateUser: (patch: Partial<User>) => void;
  updateConfig: (patch: Partial<SiteConfig>) => void;
  upsertProject: (project: Project) => void;
  removeProject: (id: number) => void;
  upsertExperience: (experience: Experience) => void;
  removeExperience: (id: number) => void;
  upsertSkill: (skill: Skill) => void;
  removeSkill: (id: number) => void;
  upsertAward: (award: Award) => void;
  removeAward: (id: number) => void;
  upsertSocialLink: (social: SocialLink) => void;
  removeSocialLink: (id: number) => void;
  upsertVideo: (video: VideoItem) => void;
  removeVideo: (id: number) => void;
  upsertBlogPost: (post: BlogPost) => void;
  reset: () => void;
}

function normalizeSiteData(data: Partial<SiteData>): SiteData {
  return {
    ...defaultSiteData,
    ...data,
    user: { ...defaultSiteData.user, ...data.user },
    config: { ...defaultSiteData.config, ...data.config },
    projects: data.projects ?? defaultSiteData.projects,
    experiences: data.experiences ?? defaultSiteData.experiences,
    skills: data.skills ?? defaultSiteData.skills,
    awards: data.awards ?? defaultSiteData.awards,
    socialLinks: data.socialLinks ?? defaultSiteData.socialLinks,
    blogPosts: data.blogPosts ?? defaultSiteData.blogPosts,
    videos: data.videos ?? defaultSiteData.videos
  };
}

function loadInitialData(): SiteData {
  if (typeof window === 'undefined') return defaultSiteData;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeSiteData(JSON.parse(raw) as Partial<SiteData>) : defaultSiteData;
  } catch {
    return defaultSiteData;
  }
}

function loadInitialTemplateId(): TemplateId {
  if (typeof window === 'undefined') return 'snowly';
  const templateId = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
  return templateId === 'aura' || templateId === 'elena' || templateId === 'snowly' ? templateId : 'snowly';
}

function persist(data: SiteData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function byOrder<T extends { displayOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function sameProject(left: Project, right: Project) {
  if (left.id !== undefined && right.id !== undefined) return left.id === right.id;
  if (left.slug && right.slug) return left.slug === right.slug;
  return left.displayOrder === right.displayOrder;
}

export const useSiteStore = create<SiteStore>((set, get) => ({
  data: loadInitialData(),
  templateId: loadInitialTemplateId(),
  setTemplateId: (templateId) => {
    window.localStorage.setItem(TEMPLATE_STORAGE_KEY, templateId);
    set({ templateId });
  },
  setData: (data) => {
    persist(data);
    set({ data });
  },
  updateUser: (patch) => {
    const data = { ...get().data, user: { ...get().data.user, ...patch } };
    persist(data);
    set({ data });
  },
  updateConfig: (patch) => {
    const data = { ...get().data, config: { ...get().data.config, ...patch } };
    persist(data);
    set({ data });
  },
  upsertProject: (project) => {
    const current = get().data;
    const projects = byOrder(current.projects.some((item) => sameProject(item, project)) ? current.projects.map((item) => (sameProject(item, project) ? project : item)) : [...current.projects, project]);
    const data = { ...current, projects };
    persist(data);
    set({ data });
  },
  removeProject: (id) => {
    const current = get().data;
    const data = { ...current, projects: current.projects.filter((project) => project.id !== id) };
    persist(data);
    set({ data });
  },
  upsertExperience: (experience) => {
    const current = get().data;
    const experiences = byOrder(current.experiences.some((item) => item.id === experience.id) ? current.experiences.map((item) => (item.id === experience.id ? experience : item)) : [...current.experiences, experience]);
    const data = { ...current, experiences };
    persist(data);
    set({ data });
  },
  removeExperience: (id) => {
    const current = get().data;
    const data = { ...current, experiences: current.experiences.filter((experience) => experience.id !== id) };
    persist(data);
    set({ data });
  },
  upsertSkill: (skill) => {
    const current = get().data;
    const skills = byOrder(current.skills.some((item) => item.id === skill.id) ? current.skills.map((item) => (item.id === skill.id ? skill : item)) : [...current.skills, skill]);
    const data = { ...current, skills };
    persist(data);
    set({ data });
  },
  removeSkill: (id) => {
    const current = get().data;
    const data = { ...current, skills: current.skills.filter((skill) => skill.id !== id) };
    persist(data);
    set({ data });
  },
  upsertAward: (award) => {
    const current = get().data;
    const awards = byOrder(current.awards.some((item) => item.id === award.id) ? current.awards.map((item) => (item.id === award.id ? award : item)) : [...current.awards, award]);
    const data = { ...current, awards };
    persist(data);
    set({ data });
  },
  removeAward: (id) => {
    const current = get().data;
    const data = { ...current, awards: current.awards.filter((award) => award.id !== id) };
    persist(data);
    set({ data });
  },
  upsertSocialLink: (social) => {
    const current = get().data;
    const socialLinks = byOrder(current.socialLinks.some((item) => item.id === social.id) ? current.socialLinks.map((item) => (item.id === social.id ? social : item)) : [...current.socialLinks, social]);
    const data = { ...current, socialLinks };
    persist(data);
    set({ data });
  },
  removeSocialLink: (id) => {
    const current = get().data;
    const data = { ...current, socialLinks: current.socialLinks.filter((social) => social.id !== id) };
    persist(data);
    set({ data });
  },
  upsertVideo: (video) => {
    const current = get().data;
    const videos = byOrder(current.videos.some((item) => item.id === video.id) ? current.videos.map((item) => (item.id === video.id ? video : item)) : [...current.videos, video]);
    const data = { ...current, videos };
    persist(data);
    set({ data });
  },
  removeVideo: (id) => {
    const current = get().data;
    const data = { ...current, videos: current.videos.filter((video) => video.id !== id) };
    persist(data);
    set({ data });
  },
  upsertBlogPost: (post) => {
    const current = get().data;
    const blogPosts = current.blogPosts.some((item) => item.id === post.id) ? current.blogPosts.map((item) => (item.id === post.id ? post : item)) : [...current.blogPosts, post];
    const data = { ...current, blogPosts };
    persist(data);
    set({ data });
  },
  reset: () => {
    persist(defaultSiteData);
    set({ data: defaultSiteData });
  }
}));
