import { MonitorSmartphone, PanelLeft } from 'lucide-react';
import { useState } from 'react';
import type { TemplateId } from '@siteforge/shared';
import { EditorPanel } from './components/EditorPanel';
import { useSiteStore } from './store/siteStore';
import { TemplateRenderer } from './templates/TemplateRenderer';

const templateNames: Record<TemplateId, string> = {
  snowly: 'TemplateSnowly',
  elena: 'TemplateElena',
  aura: 'TemplateAura',
  solace: 'TemplateSolace',
  jakarta: 'TemplateJakarta',
  aqua: 'TemplateAqua'
};

export function App() {
  const { data, templateId } = useSiteStore();
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const templateName = templateNames[templateId];

  return (
    <main className="grid h-[100dvh] min-h-[100dvh] grid-rows-[auto_1fr] overflow-hidden bg-slate-100 lg:h-screen lg:min-h-screen lg:grid-cols-[420px_1fr] lg:grid-rows-1">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white/85 p-2 shadow-sm backdrop-blur lg:hidden">
        <button
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-extrabold transition ${mobileView === 'editor' ? 'bg-slate-950 text-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          onClick={() => setMobileView('editor')}
        >
          <PanelLeft className="h-4 w-4" />
          编辑
        </button>
        <button
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-extrabold transition ${mobileView === 'preview' ? 'bg-slate-950 text-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          onClick={() => setMobileView('preview')}
        >
          <MonitorSmartphone className="h-4 w-4" />
          预览
        </button>
      </div>

      <div className={`min-h-0 ${mobileView === 'editor' ? 'block' : 'hidden'} lg:block`}>
        <EditorPanel />
      </div>

      <section className={`min-h-0 overflow-hidden p-2 sm:p-4 ${mobileView === 'preview' ? 'block' : 'hidden'} lg:block`}>
        <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:mb-3 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
            <MonitorSmartphone className="h-4 w-4" />
            实时预览
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{templateName}</div>
        </div>
        <div id="preview" className="sf-scrollbar h-[calc(100%-52px)] overflow-y-auto rounded-xl bg-white shadow-2xl ring-1 ring-slate-200 sm:h-[calc(100%-56px)] sm:rounded-2xl">
          <TemplateRenderer data={data} templateId={templateId} />
        </div>
      </section>
    </main>
  );
}
