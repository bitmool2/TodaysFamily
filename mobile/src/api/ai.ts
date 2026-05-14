import api from './client';

export interface CaptionResponse {
  caption: string;
  isAi: boolean;
}

/**
 * Call backend POST /ai/caption — GPT-4o Vision generates a warm Korean caption.
 * Falls back gracefully if the backend returns a canned response.
 */
export async function generateCaption(
  imageUrl: string,
  childName?: string,
): Promise<CaptionResponse> {
  const { data } = await api.post<CaptionResponse>('/ai/caption', {
    imageUrl,
    childName,
  });
  return data;
}
