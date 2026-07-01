import { describe, expect, it } from 'vitest';
import { defaultSiteData } from '@siteforge/shared';
import { defaultPrivacySettings, sanitizeSiteData, summarizeHiddenFields } from './privacy';

describe('privacy publishing helpers', () => {
  it('creates a sanitized public copy without mutating the source data', () => {
    const source = {
      ...defaultSiteData,
      user: { ...defaultSiteData.user, email: 'hello@example.com', location: '中国 · 杭州', avatarUrl: 'https://example.com/avatar.jpg' },
      config: { ...defaultSiteData.config, heroImages: ['https://example.com/hero.jpg'] },
      projects: defaultSiteData.projects.map((project) => ({
        ...project,
        content: 'Internal long-form case study',
        coverImage: 'https://example.com/cover.jpg',
        images: [{ id: 1, imageUrl: 'https://example.com/private.jpg', caption: 'Private client screenshot', displayOrder: 0, isCover: false }],
        projectUrl: 'https://example.com/project',
        githubUrl: 'https://github.com/private/project'
      })),
      experiences: defaultSiteData.experiences.map((experience) => ({
        ...experience,
        company: 'Confidential Studio',
        description: 'Internal delivery details'
      })),
      blogPosts: [
        {
          id: 1,
          title: 'Draft insight',
          slug: 'draft-insight',
          content: 'Sensitive draft',
          tags: [],
          viewCount: 0,
          status: 'draft' as const
        }
      ]
    };

    const publicData = sanitizeSiteData(source, {
      ...defaultPrivacySettings,
      showAvatar: false,
      showHeroImages: false,
      showProjectContent: false,
      showProjectMedia: false,
      showCompanyNames: false,
      showAwards: false,
      showVideoLinks: false
    });

    expect(publicData.user.email).toBe('');
    expect(publicData.user.location).toBe('中国 · 杭州');
    expect(publicData.user.avatarUrl).toBe('');
    expect(publicData.config.heroImages).toEqual([]);
    expect(publicData.config.showAwards).toBe(false);
    expect(publicData.config.showVideos).toBe(false);
    expect(publicData.projects[0].coverImage).toBe('');
    expect(publicData.projects[0].images).toEqual([]);
    expect(publicData.projects[0].content).toBe('');
    expect(publicData.projects[0].projectUrl).toBe('https://example.com/project');
    expect(publicData.projects[0].githubUrl).toBe('');
    expect(publicData.experiences[0].company).toBe('Company hidden');
    expect(publicData.experiences[0].description).toBe('');
    expect(publicData.awards).toEqual([]);
    expect(publicData.videos).toEqual([]);
    expect(publicData.blogPosts).toEqual([]);
    expect(source.user.email).toBe('hello@example.com');
    expect(source.user.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(source.projects[0].githubUrl).toBe('https://github.com/private/project');
    expect(source.projects[0].content).toBe('Internal long-form case study');
    expect(source.experiences[0].company).toBe('Confidential Studio');
  });

  it('summarizes hidden fields for the publish confirmation dialog', () => {
    const hidden = summarizeHiddenFields(
      {
        ...defaultSiteData,
        user: { ...defaultSiteData.user, email: 'hello@example.com', avatarUrl: 'https://example.com/avatar.jpg' },
        config: { ...defaultSiteData.config, heroImages: ['https://example.com/hero.jpg'] }
      },
      {
        ...defaultPrivacySettings,
        showAvatar: false,
        showHeroImages: false,
        showProjectContent: false,
        showProjectMedia: false,
        showCompanyNames: false,
        showAwards: false
      }
    );

    expect(hidden).toContain('邮箱');
    expect(hidden).toContain('头像');
    expect(hidden).toContain('首页背景图');
    expect(hidden).toContain('项目正文');
    expect(hidden).toContain('项目图片');
    expect(hidden).toContain('公司/学校名称');
    expect(hidden).toContain('GitHub 链接');
    expect(hidden).toContain('经历详情');
    expect(hidden).toContain('荣誉奖项');
  });
});
