import { ExternalLink, Eye, ShieldCheck, X } from 'lucide-react';
import type { SiteData, TemplateId } from '@siteforge/shared';
import { sanitizeSiteData, summarizeHiddenFields, type PrivacySettings } from '../utils/privacy';

interface PublishSettingsModalProps {
  data: SiteData;
  templateId: TemplateId;
  settings: PrivacySettings;
  isPublishing: boolean;
  onClose: () => void;
  onChange: (settings: PrivacySettings) => void;
  onPublish: (publicData: SiteData) => void;
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`flex items-start justify-between gap-4 rounded-xl border p-3 transition ${disabled ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
      <span>
        <span className="block text-sm font-extrabold">{label}</span>
        <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{description}</span>
      </span>
      <input className="mt-1 h-4 w-4 shrink-0 accent-slate-950" type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export function PublishSettingsModal({ data, templateId, settings, isPublishing, onClose, onChange, onPublish }: PublishSettingsModalProps) {
  const publicData = sanitizeSiteData(data, settings);
  const hiddenFields = summarizeHiddenFields(data, settings);
  const publicContactCount = Number(Boolean(publicData.user.email)) + publicData.socialLinks.length;
  const privacyDisabled = !settings.hideSensitiveInfo;

  function patch(next: Partial<PrivacySettings>) {
    onChange({ ...settings, ...next });
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm">
      <div className="sf-scrollbar max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 p-5 backdrop-blur">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-purple-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              发布设置
            </div>
            <h2 className="mt-3 text-xl font-black text-slate-950">确认公开分享内容</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">发布会生成在线访问链接。系统只会提交下方确认后的公开版数据，不会修改编辑器里的原始表单。</p>
          </div>
          <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={onClose} aria-label="关闭发布设置">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-3 rounded-2xl bg-slate-950 p-4 text-white sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">模板</p>
              <p className="mt-1 text-sm font-extrabold">{templateId}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">公开作品</p>
              <p className="mt-1 text-sm font-extrabold">{publicData.projects.length} 个</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">联系入口</p>
              <p className="mt-1 text-sm font-extrabold">{publicContactCount} 个</p>
            </div>
          </div>

          <Toggle
            label="发布前检查并隐藏敏感信息"
            description="建议保持开启。开启后，你可以逐项决定哪些内容出现在公开链接中。"
            checked={settings.hideSensitiveInfo}
            onChange={(hideSensitiveInfo) => patch({ hideSensitiveInfo })}
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="公开邮箱" description="关闭后联系区不会显示 mailto 邮箱入口。" checked={settings.showEmail} disabled={privacyDisabled} onChange={(showEmail) => patch({ showEmail })} />
            <Toggle label="公开位置" description="适合只填写城市；如果包含详细地址建议关闭。" checked={settings.showLocation} disabled={privacyDisabled} onChange={(showLocation) => patch({ showLocation })} />
            <Toggle label="公开头像" description="关闭后导航、页脚或 Hero 中不会使用个人头像。" checked={settings.showAvatar} disabled={privacyDisabled} onChange={(showAvatar) => patch({ showAvatar })} />
            <Toggle label="公开首页背景图" description="关闭后发布页会回退到模板默认背景或纯视觉效果。" checked={settings.showHeroImages} disabled={privacyDisabled} onChange={(showHeroImages) => patch({ showHeroImages })} />
            <Toggle label="公开社交链接" description="关闭后 GitHub、LinkedIn 等社交按钮不会出现在公开页。" checked={settings.showSocialLinks} disabled={privacyDisabled} onChange={(showSocialLinks) => patch({ showSocialLinks })} />
            <Toggle label="公开项目外链" description="关闭后项目访问链接会被隐藏。" checked={settings.showProjectLinks} disabled={privacyDisabled} onChange={(showProjectLinks) => patch({ showProjectLinks })} />
            <Toggle label="公开 GitHub 链接" description="默认关闭，避免误公开私有仓库或内部代码地址。" checked={settings.showGithubLinks} disabled={privacyDisabled} onChange={(showGithubLinks) => patch({ showGithubLinks })} />
            <Toggle label="公开项目正文" description="关闭后只保留项目标题、分类和简短描述。" checked={settings.showProjectContent} disabled={privacyDisabled} onChange={(showProjectContent) => patch({ showProjectContent })} />
            <Toggle label="公开项目图片" description="关闭后项目封面和项目图集会被隐藏，适合图片包含客户或内部信息时使用。" checked={settings.showProjectMedia} disabled={privacyDisabled} onChange={(showProjectMedia) => patch({ showProjectMedia })} />
            <Toggle label="公开公司/学校名称" description="关闭后经历模块会用 Company hidden 替代具体组织名称。" checked={settings.showCompanyNames} disabled={privacyDisabled} onChange={(showCompanyNames) => patch({ showCompanyNames })} />
            <Toggle label="公开经历详情" description="关闭后保留职位和时间，隐藏多行职责、内部项目和交付细节。" checked={settings.showExperienceDetails} disabled={privacyDisabled} onChange={(showExperienceDetails) => patch({ showExperienceDetails })} />
            <Toggle label="公开荣誉奖项" description="关闭后公开页不展示奖项模块。" checked={settings.showAwards} disabled={privacyDisabled} onChange={(showAwards) => patch({ showAwards })} />
            <Toggle label="公开视频模块" description="关闭后公开页不展示视频，适合视频链接未确认权限时使用。" checked={settings.showVideoLinks} disabled={privacyDisabled} onChange={(showVideoLinks) => patch({ showVideoLinks })} />
            <Toggle label="公开博客文章" description="默认关闭，避免发布尚未审阅的文章正文。" checked={settings.showBlogPosts} disabled={privacyDisabled} onChange={(showBlogPosts) => patch({ showBlogPosts })} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-black text-slate-800">公开版预览摘要</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                  {hiddenFields.length ? `将隐藏：${hiddenFields.join('、')}。` : '当前设置不会隐藏字段。'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50" onClick={onClose}>
              取消
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPublishing}
              onClick={() => onPublish(publicData)}
            >
              <ExternalLink className="h-4 w-4" />
              {isPublishing ? '发布中...' : '确认发布并生成链接'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
