import React, { useMemo, useState } from 'react';
import './App.css';
import URLInputForm from './components/URLInputForm';
import BrandProfileCard from './components/BrandProfileCard';
import PostCard from './components/PostCard';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeWebsite, downloadCSV, downloadJSON, downloadMarkdown } from './services/api';
import { FaCalendarAlt, FaClock, FaDownload, FaFilter, FaHistory, FaLayerGroup, FaRocket } from 'react-icons/fa';

const historyKey = 'marketflow_campaign_history';

const readHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(historyKey)) || [];
  } catch {
    return [];
  }
};

const writeHistory = (items) => {
  localStorage.setItem(historyKey, JSON.stringify(items.slice(0, 8)));
};

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [campaignHistory, setCampaignHistory] = useState(readHistory);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleSubmit = async (url, tonePreset, fallbackText, imageProvider) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeWebsite(url, tonePreset, fallbackText, imageProvider);
      const campaign = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        url,
        tonePreset,
        fallbackText,
        imageProvider,
        data,
      };
      const nextHistory = [campaign, ...campaignHistory.filter((item) => item.url !== url)];
      setCampaignHistory(nextHistory);
      writeHistory(nextHistory);
      setResult(data);
      setFilterPlatform('All');
    } catch (err) {
      setError(err.message || 'Failed to analyze website. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = result?.posts?.filter((post) =>
    filterPlatform === 'All' || post.platform === filterPlatform
  ) || [];

  const platformCounts = useMemo(() => {
    if (!result) return {};
    return result.posts.reduce((counts, post) => {
      counts[post.platform] = (counts[post.platform] || 0) + 1;
      return counts;
    }, {});
  }, [result]);

  const schedule = useMemo(() => {
    if (!result) return [];
    const slots = ['Monday 9:30 AM', 'Tuesday 12:15 PM', 'Wednesday 5:45 PM', 'Thursday 10:00 AM', 'Friday 3:30 PM'];
    return result.posts.map((post, index) => ({
      slot: slots[index] || `Day ${index + 1}`,
      platform: post.platform,
      caption: post.caption,
    }));
  }, [result]);

  const handleDownloadJSON = () => {
    if (result) downloadJSON(result, `${result.brand_profile.brand_name}_content.json`);
  };

  const handleDownloadCSV = () => {
    if (result) downloadCSV(result);
  };

  const handleDownloadMarkdown = () => {
    if (result) downloadMarkdown(result);
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const text = result.posts
      .map((post) => `${post.platform}\n${post.caption}\n${post.hashtags.join(' ')}\n${post.cta}`)
      .join('\n\n---\n\n');
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1800);
  };

  const loadCampaign = (campaign) => {
    setResult(campaign.data);
    setError(null);
    setFilterPlatform('All');
  };

  const clearHistory = () => {
    setCampaignHistory([]);
    writeHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-950">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-lg bg-gray-950 text-white flex items-center justify-center">
                  <FaRocket />
                </div>
                <span className="text-sm font-bold text-teal-700 uppercase tracking-wide">Campaign workspace</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-normal text-gray-950">MarketFlow AI</h1>
              <p className="text-gray-600 mt-3 text-lg max-w-2xl">
                Turn a website and brand notes into a campaign-ready profile, platform posts, image ideas, exports, and a posting plan.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-full sm:min-w-[420px]">
              <div className="bg-gray-950 text-white rounded-lg p-4">
                <p className="text-xs text-gray-300 font-bold uppercase">Stack</p>
                <p className="text-lg font-black">Vite + FastAPI</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-bold uppercase">Exports</p>
                <p className="text-lg font-black">CSV JSON MD</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-bold uppercase">Images</p>
                <p className="text-lg font-black">AI + stock</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <div className="space-y-6">
            <URLInputForm onSubmit={handleSubmit} loading={loading} />

            {loading && <LoadingSpinner />}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-red-900">Analysis failed</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}
          </div>

          <aside className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaHistory className="text-teal-700" />
                <h2 className="font-black text-gray-900">Campaign History</h2>
              </div>
              {campaignHistory.length > 0 && (
                <button onClick={clearHistory} className="text-xs font-bold text-gray-500 hover:text-red-600">
                  Clear
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {campaignHistory.length === 0 ? (
                <p className="p-5 text-sm text-gray-500">Generated campaigns will appear here for quick review.</p>
              ) : (
                campaignHistory.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => loadCampaign(campaign)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-bold text-gray-900 truncate">{campaign.data.brand_profile.brand_name}</p>
                    <p className="text-xs text-gray-500 truncate">{campaign.url}</p>
                    <p className="text-xs text-teal-700 font-bold mt-1">
                      {new Date(campaign.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>

        {result && !loading && (
          <div className="mt-8 space-y-6">
            <BrandProfileCard brandProfile={result.brand_profile} />

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ['Posts', result.posts.length],
                ['Platforms', Object.keys(platformCounts).length],
                ['High score', result.posts.filter((post) => post.engagement_score_label === 'High').length],
                ['Images', result.posts.filter((post) => post.image_url).length],
              ].map(([label, value]) => (
                <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <p className="text-xs uppercase font-bold text-gray-500">{label}</p>
                  <p className="text-3xl font-black text-gray-950 mt-1">{value}</p>
                </div>
              ))}
            </section>

            <section className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FaDownload className="text-teal-700 text-xl" />
                    <span className="font-black text-gray-900 text-lg">Campaign Handoff</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleCopyAll} className="bg-gray-950 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-bold transition-all">
                      {copiedAll ? 'Copied' : 'Copy All'}
                    </button>
                    <button onClick={handleDownloadMarkdown} className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg font-bold transition-all">
                      Markdown
                    </button>
                    <button onClick={handleDownloadCSV} className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg font-bold transition-all">
                      CSV
                    </button>
                    <button onClick={handleDownloadJSON} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-bold transition-all">
                      JSON
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FaClock className="text-teal-700" />
                  <h3 className="font-black text-gray-900">Best Mix</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(platformCounts).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-gray-700">{platform}</span>
                      <span className="bg-gray-100 text-gray-900 px-2 py-1 rounded-md font-black">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FaCalendarAlt className="text-teal-700" />
                <h3 className="font-black text-gray-900">Suggested Posting Plan</h3>
              </div>
              <div className="grid md:grid-cols-5 gap-3">
                {schedule.map((item, index) => (
                  <div key={`${item.platform}-${index}`} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs font-black text-teal-700 uppercase">{item.slot}</p>
                    <p className="text-sm font-bold text-gray-900 mt-2">{item.platform}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-3">{item.caption}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <FaFilter className="text-teal-700 text-xl" />
                <span className="font-black text-gray-900 text-lg">Filter Posts</span>
                <div className="flex flex-wrap gap-3">
                  {['All', 'Instagram', 'LinkedIn', 'X'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setFilterPlatform(platform)}
                      className={`px-5 py-2 rounded-lg font-bold transition-all ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPosts.map((post, index) => (
                  <PostCard key={`${post.platform}-${index}`} post={post} scheduleSlot={schedule[index]?.slot} />
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
      </main>
    </div>
  );
}

export default App;
