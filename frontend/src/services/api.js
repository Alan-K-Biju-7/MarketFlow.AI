const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const analyzeWebsite = async (url, tonePreset = 'auto', fallbackText = '') => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        tonePreset,
        fallbackText: fallbackText.trim() || undefined,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || 'Server error occurred');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('The request timed out. Please try again.');
    }
    throw new Error(error.message || 'Failed to make request');
  } finally {
    clearTimeout(timeoutId);
  }
};

export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadCSV = (data) => {
  const brandProfile = data.brand_profile;
  const posts = data.posts;
  
  let csvContent = `Brand Name,${brandProfile.brand_name}\n`;
  csvContent += `Description,"${brandProfile.description}"\n`;
  csvContent += `Tone,${brandProfile.tone}\n`;
  csvContent += `\n`;
  csvContent += `Platform,Caption,Hashtags,CTA,Engagement Score\n`;
  
  posts.forEach(post => {
    const hashtags = post.hashtags.join(' ');
    const caption = post.caption.replace(/"/g, '""');
    csvContent += `${post.platform},"${caption}","${hashtags}",${post.cta},${post.engagement_score_label}\n`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${brandProfile.brand_name}_marketing_content.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
