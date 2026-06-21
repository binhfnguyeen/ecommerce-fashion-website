import { apiFetch } from './api';

export interface UploadResponse {
  fileName: string;
  url: string;
}

export const mediaService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<UploadResponse>('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
  }
};
