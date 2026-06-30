import type { SiteData, TemplateId } from '@siteforge/shared';
import { TemplateAura } from './TemplateAura';
import { TemplateElena } from './TemplateElena';
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

  return null;
}
