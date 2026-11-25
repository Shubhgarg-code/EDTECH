/**
 * Utility for parsing and validating YouTube video URLs.
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube-nocookie.com/embed/VIDEO_ID
 * - m.youtube.com/watch?v=VIDEO_ID
 * - Direct 11-char ID
 */

export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If already exactly an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtube-nocookie.com')) {
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const last = pathParts[pathParts.length - 1];
        if (/^[a-zA-Z0-9_-]{11}$/.test(last)) return last;
      }
    } else if (parsed.hostname === 'youtu.be') {
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0 && /^[a-zA-Z0-9_-]{11}$/.test(pathParts[0])) {
        return pathParts[0];
      }
    }
  } catch {
    // Ignored
  }

  return null;
};

export const isValidYouTubeUrl = (url) => {
  return extractYouTubeId(url) !== null;
};

export const getYouTubeEmbedUrl = (videoId, options = {}) => {
  const id = extractYouTubeId(videoId) || videoId;
  if (!id) return '';
  const rel = options.rel ?? 0;
  const modestbranding = options.modestbranding ?? 1;
  const enablejsapi = options.enablejsapi ?? 1;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=${rel}&modestbranding=${modestbranding}&enablejsapi=${enablejsapi}`;
};
