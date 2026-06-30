import { ImagePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { uploadImage } from '../utils/uploadImage';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  actionLabel?: string;
  uploadingLabel?: string;
  placeholder?: string;
}

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-purple-700 focus:ring-4 focus:ring-purple-100';

export function ImageUploadField({
  label,
  value,
  onChange,
  actionLabel = '选择图片',
  uploadingLabel = '上传中...',
  placeholder = '例如：https://example.com/image.jpg，或选择本地图片'
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  function closePickerWindow() {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setSelectedFile(null);
    setLocalPreviewUrl('');
  }

  function selectFile(file?: File) {
    if (!file || isUploading) return;
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setErrorMessage('');
    setSelectedFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
  }

  async function confirmUpload() {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);

    try {
      const result = await uploadImage(selectedFile);
      onChange(result.url);
      closePickerWindow();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '图片上传失败。');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition ${isUploading ? 'cursor-wait bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-3.5 w-3.5" />
          {isUploading ? uploadingLabel : actionLabel}
        </button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/*"
          disabled={isUploading}
          onChange={(event) => {
            selectFile(event.target.files?.[0]);
            event.currentTarget.value = '';
          }}
        />
      </div>
      {value ? <img src={value} alt={label} className="h-28 w-full rounded-lg border border-slate-200 object-cover" /> : null}
      <input className={inputClass} value={value || ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      {errorMessage ? <p className="text-xs font-semibold text-red-500">{errorMessage}</p> : null}
      {selectedFile && localPreviewUrl ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="图片上传预览">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-950">确认上传图片</p>
                <p className="mt-1 max-w-[280px] truncate text-xs font-semibold text-slate-500">{selectedFile.name}</p>
              </div>
              <button type="button" className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100" onClick={closePickerWindow} disabled={isUploading}>
                关闭
              </button>
            </div>
            <img src={localPreviewUrl} alt={selectedFile.name} className="max-h-[48vh] w-full rounded-xl border border-slate-200 bg-slate-50 object-contain" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50" onClick={closePickerWindow} disabled={isUploading}>
                取消
              </button>
              <button type="button" className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:bg-slate-300" onClick={() => void confirmUpload()} disabled={isUploading}>
                {isUploading ? uploadingLabel : '确认上传'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
