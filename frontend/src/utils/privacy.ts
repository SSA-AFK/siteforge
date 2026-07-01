import type { SiteData } from '@siteforge/shared';

export interface PrivacySettings {
  hideSensitiveInfo: boolean;
  showEmail: boolean;
  showLocation: boolean;
  showAvatar: boolean;
  showHeroImages: boolean;
  showSocialLinks: boolean;
  showProjectLinks: boolean;
  showGithubLinks: boolean;
  showProjectContent: boolean;
  showProjectMedia: boolean;
  showCompanyNames: boolean;
  showExperienceDetails: boolean;
  showAwards: boolean;
  showVideoLinks: boolean;
  showBlogPosts: boolean;
}

export const defaultPrivacySettings: PrivacySettings = {
  hideSensitiveInfo: true,
  showEmail: false,
  showLocation: true,
  showAvatar: true,
  showHeroImages: true,
  showSocialLinks: true,
  showProjectLinks: true,
  showGithubLinks: false,
  showProjectContent: true,
  showProjectMedia: true,
  showCompanyNames: true,
  showExperienceDetails: false,
  showAwards: true,
  showVideoLinks: true,
  showBlogPosts: false
};

export function sanitizeSiteData(data: SiteData, settings: PrivacySettings): SiteData {
  if (!settings.hideSensitiveInfo) {
    return data;
  }

  return {
    ...data,
    user: {
      ...data.user,
      email: settings.showEmail ? data.user.email : '',
      avatarUrl: settings.showAvatar ? data.user.avatarUrl : '',
      location: settings.showLocation ? data.user.location : ''
    },
    config: {
      ...data.config,
      heroImages: settings.showHeroImages ? data.config.heroImages : [],
      showAwards: data.config.showAwards && settings.showAwards,
      showVideos: data.config.showVideos && settings.showVideoLinks,
      showBlog: data.config.showBlog && settings.showBlogPosts
    },
    projects: data.projects.map((project) => ({
      ...project,
      coverImage: settings.showProjectMedia ? project.coverImage : '',
      images: settings.showProjectMedia ? project.images : [],
      content: settings.showProjectContent ? project.content : '',
      projectUrl: settings.showProjectLinks ? project.projectUrl : '',
      githubUrl: settings.showGithubLinks ? project.githubUrl : ''
    })),
    experiences: data.experiences.map((experience) => ({
      ...experience,
      company: settings.showCompanyNames ? experience.company : 'Company hidden',
      description: settings.showExperienceDetails ? experience.description : ''
    })),
    awards: settings.showAwards ? data.awards : [],
    socialLinks: settings.showSocialLinks ? data.socialLinks : [],
    blogPosts: settings.showBlogPosts ? data.blogPosts : [],
    videos: settings.showVideoLinks ? data.videos : []
  };
}

export function summarizeHiddenFields(data: SiteData, settings: PrivacySettings) {
  if (!settings.hideSensitiveInfo) return [];

  const hidden: string[] = [];
  if (!settings.showEmail && data.user.email) hidden.push('邮箱');
  if (!settings.showLocation && data.user.location) hidden.push('位置');
  if (!settings.showAvatar && data.user.avatarUrl) hidden.push('头像');
  if (!settings.showHeroImages && data.config.heroImages.length) hidden.push('首页背景图');
  if (!settings.showSocialLinks && data.socialLinks.length) hidden.push('社交链接');
  if (!settings.showProjectLinks && data.projects.some((project) => project.projectUrl)) hidden.push('项目外链');
  if (!settings.showGithubLinks && data.projects.some((project) => project.githubUrl)) hidden.push('GitHub 链接');
  if (!settings.showProjectContent && data.projects.some((project) => project.content)) hidden.push('项目正文');
  if (!settings.showProjectMedia && data.projects.some((project) => project.coverImage || project.images?.length)) hidden.push('项目图片');
  if (!settings.showCompanyNames && data.experiences.some((experience) => experience.company)) hidden.push('公司/学校名称');
  if (!settings.showExperienceDetails && data.experiences.some((experience) => experience.description)) hidden.push('经历详情');
  if (!settings.showAwards && data.awards.length) hidden.push('荣誉奖项');
  if (!settings.showVideoLinks && data.videos.length) hidden.push('视频模块');
  if (!settings.showBlogPosts && data.blogPosts.length) hidden.push('博客文章');
  return hidden;
}
