import React from 'react';
import { FaBullseye, FaChartLine, FaImage, FaRocket, FaShieldAlt } from 'react-icons/fa';

const CampaignScorecard = ({ health, result, platformCounts }) => {
  const posts = result?.posts || [];
  const imageProviderCount = posts.reduce((counts, post) => {
    const provider = post.image_provider?.startsWith('gemini') ? 'Gemini' : post.image_provider || 'No image';
    counts[provider] = (counts[provider] || 0) + 1;
    return counts;
  }, {});

  const metrics = [
    {
      label: 'Posts',
      value: posts.length,
      icon: <FaRocket />,
      accent: 'text-rose-700 bg-rose-50',
    },
    {
      label: 'Channels',
      value: Object.keys(platformCounts).length,
      icon: <FaBullseye />,
      accent: 'text-sky-700 bg-sky-50',
    },
    {
      label: 'High intent',
      value: health.highScoreCount,
      icon: <FaChartLine />,
      accent: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Visual cover',
      value: `${health.imageCoverage}%`,
      icon: <FaImage />,
      accent: 'text-amber-700 bg-amber-50',
    },
  ];

  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="bg-gray-950 text-white p-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-black uppercase text-white">
              <FaShieldAlt />
              {health.label}
            </div>
            <div className="mt-6">
              <p className="text-6xl font-black tracking-normal">{health.score}</p>
              <p className="text-sm font-bold text-gray-300 mt-2">Campaign readiness</p>
            </div>
          </div>
          <div className="mt-8">
            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${Math.min(100, health.score)}%` }}
              />
            </div>
            <p className="text-sm text-gray-300 mt-3">{health.nextAction}</p>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <div className={`h-10 w-10 rounded-md flex items-center justify-center ${metric.accent}`}>
                  {metric.icon}
                </div>
                <p className="text-xs font-black uppercase text-gray-500 mt-4">{metric.label}</p>
                <p className="text-2xl font-black text-gray-950">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-5">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-black uppercase text-gray-500 mb-3">Platform mix</p>
              <div className="space-y-3">
                {Object.entries(platformCounts).map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="w-20 text-sm font-bold text-gray-700">{platform}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-700"
                        style={{ width: `${Math.max(18, (count / posts.length) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-gray-950">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-black uppercase text-gray-500 mb-3">Asset source</p>
              <div className="space-y-3">
                {Object.entries(imageProviderCount).map(([provider, count]) => (
                  <div key={provider} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">{provider}</span>
                    <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-black text-gray-950">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampaignScorecard;
