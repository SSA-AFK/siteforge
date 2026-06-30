export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 80 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 20000;

export async function uploadMedia(file: File, kind: 'image' | 'video'): Promise<UploadResult> {
  if (!file.type.startsWith(`${kind}/`)) {
    throw new Error(kind === 'image' ? '请选择图片文件。' : '请选择视频文件。');
  }

  const maxSize = kind === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    throw new Error(kind === 'image' ? '图片不能超过 10MB。' : '视频不能超过 80MB。');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'X-Filename': encodeURIComponent(file.name)
      },
      body: file,
      signal: controller.signal
    });

    if (!response.ok) {
      const fallback = kind === 'image' ? '图片上传失败。' : '视频上传失败。';
      const error = await response.json().catch(() => ({ error: fallback }));
      throw new Error(error.error || fallback);
    }

    return (await response.json()) as UploadResult;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('上传超时，请确认后端服务正在运行后重试。');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
