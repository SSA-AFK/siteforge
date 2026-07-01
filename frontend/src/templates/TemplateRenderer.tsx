import type { SiteData, TemplateId } from '@siteforge/shared';
import { TemplateAura } from './TemplateAura';
import { TemplateAqua } from './TemplateAqua';
import { TemplateElena } from './TemplateElena';
import { TemplateJakarta } from './TemplateJakarta';
import { TemplateSolace } from './TemplateSolace';
import { TemplateSnowly } from './TemplateSnowly';

interface TemplateRendererProps {
  data: SiteData;
  templateId: TemplateId;
}

export function TemplateRenderer({ data, templateId }: TemplateRendererProps) {
  if (templateId === 'snowly') {
    return <TemplateSnowly data={data} />;
  }

  if (templateId === 'elena') {
    return <TemplateElena data={data} />;
  }

  if (templateId === 'aura') {
    return <TemplateAura data={data} />;
  }

  if (templateId === 'solace') {
    return <TemplateSolace data={data} />;
  }

  if (templateId === 'jakarta') {
    return <TemplateJakarta data={data} />;
  }

  if (templateId === 'aqua') {
    return <TemplateAqua data={data} />;
  }

  return null;
}
