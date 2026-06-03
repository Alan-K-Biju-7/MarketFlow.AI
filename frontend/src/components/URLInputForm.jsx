import React, { useState } from 'react';
import { FaBolt, FaBuilding, FaGlobe, FaImage, FaPenNib } from 'react-icons/fa';

const examples = [
  'SaaS for busy founders',
  'Local cafe with weekend offers',
  'Agency serving D2C brands',
];

const URLInputForm = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [tonePreset, setTonePreset] = useState('auto');
  const [fallbackText, setFallbackText] = useState('');
  const [imageProvider, setImageProvider] = useState('hybrid');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url, tonePreset, fallbackText, imageProvider);
    }
  };

  const addExample = (example) => {
    setFallbackText((current) => {
      const next = current.trim() ? `${current.trim()}\n${example}` : example;
      return next.slice(0, 4000);
    });
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-6 md:p-7 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-7">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-teal-50 text-teal-800 px-3 py-1 text-sm font-bold mb-3">
            <FaBolt />
            Campaign builder
          </div>
          <h2 className="text-3xl font-black text-gray-950 tracking-normal">Create a content pack</h2>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Add a website, then give the AI the context a website usually misses: offer, audience, geography, tone, and current campaign goal.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center min-w-full md:min-w-[300px]">
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="font-black text-gray-950">Profile</p>
            <p className="text-xs text-gray-500">Brand brief</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="font-black text-gray-950">Posts</p>
            <p className="text-xs text-gray-500">Multi-platform</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="font-black text-gray-950">Assets</p>
            <p className="text-xs text-gray-500">Images</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-[minmax(0,1fr)_220px_220px] gap-4">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <FaGlobe className="text-teal-700" />
              Website URL
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all text-base"
              required
              disabled={loading}
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <FaBuilding className="text-teal-700" />
              Tone
            </span>
            <select
              value={tonePreset}
              onChange={(e) => setTonePreset(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all text-base bg-white"
              disabled={loading}
            >
              <option value="auto">Auto detect</option>
              <option value="startup">Startup</option>
              <option value="cafe">Cafe</option>
              <option value="ngo">NGO</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <FaImage className="text-teal-700" />
              Creative Mode
            </span>
            <select
              value={imageProvider}
              onChange={(e) => setImageProvider(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all text-base bg-white"
              disabled={loading}
            >
              <option value="hybrid">AI + stock fallback</option>
              <option value="gemini">Gemini AI images</option>
              <option value="pexels">Pexels stock photos</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <FaPenNib className="text-teal-700" />
            Brand Notes
          </span>
          <textarea
            value={fallbackText}
            onChange={(e) => setFallbackText(e.target.value)}
            placeholder="Example: AI SaaS for small business owners. Audience is founders and social media managers. Tone is practical, confident, and modern. Goal is to convert free users into weekly active users."
            className="w-full min-h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all text-base resize-y"
            disabled={loading}
            maxLength={4000}
          />
        </label>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => addExample(example)}
                className="text-sm font-bold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gray-950 hover:bg-gray-800 text-white font-black py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-base"
          >
            {loading ? 'Generating campaign' : 'Generate Campaign'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default URLInputForm;
