export type Theme = 'light' | 'dark' | 'minimal';
export type Layout = 'grid' | 'list' | 'masonry';
export type ExperienceType = 'work' | 'education';
export type ProjectStatus = 'draft' | 'published' | 'archived';
export type VideoPlatform = 'youtube' | 'vimeo' | 'bilibili' | 'custom';
export type TemplateId = 'snowly' | 'elena' | 'aura' | 'solace' | 'jakarta' | 'aqua';
export type SectionKey = 'about' | 'projects' | 'experience' | 'skills' | 'skillTools' | 'videos' | 'awards' | 'contact';
export type OrderedSectionKey = Exclude<SectionKey, 'about' | 'skillTools'>;

export interface SectionCopy {
  label?: string;
  title?: string;
  description?: string;
}

export type SectionCopies = Partial<Record<SectionKey, SectionCopy>>;

export interface User {
  id?: number;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  fullBio?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectImage {
  id?: number;
  projectId?: number;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  isCover: boolean;
}

export interface Project {
  id?: number;
  userId?: number;
  title: string;
  slug: string;
  category: string;
  coverImage: string;
  description: string;
  content: string;
  role?: string;
  tools?: string;
  projectUrl?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  displayOrder: number;
  isFeatured: boolean;
  viewCount: number;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  images?: ProjectImage[];
}

export interface Experience {
  id?: number;
  userId?: number;
  type: ExperienceType;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  displayOrder: number;
}

export interface Skill {
  id?: number;
  userId?: number;
  name: string;
  category?: string;
  proficiency: 1 | 2 | 3 | 4 | 5;
  displayOrder: number;
}

export interface Award {
  id?: number;
  userId?: number;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
  displayOrder: number;
}

export interface SocialLink {
  id?: number;
  userId?: number;
  platform: string;
  url: string;
  icon?: string;
  displayOrder: number;
}

export interface VideoItem {
  id?: number;
  userId?: number;
  title: string;
  platform: VideoPlatform;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  displayOrder: number;
  isFeatured: boolean;
}

export interface SiteConfig {
  userId?: number;
  theme: Theme;
  primaryColor: string;
  layout: Layout;
  heroImages: string[];
  showExperience: boolean;
  showSkills: boolean;
  showVideos: boolean;
  showAwards: boolean;
  moduleOrder: OrderedSectionKey[];
  sectionCopies?: SectionCopies;
  customCss?: string;
  seoTitle?: string;
  seoDescription?: string;
  domain?: string;
  updatedAt?: string;
}

export interface SiteData {
  user: User;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  awards: Award[];
  socialLinks: SocialLink[];
  videos: VideoItem[];
  config: SiteConfig;
}

export type AIAction =
  | { action: 'updateUser'; field: keyof User; value: unknown }
  | { action: 'addProject'; project: Partial<Project> }
  | { action: 'updateProject'; id: number; fields: Partial<Project> }
  | { action: 'deleteProject'; id: number }
  | { action: 'addExperience'; experience: Partial<Experience> }
  | { action: 'updateExperience'; id: number; fields: Partial<Experience> }
  | { action: 'deleteExperience'; id: number }
  | { action: 'addSkill'; skill: Partial<Skill> }
  | { action: 'updateSkill'; id: number; fields: Partial<Skill> }
  | { action: 'deleteSkill'; id: number }
  | { action: 'addAward'; award: Partial<Award> }
  | { action: 'updateAward'; id: number; fields: Partial<Award> }
  | { action: 'deleteAward'; id: number }
  | { action: 'addSocialLink'; social: Partial<SocialLink> }
  | { action: 'updateSocialLink'; id: number; fields: Partial<SocialLink> }
  | { action: 'deleteSocialLink'; id: number }
  | { action: 'addVideo'; video: Partial<VideoItem> }
  | { action: 'updateVideo'; id: number; fields: Partial<VideoItem> }
  | { action: 'deleteVideo'; id: number }
  | { action: 'updateConfig'; fields: Partial<SiteConfig> };

export function getSectionCopy(data: SiteData, key: SectionKey, fallback: SectionCopy): Required<SectionCopy> {
  const copy = data.config.sectionCopies?.[key];
  return {
    label: copy?.label?.trim() || fallback.label?.trim() || '',
    title: copy?.title?.trim() || fallback.title?.trim() || '',
    description: copy?.description?.trim() || fallback.description?.trim() || ''
  };
}

export function getAboutSectionCopy(data: SiteData, fallback: SectionCopy): Required<SectionCopy> {
  const copy = data.config.sectionCopies?.about;
  return {
    label: copy?.label?.trim() || fallback.label?.trim() || '',
    title: data.user.bio?.trim() || fallback.title?.trim() || '',
    description: data.user.fullBio?.trim() || fallback.description?.trim() || ''
  };
}

export const defaultModuleOrder: OrderedSectionKey[] = ['projects', 'videos', 'experience', 'awards', 'skills', 'contact'];

export function normalizeModuleOrder(moduleOrder?: SectionKey[]): OrderedSectionKey[] {
  const validSections = new Set<OrderedSectionKey>(defaultModuleOrder);
  const ordered = (moduleOrder ?? [])
    .filter((key): key is OrderedSectionKey => validSections.has(key as OrderedSectionKey));
  return [...new Set([...ordered, ...defaultModuleOrder])];
}

export function getOrderedSections(data: SiteData): OrderedSectionKey[] {
  return normalizeModuleOrder(data.config.moduleOrder);
}

export interface AIChatRequest {
  message: string;
  currentData: SiteData;
}

export interface AIChatResponse {
  reply: string;
  actions: AIAction[];
}

export const defaultUser: User = {
  email: '',
  username: 'creator',
  displayName: '你的名字',
  avatarUrl: 'https://i.pravatar.cc/300?img=11',
  title: '设计师 / 开发者',
  bio: '用创意和技术构建美好数字体验',
  fullBio: '我是一名热爱设计和开发的全栈创作者，致力于打造优雅、实用的数字产品。',
  location: '中国 · 杭州'
};

export const defaultConfig: SiteConfig = {
  theme: 'light',
  primaryColor: '#3b0764',
  layout: 'grid',
  heroImages: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1920&q=80'
  ],
  showExperience: true,
  showSkills: true,
  showVideos: true,
  showAwards: true,
  moduleOrder: defaultModuleOrder,
  sectionCopies: {
    about: {
      label: 'About',
      title: '',
      description: ''
    },
    projects: {
      label: 'Selected Work',
      title: 'Recent projects with practical depth.',
      description: 'Project images, galleries, roles, tools, and outcomes are driven by the form.'
    },
    experience: {
      label: 'Experience',
      title: 'Experience built around real outcomes.',
      description: 'Use the timeline to show roles, education, responsibilities, and results.'
    },
    skills: {
      label: 'Skills',
      title: 'Tools and strengths.',
      description: 'Show the tools, methods, and capabilities you use most often.'
    },
    skillTools: {
      label: 'Selected Tools',
      title: 'Industry tools I master.',
      description: 'A compact view of your most important skills.'
    },
    videos: {
      label: 'Video',
      title: 'Stories, demos, and walkthroughs.',
      description: 'Feature videos only when you add them in the form.'
    },
    awards: {
      label: 'Awards',
      title: 'Honors and professional recognition.',
      description: 'Add awards, certificates, or public recognition that support your portfolio.'
    },
    contact: {
      label: 'Contact',
      title: 'Ready to start a new conversation?',
      description: 'Portfolio reviews, project collaboration, role opportunities, and creative conversations can all start here.'
    }
  },
  seoTitle: '',
  seoDescription: ''
};

export const defaultSiteData: SiteData = {
  user: defaultUser,
  projects: [
    {
      id: 1,
      title: 'Vortex Quantum Dashboard',
      slug: 'vortex-quantum-dashboard',
      category: 'Creative Engineering',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      description: '一套面向实时数据可视化的沉浸式仪表盘体验。',
      content: 'Web3D telemetry platform with polished motion, dashboard primitives, and responsive layouts.',
      role: 'Product Designer / Frontend',
      tools: 'React, Three.js, Figma',
      projectUrl: '#',
      githubUrl: 'https://github.com',
      startDate: '2025-01',
      endDate: '2025-04',
      displayOrder: 0,
      isFeatured: true,
      viewCount: 0,
      status: 'published',
      images: [
        {
          id: 1,
          imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=900&q=80',
          caption: 'Interface system overview',
          displayOrder: 0,
          isCover: false
        },
        {
          id: 2,
          imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80',
          caption: 'Motion and dashboard details',
          displayOrder: 1,
          isCover: false
        }
      ]
    },
    {
      id: 2,
      title: 'Aether Brand System',
      slug: 'aether-brand-system',
      category: 'Identity System',
      coverImage: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=900&q=80',
      description: '为高端数字产品打造的品牌视觉和组件系统。',
      content: 'Luxury identity direction, component rules, and web-ready visual language.',
      role: 'Brand Designer',
      tools: 'Figma, Photoshop',
      projectUrl: '#',
      startDate: '2024-08',
      endDate: '2024-11',
      displayOrder: 1,
      isFeatured: false,
      viewCount: 0,
      status: 'published'
    }
  ],
  experiences: [
    {
      id: 1,
      type: 'work',
      company: 'Independent Studio',
      position: 'Creative Technologist',
      description: '为早期团队和个人品牌构建高质量网站、设计系统和交互动效。',
      startDate: '2022-01',
      isCurrent: true,
      displayOrder: 0
    }
  ],
  skills: [
    { id: 1, name: 'Figma', category: 'Design', proficiency: 5, displayOrder: 0 },
    { id: 2, name: 'React', category: 'Frontend', proficiency: 5, displayOrder: 1 },
    { id: 3, name: 'Motion Design', category: 'Interaction', proficiency: 4, displayOrder: 2 }
  ],
  awards: [
    {
      id: 1,
      title: 'Awwwards Honorable Mention',
      issuer: 'Awwwards',
      date: '2025',
      description: 'Recognized for visual craft, interaction detail, and responsive portfolio storytelling.',
      displayOrder: 0
    },
    {
      id: 2,
      title: 'Design System Challenge Finalist',
      issuer: 'Independent Studio Review',
      date: '2024',
      description: 'Selected for a polished component system and clear product thinking.',
      displayOrder: 1
    }
  ],
  socialLinks: [
    { id: 1, platform: 'GitHub', url: 'https://github.com', icon: 'github', displayOrder: 0 },
    { id: 2, platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin', displayOrder: 1 }
  ],
  videos: [
    {
      id: 1,
      title: 'Portfolio Walkthrough',
      platform: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
      description: 'A short walkthrough of the design system, portfolio structure, and interaction direction.',
      displayOrder: 0,
      isFeatured: true
    }
  ],
  config: defaultConfig
};
