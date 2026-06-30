import { MonitorSmartphone } from 'lucide-react';
import { EditorPanel } from './components/EditorPanel';
import { useSiteStore } from './store/siteStore';
import { TemplateRenderer } from './templates/TemplateRenderer';

export function App() {
  const { data, templateId } = useSiteStore();
  const templateName = templateId === 'aura' ? 'TemplateAura' : templateId === 'elena' ? 'TemplateElena' : 'TemplateSnowly';

  return (
    <main className="grid h-screen grid-cols-1 overflow-hidden bg-slate-100 lg:grid-cols-[420px_1fr]">
      <EditorPanel />
      <section className="min-h-0 overflow-hidden p-4">
        <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
            <MonitorSmartphone className="h-4 w-4" />
            实时预览
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{templateName}</div>
        </div>
        <div id="preview" className="sf-scrollbar h-[calc(100%-56px)] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
          <TemplateRenderer data={data} templateId={templateId} />
        </div>
      </section>
    </main>
  );
}
