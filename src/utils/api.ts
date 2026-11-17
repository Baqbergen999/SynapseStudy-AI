export async function parseApiJson<T>(response: Response): Promise<T> {
  const rawText = await response.text();
  const trimmed = rawText.trim();

  if (!trimmed) {
    if (!response.ok) {
      throw new Error(`Server error (${response.status}). Empty response body.`);
    }
    return {} as T;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const looksLikeHtml = trimmed.startsWith('<');
    if (looksLikeHtml) {
      throw new Error(
        `Server returned HTTP ${response.status} HTML instead of JSON. Please refresh the page or check server status.`
      );
    }
    throw new Error(`Invalid server response (${response.status}): ${trimmed.slice(0, 120)}`);
  }

  if (!response.ok) {
    const errObj = parsed as { error?: string; message?: string };
    throw new Error(errObj?.error || errObj?.message || `Request failed (${response.status}).`);
  }

  return parsed as T;
}
