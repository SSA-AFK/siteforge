import { describe, expect, it } from 'vitest';
import { defaultSiteData } from '@siteforge/shared';
import { renderStaticHtml } from './renderStaticHtml.js';

describe('renderStaticHtml', () => {
  it('exports Snowly HTML with user content and interactions', () => {
    const html = renderStaticHtml(defaultSiteData, 'snowly');

    expect(html).toContain(defaultSiteData.user.displayName);
    expect(html).toContain('Vortex Quantum Dashboard');
    expect(html).toContain('Awwwards Honorable Mention');
    expect(html).toContain('award-grid');
    expect(html).toContain('Portfolio Walkthrough');
    expect(html).toContain('Interface system overview');
    expect(html).toContain('hero-slide');
    expect(html).toContain('Contact Me');
    expect(html).toContain('button secondary');
    expect(html).toContain('padding-left: clamp(24px, 7vw, 160px)');
    expect(html).toContain('margin: 80px auto 80px 0');
    expect(html).toContain('hero-dots');
    expect(html).toContain('hero-arrows');
    expect(html).toContain('prevHero');
    expect(html).toContain('image-preview-trigger');
    expect(html).toContain('imageLightbox');
    expect(html).not.toContain('Before / After Results');
    expect(html).not.toContain('calculateEstimate');
    expect(html).toContain('--primary: #3b0764');
  });

  it('rejects unsupported templates', () => {
    expect(() => renderStaticHtml(defaultSiteData, 'unknown')).toThrow('Unsupported template');
  });

  it('exports project list layout when configured', () => {
    const html = renderStaticHtml(
      {
        ...defaultSiteData,
        config: { ...defaultSiteData.config, layout: 'list' }
      },
      'snowly'
    );

    expect(html).toContain('class="project-grid project-grid-list"');
  });

  it('exports Elena HTML without hero carousel controls', () => {
    const html = renderStaticHtml(defaultSiteData, 'elena');

    expect(html).toContain('tilt-card');
    expect(html).toContain('scramble-trigger');
    expect(html).toContain('SELECTED PORTFOLIO');
    expect(html).toContain(defaultSiteData.projects[0].title);
    expect(html).toContain('project-gallery');
    expect(html).toContain('Interface system overview');
    expect(html).toContain('MOTION PROOF');
    expect(html).toContain('video-grid');
    expect(html).toContain('Portfolio Walkthrough');
    expect(html).toContain('RECOGNITION');
    expect(html).toContain('elena-award-grid');
    expect(html).toContain('Awwwards Honorable Mention');
    expect(html).toContain('SKILL STACK');
    expect(html).toContain('skill-grid-elena');
    expect(html).toContain('Frontend');
    expect(html).toContain('5/5');
    expect(html).toContain('width:100%');
    expect(html).not.toContain('hero-slide');
    expect(html).not.toContain('hero-dots');
  });

  it('omits Elena video section when videos are disabled or empty', () => {
    const disabledHtml = renderStaticHtml(
      {
        ...defaultSiteData,
        config: { ...defaultSiteData.config, showVideos: false }
      },
      'elena'
    );
    const emptyHtml = renderStaticHtml(
      {
        ...defaultSiteData,
        videos: []
      },
      'elena'
    );

    expect(disabledHtml).not.toContain('MOTION PROOF');
    expect(disabledHtml).not.toContain('id="videos"');
    expect(disabledHtml).not.toContain('Portfolio Walkthrough');
    expect(emptyHtml).not.toContain('MOTION PROOF');
    expect(emptyHtml).not.toContain('id="videos"');
    expect(emptyHtml).not.toContain('Portfolio Walkthrough');
  });

  it('omits Elena skill sections when skills are disabled or empty', () => {
    const disabledHtml = renderStaticHtml(
      {
        ...defaultSiteData,
        config: { ...defaultSiteData.config, showSkills: false }
      },
      'elena'
    );
    const emptyHtml = renderStaticHtml(
      {
        ...defaultSiteData,
        skills: []
      },
      'elena'
    );

    expect(disabledHtml).not.toContain('SKILL STACK');
    expect(disabledHtml).not.toContain('id="skills"');
    expect(disabledHtml).not.toContain('data-text="SKILLS"');
    expect(emptyHtml).not.toContain('SKILL STACK');
    expect(emptyHtml).not.toContain('id="skills"');
    expect(emptyHtml).not.toContain('data-text="SKILLS"');
  });

  it('omits Elena awards section when awards are disabled or empty', () => {
    const disabledHtml = renderStaticHtml(
      {
        ...defaultSiteData,
        config: { ...defaultSiteData.config, showAwards: false }
      },
      'elena'
    );
    const emptyHtml = renderStaticHtml(
      {
        ...defaultSiteData,
        awards: []
      },
      'elena'
    );

    expect(disabledHtml).not.toContain('RECOGNITION');
    expect(disabledHtml).not.toContain('id="awards"');
    expect(disabledHtml).not.toContain('Awwwards Honorable Mention');
    expect(emptyHtml).not.toContain('RECOGNITION');
    expect(emptyHtml).not.toContain('id="awards"');
    expect(emptyHtml).not.toContain('Awwwards Honorable Mention');
  });

  it('exports Aura HTML with terminal visuals and portfolio data', () => {
    const html = renderStaticHtml(defaultSiteData, 'aura');

    expect(html).toContain('auraCanvas');
    expect(html).toContain('scanlines');
    expect(html).toContain('sweep-line');
    expect(html).toContain('customCursor');
    expect(html).toContain('aura-reveal');
    expect(html).toContain('videoModal');
    expect(html).toContain('project-card');
    expect(html).toContain('CORE DATA MATRIX');
    expect(html).toContain(defaultSiteData.projects[0].title);
    expect(html).toContain('MULTIMEDIA TERMINAL');
    expect(html).toContain(defaultSiteData.videos[0].title);
    expect(html).toContain('HONOR DATA VAULT');
    expect(html).toContain(defaultSiteData.awards[0].title);
    expect(html).toContain('SKILL PROTOCOLS');
    expect(html).toContain(defaultSiteData.skills[0].name);
    expect(html).not.toContain('three.min.js');
    expect(html).not.toContain('gsap');
    expect(html).not.toContain('lenis');
  });

  it('omits Aura optional media sections when disabled or empty', () => {
    const disabledHtml = renderStaticHtml(
      {
        ...defaultSiteData,
        config: {
          ...defaultSiteData.config,
          showVideos: false,
          showAwards: false,
          showSkills: false
        }
      },
      'aura'
    );
    const emptyHtml = renderStaticHtml(
      {
        ...defaultSiteData,
        videos: [],
        awards: [],
        skills: []
      },
      'aura'
    );

    expect(disabledHtml).not.toContain('MULTIMEDIA TERMINAL');
    expect(disabledHtml).not.toContain('HONOR DATA VAULT');
    expect(disabledHtml).not.toContain('SKILL PROTOCOLS');
    expect(emptyHtml).not.toContain('MULTIMEDIA TERMINAL');
    expect(emptyHtml).not.toContain('HONOR DATA VAULT');
    expect(emptyHtml).not.toContain('SKILL PROTOCOLS');
  });

  it('exports Solace HTML with premium green visuals and portfolio data', () => {
    const html = renderStaticHtml(defaultSiteData, 'solace');

    expect(html).toContain('Solace Portfolio');
    expect(html).toContain('Selected Work');
    expect(html).toContain('spotlight');
    expect(html).toContain('reveal');
    expect(html).toContain('const slides =');
    expect(html).toContain(defaultSiteData.projects[0].title);
    expect(html).toContain(defaultSiteData.skills[0].name);
    expect(html).toContain(defaultSiteData.awards[0].title);
    expect(html).toContain(defaultSiteData.videos[0].title);
    expect(html).toContain('video-card featured');
    expect(html).toContain('Featured Reel');
    expect(html).toContain('CONTACT ME');
  });

  it('omits Solace optional sections when disabled or empty', () => {
    const html = renderStaticHtml(
      {
        ...defaultSiteData,
        videos: [],
        awards: [],
        skills: [],
        config: {
          ...defaultSiteData.config,
          showVideos: false,
          showAwards: false,
          showSkills: false
        }
      },
      'solace'
    );

    expect(html).not.toContain('Video showcase');
    expect(html).not.toContain('Skill Stack');
    expect(html).not.toContain('Honors');
  });

  it('exports Jakarta HTML with SaaS visuals and portfolio modules', () => {
    const html = renderStaticHtml(defaultSiteData, 'jakarta');

    expect(html).toContain('Jakarta Portfolio');
    expect(html).not.toContain('Portfolio Builder');
    expect(html).not.toContain('topbar');
    expect(html).toContain('Now Featuring');
    expect(html).toContain(defaultSiteData.projects[0].title);
    expect(html).toContain(defaultSiteData.videos[0].title);
    expect(html).toContain(defaultSiteData.skills[0].name);
    expect(html).toContain(`${defaultSiteData.skills[0].proficiency}/5`);
    expect(html).toContain('skill-bar');
    expect(html).toContain(defaultSiteData.awards[0].title);
    expect(html).toContain('metric-card');
    expect(html).not.toContain('renderKeypad');
    expect(html).not.toContain('P-10');
  });

  it('exports Aqua HTML with glass visuals and form-driven modules', () => {
    const html = renderStaticHtml(defaultSiteData, 'aqua');

    expect(html).toContain('Aqua Portfolio');
    expect(html).not.toContain('marquee-track');
    expect(html).toContain('class="particles"');
    expect(html).toContain('particle-drift');
    expect(html).toContain('card-center');
    expect(html).toContain('orbit-saucer');
    expect(html).toContain(defaultSiteData.projects[0].title);
    expect(html).toContain('Experience Timeline');
    expect(html).toContain(defaultSiteData.experiences[0].position);
    expect(html).toContain('Skill Matrix');
    expect(html).toContain(`${defaultSiteData.skills[0].proficiency}/5`);
    expect(html).toContain('tool-meter');
    expect(html).toContain('tool-orb');
    expect(html).toContain(defaultSiteData.awards[0].title);
    expect(html).toContain(defaultSiteData.videos[0].title);
    expect(html).not.toContain('Project Cost Estimator');
    expect(html).not.toContain('Select Project Type');
    expect(html).not.toContain('skills-slider');
  });
});
