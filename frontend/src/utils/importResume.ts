import { defaultSiteData, normalizeModuleOrder, type Award, type Experience, type Project, type SiteData, type Skill, type SocialLink } from '@siteforge/shared';

type JsonObject = Record<string, unknown>;

export interface ResumeImportReport {
  filled: string[];
  missing: string[];
  skipped: string[];
}

export interface ResumeImportResult {
  data: SiteData;
  report: ResumeImportReport;
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function asItems(section: unknown) {
  if (!isObject(section) || section.visible === false || !Array.isArray(section.items)) return [];
  return section.items.filter(isObject);
}

function visibleSection(sections: JsonObject, key: string) {
  const section = sections[key];
  if (!isObject(section) || section.visible === false) return undefined;
  return section;
}

function urlHref(value: unknown) {
  if (!isObject(value)) return '';
  return asString(value.href);
}

function htmlToText(value: unknown) {
  return asString(value)
    .replace(/<\/(p|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function slugify(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback;
}

function parseDateRange(value: unknown) {
  const date = asString(value);
  const [rawStart = '', rawEnd = ''] = date.split(/\s*[-–—]\s*/);
  const normalize = (part: string) => {
    const match = part.match(/(\d{4})[./-](\d{1,2})/);
    return match ? `${match[1]}-${match[2].padStart(2, '0')}` : '';
  };
  const isCurrent = /至今|present|current/i.test(rawEnd);
  return {
    startDate: normalize(rawStart),
    endDate: isCurrent ? '' : normalize(rawEnd),
    isCurrent
  };
}

function iconForPlatform(platform: string) {
  const key = platform.toLowerCase();
  if (key.includes('github')) return 'github';
  if (key.includes('linkedin')) return 'linkedin';
  if (key.includes('blog') || key.includes('hashnode')) return 'hash';
  if (key.includes('twitter') || key.includes('x')) return 'twitter';
  return '';
}

function inferUsername(name: string, email: string, profiles: JsonObject[]) {
  const github = profiles.find((profile) => asString(profile.network).toLowerCase().includes('github'));
  const githubUser = asString(github?.username);
  if (githubUser) return slugify(githubUser, 'creator');
  const emailPrefix = email.split('@')[0];
  if (emailPrefix) return slugify(emailPrefix, 'creator');
  return slugify(name, 'creator');
}

function uniqueSocialLinks(items: SocialLink[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.platform.toLowerCase()}|${item.url}`;
    if (!item.url || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function importReactiveResumeJson(source: unknown, currentData: SiteData = defaultSiteData): ResumeImportResult {
  if (!isObject(source) || !isObject(source.basics) || !isObject(source.sections)) {
    throw new Error('未识别到有效的 Reactive Resume JSON：缺少 basics 或 sections。');
  }

  const basics = source.basics;
  const sections = source.sections;
  const profiles = asItems(sections.profiles);
  const name = asString(basics.name);
  const email = asString(basics.email);
  const summary = visibleSection(sections, 'summary');
  const summaryText = htmlToText(summary?.content);
  const picture = isObject(basics.picture) ? asString(pictureUrl(basics.picture)) : '';
  const filled: string[] = [];
  const missing = new Set<string>();
  const skipped = new Set<string>();

  function mark(label: string, count?: number) {
    if (count === undefined || count > 0) filled.push(count === undefined ? label : `${label} ${count} 项`);
  }

  const socialLinks: SocialLink[] = uniqueSocialLinks([
    ...profiles.map((profile, index): SocialLink => {
      const platform = asString(profile.network) || asString(profile.username) || 'Social';
      return {
        id: index + 1,
        platform,
        url: urlHref(profile.url),
        icon: asString(profile.icon) || iconForPlatform(platform),
        displayOrder: index
      };
    }),
    {
      id: profiles.length + 1,
      platform: asString(isObject(basics.url) ? basics.url.label : '') || 'Portfolio',
      url: urlHref(basics.url),
      icon: 'external-link',
      displayOrder: profiles.length
    }
  ]).map((item, index) => ({ ...item, id: index + 1, displayOrder: index }));

  const projects: Project[] = asItems(sections.projects).map((item, index) => {
    const title = asString(item.name) || `Project ${index + 1}`;
    const dates = parseDateRange(item.date);
    const keywords = Array.isArray(item.keywords) ? item.keywords.map(asString).filter(Boolean) : [];
    const summaryText = htmlToText(item.summary);
    return {
      id: index + 1,
      title,
      slug: slugify(title, `project-${index + 1}`),
      category: keywords[0] || 'Project',
      coverImage: '',
      description: summaryText.split('\n')[0] || asString(item.description) || '',
      content: summaryText,
      role: asString(item.description),
      tools: keywords.join(', '),
      projectUrl: urlHref(item.url),
      startDate: dates.startDate,
      endDate: dates.endDate,
      displayOrder: index,
      isFeatured: index === 0,
      viewCount: 0,
      status: 'published',
      images: []
    };
  });

  const workExperiences = asItems(sections.experience).map((item, index): Experience => {
    const dates = parseDateRange(item.date);
    return {
      id: index + 1,
      type: 'work',
      company: asString(item.company),
      position: asString(item.position),
      description: htmlToText(item.summary),
      startDate: dates.startDate,
      endDate: dates.endDate,
      isCurrent: dates.isCurrent,
      displayOrder: index
    };
  });

  const educationExperiences = asItems(sections.education).map((item, index): Experience => {
    const dates = parseDateRange(item.date);
    const position = [asString(item.studyType), asString(item.area)].filter(Boolean).join(' / ');
    return {
      id: workExperiences.length + index + 1,
      type: 'education',
      company: asString(item.institution),
      position,
      description: htmlToText(item.summary),
      startDate: dates.startDate,
      endDate: dates.endDate,
      isCurrent: dates.isCurrent,
      displayOrder: workExperiences.length + index
    };
  });

  const skills: Skill[] = asItems(sections.skills).flatMap((item) => {
    const category = asString(item.name);
    const proficiency = clampSkillLevel(Number(item.level));
    const keywords = Array.isArray(item.keywords) ? item.keywords.map(asString).filter(Boolean) : [];
    if (keywords.length) {
      return keywords.map((keyword) => ({ name: keyword, category, proficiency }));
    }
    return category ? [{ name: category, category: '', proficiency }] : [];
  }).map((skill, index) => ({ ...skill, id: index + 1, displayOrder: index }));

  const awards: Award[] = [
    ...asItems(sections.awards).map((item) => ({
      title: asString(item.title),
      issuer: asString(item.awarder),
      date: asString(item.date),
      description: htmlToText(item.summary)
    })),
    ...asItems(sections.certifications).map((item) => ({
      title: asString(item.name),
      issuer: asString(item.issuer),
      date: asString(item.date),
      description: htmlToText(item.summary)
    }))
  ].filter((item) => item.title || item.issuer).map((award, index) => ({ ...award, id: index + 1, displayOrder: index }));

  if (!picture) missing.add('头像');
  if (!projects.some((project) => project.coverImage)) missing.add('项目封面图');
  missing.add('Hero 背景图');
  missing.add('视频');
  if (!name) missing.add('显示名称');
  if (!email) missing.add('邮箱');
  if (asString(basics.phone)) skipped.add('电话：当前网站暂无线下电话字段');
  if (asItems(sections.languages).length) skipped.add('语言：当前网站暂无独立语言模块');
  if (asItems(sections.interests).length) skipped.add('兴趣：当前网站暂无独立兴趣模块');
  if (asItems(sections.publications).length) skipped.add('出版物：当前网站暂无独立出版物模块');
  if (asItems(sections.references).length) skipped.add('推荐信：当前网站暂无独立推荐信模块');
  if (asItems(sections.volunteer).length) skipped.add('志愿者经历：当前网站暂无独立志愿者模块');

  mark('个人信息');
  mark('社交链接', socialLinks.length);
  mark('项目', projects.length);
  mark('经历', workExperiences.length + educationExperiences.length);
  mark('技能', skills.length);
  mark('荣誉/证书', awards.length);

  const data: SiteData = {
    ...currentData,
    user: {
      ...currentData.user,
      displayName: name || currentData.user.displayName,
      username: inferUsername(name, email, profiles),
      email: email || currentData.user.email,
      avatarUrl: picture || currentData.user.avatarUrl,
      title: asString(basics.headline) || currentData.user.title,
      bio: currentData.user.bio,
      fullBio: summaryText || currentData.user.fullBio,
      location: asString(basics.location) || currentData.user.location
    },
    projects,
    experiences: [...workExperiences, ...educationExperiences],
    skills,
    awards,
    socialLinks,
    videos: [],
    config: {
      ...currentData.config,
      showExperience: workExperiences.length + educationExperiences.length > 0,
      showSkills: skills.length > 0,
      showVideos: false,
      showAwards: awards.length > 0,
      moduleOrder: normalizeModuleOrder(currentData.config.moduleOrder)
    }
  };

  return {
    data,
    report: {
      filled,
      missing: [...missing],
      skipped: [...skipped]
    }
  };
}

function pictureUrl(picture: JsonObject) {
  return picture.url;
}

function clampSkillLevel(level: number): 1 | 2 | 3 | 4 | 5 {
  if (level >= 5) return 5;
  if (level >= 4) return 4;
  if (level >= 3) return 3;
  if (level >= 2) return 2;
  return 1;
}
