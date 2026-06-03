const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  'http://localhost:8000';

const downloadBlob = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const analyzeWebsite = async (url, tonePreset = 'auto', fallbackText = '', imageProvider = 'hybrid') => {
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
        imageProvider,
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
  downloadBlob(JSON.stringify(data, null, 2), filename, 'application/json');
};

export const downloadCSV = (data) => {
  const brandProfile = data.brand_profile;
  const posts = data.posts;
  
  let csvContent = `Brand Name,${brandProfile.brand_name}\n`;
  csvContent += `Description,"${brandProfile.description}"\n`;
  csvContent += `Tone,${brandProfile.tone}\n`;
  csvContent += `\n`;
  csvContent += `Platform,Caption,Hashtags,CTA,Engagement Score,Image Provider,Image URL\n`;
  
  posts.forEach(post => {
    const hashtags = post.hashtags.join(' ');
    const caption = post.caption.replace(/"/g, '""');
    const imageUrl = post.image_url || '';
    const imageProvider = post.image_provider || '';
    csvContent += `${post.platform},"${caption}","${hashtags}",${post.cta},${post.engagement_score_label},${imageProvider},${imageUrl}\n`;
  });
  
  downloadBlob(csvContent, `${brandProfile.brand_name}_marketing_content.csv`, 'text/csv');
};

export const downloadMarkdown = (data) => {
  const brandProfile = data.brand_profile;
  const posts = data.posts;

  const lines = [
    `# ${brandProfile.brand_name} Campaign Pack`,
    '',
    `## Brand Profile`,
    '',
    `**Description:** ${brandProfile.description}`,
    '',
    `**Tone:** ${brandProfile.tone}`,
    '',
    `**Products & Services:** ${brandProfile.products_services.join(', ')}`,
    '',
    `**Target Audience:** ${brandProfile.target_audience.join(', ')}`,
    '',
    `**Keywords:** ${brandProfile.keywords.join(', ')}`,
    '',
    `## Posts`,
    '',
    ...posts.flatMap((post, index) => [
      `### ${index + 1}. ${post.platform}`,
      '',
      post.caption,
      '',
      `**Hashtags:** ${post.hashtags.join(' ')}`,
      '',
      `**CTA:** ${post.cta}`,
      '',
      `**Engagement:** ${post.engagement_score_label}`,
      '',
      post.image_provider ? `**Image Provider:** ${post.image_provider}` : '',
      '',
      post.image_url ? `**Image:** ${post.image_url}` : '',
      '',
    ]),
  ];

  downloadBlob(lines.join('\n'), `${brandProfile.brand_name}_campaign_pack.md`, 'text/markdown');
};

const escapeICS = (value = '') =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');

const formatICSDate = (date) => new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export const downloadICS = (data, schedule) => {
  const brandProfile = data.brand_profile;
  const events = schedule.map((item, index) => {
    const start = new Date(item.date || item.iso);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const post = item.post || {};
    const description = [
      post.caption,
      post.hashtags?.join(' '),
      post.cta,
      post.image_url ? `Image: ${post.image_url}` : '',
    ].filter(Boolean).join('\n\n');

    return [
      'BEGIN:VEVENT',
      `UID:${brandProfile.brand_name}-${item.platform}-${index}@marketflow.ai`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${escapeICS(`${brandProfile.brand_name} ${item.platform} post`)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      'END:VEVENT',
    ].join('\n');
  });

  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MarketFlow AI//Campaign Schedule//EN',
    ...events,
    'END:VCALENDAR',
  ].join('\n');

  downloadBlob(content, `${brandProfile.brand_name}_posting_calendar.ics`, 'text/calendar');
};

export const downloadLaunchBrief = (data, briefText) => {
  downloadBlob(briefText, `${data.brand_profile.brand_name}_launch_brief.txt`, 'text/plain');
};
