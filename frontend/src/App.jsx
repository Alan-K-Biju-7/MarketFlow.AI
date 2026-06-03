import React, { useMemo, useState } from 'react';
import './App.css';
import URLInputForm from './components/URLInputForm';
import BrandProfileCard from './components/BrandProfileCard';
import PostCard from './components/PostCard';
import LoadingSpinner from './components/LoadingSpinner';
import CampaignScorecard from './components/CampaignScorecard';
import AutomationHub from './components/AutomationHub';
import {
  analyzeWebsite,
  downloadCSV,
  downloadICS,
  downloadJSON,
  downloadLaunchBrief,
  downloadMarkdown,
} from './services/api';
import {
  buildABVariants,
  buildApprovalBrief,
  buildAutomationTasks,
  buildCampaignHealth,
  buildPlatformCounts,
  buildSchedule,
  buildUtmLinks,
  formatCampaignPreferences,
} from './utils/campaignAutomation';
import {
  FaBolt,
  FaBriefcase,
  FaCalendarAlt,
  FaCheck,
  FaCopy,
  FaDownload,
  FaFilter,
  FaHistory,
  FaLayerGroup,
  FaRegFileAlt,
  FaRocket,
  FaSyncAlt,
} from 'react-icons/fa';

const historyKey = 'marketflow_campaign_history';

const readHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(historyKey)) || [];
  } catch {
    return [];
  }
};

const writeHistory = (items) => {
  localStorage.setItem(historyKey, JSON.stringify(items.slice(0, 12)));
};

const viewTabs = [
  { id: 'command', label: 'Command Center', icon: <FaBolt /> },
  { id: 'posts', label: 'Posts', icon: <FaLayerGroup /> },
  { id: 'brand', label: 'Brand System', icon: <FaBriefcase /> },
];

const emptyHighlights = [
  ['Strategy', 'Brand profile, offer, audience, tone'],
  ['Creative', 'Posts, visuals, hooks, CTAs'],
  ['Automation', 'Calendar, UTM links, checklist'],
  ['Handoff', 'CSV, JSON, Markdown, ICS, brief'],
];

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [campaignHistory, setCampaignHistory] = useState(readHistory);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [activeView, setActiveView] = useState('command');
  const [activeCampaign, setActiveCampaign] = useState(null);

  const posts = result?.posts || [];
  const campaignUrl = activeCampaign?.url || '';

  const platformCounts = useMemo(() => buildPlatformCounts(posts), [posts]);
  const schedule = useMemo(() => buildSchedule(posts), [posts]);
  const health = useMemo(() => buildCampaignHealth(result), [result]);
  const automationTasks = useMemo(
    () => buildAutomationTasks(result, schedule, activeCampaign?.preferences),
    [result, schedule, activeCampaign]
  );
  const variants = useMemo(() => buildABVariants(posts), [posts]);
  const utmLinks = useMemo(() => buildUtmLinks(campaignUrl, result), [campaignUrl, result]);
  const approvalBrief = useMemo(
    () => buildApprovalBrief(result, schedule, automationTasks, variants, utmLinks),
    [result, schedule, automationTasks, variants, utmLinks]
  );

  const filteredPosts = posts.filter((post) => filterPlatform === 'All' || post.platform === filterPlatform);

  const handleSubmit = async (url, tonePreset, fallbackText, imageProvider, preferences) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveView('command');

    const enrichedNotes = [fallbackText.trim(), ...formatCampaignPreferences(preferences)]
      .filter(Boolean)
      .join('\n');

    try {
      const data = await analyzeWebsite(url, tonePreset, enrichedNotes, imageProvider);
      const campaign = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        url,
        tonePreset,
        fallbackText: enrichedNotes,
        imageProvider,
        preferences,
        data,
      };
      const nextHistory = [campaign, ...campaignHistory.filter((item) => item.url !== url)];
      setCampaignHistory(nextHistory);
      writeHistory(nextHistory);
      setResult(data);
      setActiveCampaign(campaign);
      setFilterPlatform('All');
    } catch (err) {
      setError(err.message || 'Failed to analyze website. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (result) downloadJSON(result, `${result.brand_profile.brand_name}_content.json`);
  };

  const handleDownloadCSV = () => {
    if (result) downloadCSV(result);
  };

  const handleDownloadMarkdown = () => {
    if (result) downloadMarkdown(result);
  };

  const handleDownloadICS = () => {
    if (result) downloadICS(result, schedule);
  };

  const handleDownloadBrief = () => {
    if (result) downloadLaunchBrief(result, approvalBrief);
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const text = posts
      .map((post, index) => {
        const slot = schedule[index]?.slot || `Post ${index + 1}`;
        return `${slot}\n${post.platform}\n${post.caption}\n${post.hashtags.join(' ')}\n${post.cta}`;
      })
      .join('\n\n---\n\n');
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1800);
  };

  const handleCopyBrief = async () => {
    if (!approvalBrief) return;
    await navigator.clipboard.writeText(approvalBrief);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 1800);
  };

  const loadCampaign = (campaign) => {
    setResult(campaign.data);
    setActiveCampaign(campaign);
    setError(null);
    setFilterPlatform('All');
    setActiveView('command');
  };

  const clearHistory = () => {
    setCampaignHistory([]);
    writeHistory([]);
  };

  const findScheduleSlot = (post) => schedule.find((item) => item.post === post)?.slot;

  return (
    <div className="min-h-screen premium-shell text-gray-950">
      <header className="bg-gray-950 text-white border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-white text-gray-950 flex items-center justify-center shadow-sm">
                <FaRocket />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-teal-300">Premium marketing command center</p>
                <h1 className="text-3xl md:text-4xl font-black tracking-normal">MarketFlow AI</h1>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-full lg:min-w-[620px]">
              {emptyHighlights.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-black uppercase text-gray-400">{label}</p>
                  <p className="text-sm font-bold text-white mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 py-6">
        <div className="grid xl:grid-cols-[390px_minmax(0,1fr)] gap-6 items-start">
          <aside className="space-y-5 xl:sticky xl:top-5">
            <URLInputForm onSubmit={handleSubmit} loading={loading} />

            <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaHistory className="text-teal-700" />
                  <h2 className="font-black text-gray-900">Campaign History</h2>
                </div>
                {campaignHistory.length > 0 && (
                  <button onClick={clearHistory} className="text-xs font-black text-gray-500 hover:text-red-600">
                    Clear
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {campaignHistory.length === 0 ? (
                  <p className="p-5 text-sm text-gray-500">Saved campaigns appear here.</p>
                ) : (
                  campaignHistory.map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => loadCampaign(campaign)}
                      className={`w-full text-left p-4 transition-colors ${
                        activeCampaign?.id === campaign.id ? 'bg-teal-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-black text-gray-900 truncate">{campaign.data.brand_profile.brand_name}</p>
                      <p className="text-xs text-gray-500 truncate">{campaign.url}</p>
                      <div className="flex items-center justify-between gap-3 mt-2">
                        <p className="text-xs text-teal-700 font-black">
                          {new Date(campaign.createdAt).toLocaleString()}
                        </p>
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-black text-gray-600">
                          {campaign.imageProvider || 'hybrid'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          </aside>

          <section className="space-y-5 min-w-0">
            {loading && <LoadingSpinner />}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-black text-red-900">Analysis failed</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {!result && !loading && (
              <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1 text-sm font-black text-amber-800">
                      <FaSyncAlt />
                      Ready for a campaign
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-normal text-gray-950 mt-4">
                      Generate, package, and launch from one workspace.
                    </h2>
                    <p className="text-gray-600 mt-4 text-lg max-w-2xl">
                      Build the campaign on the left. The workspace will assemble the scorecard, launch queue,
                      tracking links, variants, exports, and creative handoff.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {emptyHighlights.map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-black uppercase text-gray-500">{label}</p>
                        <p className="font-black text-gray-950 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {result && !loading && (
              <>
                <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase text-teal-700">Active campaign</p>
                      <h2 className="text-3xl font-black text-gray-950 truncate">
                        {result.brand_profile.brand_name}
                      </h2>
                      <p className="text-sm text-gray-500 truncate mt-1">{campaignUrl}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button onClick={handleCopyAll} className="action-button bg-gray-950 text-white hover:bg-gray-800">
                        {copiedAll ? <FaCheck /> : <FaCopy />}
                        {copiedAll ? 'Copied' : 'Copy Queue'}
                      </button>
                      <button onClick={handleDownloadBrief} className="action-button bg-amber-600 text-white hover:bg-amber-700">
                        <FaRegFileAlt />
                        Brief
                      </button>
                      <button onClick={handleDownloadICS} className="action-button bg-teal-700 text-white hover:bg-teal-800">
                        <FaCalendarAlt />
                        Calendar
                      </button>
                      <button onClick={handleDownloadMarkdown} className="action-button bg-gray-100 text-gray-800 hover:bg-gray-200">
                        <FaDownload />
                        MD
                      </button>
                      <button onClick={handleDownloadCSV} className="action-button bg-gray-100 text-gray-800 hover:bg-gray-200">
                        CSV
                      </button>
                      <button onClick={handleDownloadJSON} className="action-button bg-gray-100 text-gray-800 hover:bg-gray-200">
                        JSON
                      </button>
                    </div>
                  </div>
                </section>

                <nav className="bg-white border border-gray-200 rounded-lg shadow-sm p-1 flex overflow-x-auto">
                  {viewTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      className={`flex min-w-max items-center gap-2 rounded-md px-4 py-3 text-sm font-black transition-colors ${
                        activeView === tab.id
                          ? 'bg-gray-950 text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>

                {activeView === 'command' && (
                  <div className="space-y-5">
                    <CampaignScorecard health={health} result={result} platformCounts={platformCounts} />
                    <AutomationHub
                      campaignId={activeCampaign?.id}
                      schedule={schedule}
                      tasks={automationTasks}
                      variants={variants}
                      utmLinks={utmLinks}
                      onCopyBrief={handleCopyBrief}
                    />
                    {copiedBrief && (
                      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-800">
                        Approval brief copied.
                      </p>
                    )}
                  </div>
                )}

                {activeView === 'posts' && (
                  <div className="space-y-5">
                    <section className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <FaFilter className="text-teal-700 text-xl" />
                        <span className="font-black text-gray-900 text-lg">Filter Posts</span>
                        <div className="flex flex-wrap gap-3">
                          {['All', 'Instagram', 'LinkedIn', 'X'].map((platform) => (
                            <button
                              key={platform}
                              onClick={() => setFilterPlatform(platform)}
                              className={`px-5 py-2 rounded-lg font-black transition-all ${
                                filterPlatform === platform
                                  ? 'bg-gray-950 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <FaLayerGroup className="text-teal-700" />
                        <h2 className="text-2xl font-black text-gray-950">Generated Posts</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {filteredPosts.map((post, index) => (
                          <PostCard
                            key={`${post.platform}-${index}`}
                            post={post}
                            scheduleSlot={findScheduleSlot(post)}
                          />
                        ))}
                      </div>
                    </section>

                    {filteredPosts.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No posts found for selected platform.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeView === 'brand' && <BrandProfileCard brandProfile={result.brand_profile} />}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
