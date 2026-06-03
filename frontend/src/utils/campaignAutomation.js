const platformWindows = [
  { dayOffset: 1, hour: 9, minute: 30 },
  { dayOffset: 2, hour: 12, minute: 15 },
  { dayOffset: 3, hour: 17, minute: 45 },
  { dayOffset: 4, hour: 10, minute: 0 },
  { dayOffset: 5, hour: 15, minute: 30 },
];

const goalLabels = {
  awareness: 'Awareness',
  conversion: 'Conversion',
  retention: 'Retention',
  launch: 'Product launch',
};

const stageLabels = {
  cold: 'Cold audience',
  warm: 'Warm leads',
  customers: 'Existing customers',
};

export const formatCampaignPreferences = (preferences = {}) => {
  const lines = [];

  if (preferences.campaignGoal) {
    lines.push(`Campaign goal: ${goalLabels[preferences.campaignGoal] || preferences.campaignGoal}`);
  }

  if (preferences.audienceStage) {
    lines.push(`Audience stage: ${stageLabels[preferences.audienceStage] || preferences.audienceStage}`);
  }

  return lines;
};

export const slugify = (value = 'campaign') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'campaign';

export const getNextMonday = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  const day = date.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + daysUntilMonday);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const buildSchedule = (posts = []) => {
  const base = getNextMonday();

  return posts.map((post, index) => {
    const window = platformWindows[index % platformWindows.length];
    const date = new Date(base);
    date.setDate(base.getDate() + window.dayOffset - 1);
    date.setHours(window.hour, window.minute, 0, 0);

    return {
      id: `${post.platform}-${index}`,
      date,
      iso: date.toISOString(),
      slot: date.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      platform: post.platform,
      caption: post.caption,
      post,
    };
  });
};

export const buildPlatformCounts = (posts = []) =>
  posts.reduce((counts, post) => {
    counts[post.platform] = (counts[post.platform] || 0) + 1;
    return counts;
  }, {});

export const buildCampaignHealth = (result) => {
  if (!result?.posts?.length) {
    return {
      score: 0,
      label: 'Draft',
      imageCoverage: 0,
      highScoreCount: 0,
      ctaDiversity: 0,
      nextAction: 'Generate a campaign to unlock the workspace.',
    };
  }

  const posts = result.posts;
  const highScoreCount = posts.filter((post) => post.engagement_score_label === 'High').length;
  const imageCoverage = posts.filter((post) => post.image_url).length / posts.length;
  const ctaDiversity = new Set(posts.map((post) => post.cta?.toLowerCase()).filter(Boolean)).size;
  const platformCount = Object.keys(buildPlatformCounts(posts)).length;
  const hashtagDensity = posts.reduce((total, post) => total + post.hashtags.length, 0) / posts.length;

  const score = Math.min(
    98,
    Math.round(42 + imageCoverage * 18 + platformCount * 7 + highScoreCount * 6 + ctaDiversity * 3 + hashtagDensity * 2)
  );

  const label = score >= 86 ? 'Launch ready' : score >= 72 ? 'Strong draft' : 'Needs polish';
  const nextAction =
    score >= 86
      ? 'Schedule the queue and prepare performance tracking.'
      : highScoreCount === 0
        ? 'Tighten hooks and CTAs before scheduling.'
        : 'Approve visuals and finalize posting windows.';

  return {
    score,
    label,
    imageCoverage: Math.round(imageCoverage * 100),
    highScoreCount,
    ctaDiversity,
    nextAction,
  };
};

export const buildAutomationTasks = (result, schedule = [], preferences = {}) => {
  if (!result?.brand_profile) return [];

  const brand = result.brand_profile.brand_name;
  const firstSlot = schedule[0]?.slot || 'next publishing window';
  const goal = goalLabels[preferences.campaignGoal] || 'Campaign growth';

  return [
    {
      id: 'approve-positioning',
      title: 'Approve positioning',
      owner: 'Brand',
      due: 'Today',
      detail: `${brand} message, tone, audience, and offer are ready for sign-off.`,
    },
    {
      id: 'lock-goal',
      title: 'Lock campaign goal',
      owner: 'Growth',
      due: 'Today',
      detail: `${goal} is the primary optimization direction for this sprint.`,
    },
    {
      id: 'asset-pass',
      title: 'Review creative assets',
      owner: 'Creative',
      due: 'Tomorrow',
      detail: 'Approve post images, crop safety, CTA clarity, and platform fit.',
    },
    {
      id: 'tracking',
      title: 'Attach tracking links',
      owner: 'Marketing Ops',
      due: 'Before launch',
      detail: 'Use the generated UTM links before adding posts to the scheduler.',
    },
    {
      id: 'schedule',
      title: 'Queue publishing',
      owner: 'Social',
      due: firstSlot,
      detail: `Schedule ${result.posts.length} posts across ${Object.keys(buildPlatformCounts(result.posts)).length} channels.`,
    },
    {
      id: 'optimize',
      title: 'Performance review',
      owner: 'Growth',
      due: '48 hours after launch',
      detail: 'Compare hooks, saves, clicks, comments, and CTA conversion by platform.',
    },
  ];
};

const cleanCaption = (caption = '') =>
  caption
    .replace(/#[\w-]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const buildABVariants = (posts = []) =>
  posts.slice(0, 4).map((post, index) => {
    const clean = cleanCaption(post.caption);
    const firstSentence = clean.split(/[.!?]/)[0] || clean;
    const hook = firstSentence.length > 92 ? `${firstSentence.slice(0, 89)}...` : firstSentence;

    return {
      id: `${post.platform}-${index}`,
      platform: post.platform,
      primary: hook,
      variants: [
        `What changes when ${hook.toLowerCase()}?`,
        `The practical reason ${hook.toLowerCase()}.`,
        `For teams ready to move faster: ${hook}`,
      ],
    };
  });

export const buildUtmLinks = (url, result) => {
  if (!url || !result?.posts?.length) return [];

  try {
    const brandSlug = slugify(result.brand_profile.brand_name);
    const uniquePlatforms = [...new Set(result.posts.map((post) => post.platform))];

    return uniquePlatforms.map((platform) => {
      const link = new URL(url);
      link.searchParams.set('utm_source', platform.toLowerCase());
      link.searchParams.set('utm_medium', 'social');
      link.searchParams.set('utm_campaign', brandSlug);
      return {
        platform,
        url: link.toString(),
      };
    });
  } catch {
    return [];
  }
};

export const buildApprovalBrief = (result, schedule, tasks, variants, utmLinks) => {
  if (!result) return '';

  const brand = result.brand_profile;
  const lines = [
    `${brand.brand_name} Campaign Approval Brief`,
    '',
    `Tone: ${brand.tone}`,
    `Audience: ${brand.target_audience.join(', ')}`,
    `Offer: ${brand.products_services.join(', ')}`,
    '',
    'Launch Queue',
    ...schedule.map((item) => `- ${item.slot} | ${item.platform}: ${item.caption}`),
    '',
    'Automation Checklist',
    ...tasks.map((task) => `- [ ] ${task.title} (${task.owner}) - ${task.detail}`),
    '',
    'Tracking Links',
    ...utmLinks.map((link) => `- ${link.platform}: ${link.url}`),
    '',
    'Hook Variants',
    ...variants.flatMap((variant) => [
      `- ${variant.platform}: ${variant.primary}`,
      ...variant.variants.map((item) => `  - ${item}`),
    ]),
  ];

  return lines.join('\n');
};
