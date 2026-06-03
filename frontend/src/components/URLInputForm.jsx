import React, { useState } from 'react';
import { FaBolt, FaBuilding, FaBullseye, FaGlobe, FaImage, FaPaperPlane, FaPenNib, FaUsers } from 'react-icons/fa';

const examples = [
  'Launch offer: 20% off first month',
  'Primary buyer: founder-led teams',
  'Proof point: saves 6 hours per week',
];

const campaignGoals = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'retention', label: 'Retention' },
  { value: 'launch', label: 'Launch' },
];

const audienceStages = [
  { value: 'cold', label: 'Cold' },
  { value: 'warm', label: 'Warm' },
  { value: 'customers', label: 'Customers' },
];

const URLInputForm = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [tonePreset, setTonePreset] = useState('auto');
  const [fallbackText, setFallbackText] = useState('');
  const [imageProvider, setImageProvider] = useState('hybrid');
  const [campaignGoal, setCampaignGoal] = useState('conversion');
  const [audienceStage, setAudienceStage] = useState('warm');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url, tonePreset, fallbackText, imageProvider, { campaignGoal, audienceStage });
    }
  };

  const addExample = (example) => {
    setFallbackText((current) => {
      const next = current.trim() ? `${current.trim()}\n${example}` : example;
      return next.slice(0, 4000);
    });
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-5 md:p-6 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-7">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-teal-50 text-teal-800 px-3 py-1 text-sm font-black mb-3">
            <FaBolt />
            Campaign builder
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-950 tracking-normal">Build a launch-ready campaign</h2>
          <p className="text-gray-600 mt-2 max-w-2xl text-sm md:text-base">
            Website, strategy notes, visuals, tracking, scheduling, and handoff in one workflow.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center min-w-full md:min-w-[330px]">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="font-black text-gray-950">1</p>
            <p className="text-xs text-gray-500">Brand brief</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="font-black text-gray-950">2</p>
            <p className="text-xs text-gray-500">Creative</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="font-black text-gray-950">3</p>
            <p className="text-xs text-gray-500">Automate</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4">
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

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] gap-4">
          <div>
            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <FaBullseye className="text-teal-700" />
              Campaign Goal
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-gray-100 p-1">
              {campaignGoals.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setCampaignGoal(goal.value)}
                  className={`rounded-md px-3 py-2 text-sm font-black transition-all ${
                    campaignGoal === goal.value
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-950'
                  }`}
                  disabled={loading}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <FaUsers className="text-teal-700" />
              Audience Stage
            </span>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1">
              {audienceStages.map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() => setAudienceStage(stage.value)}
                  className={`rounded-md px-3 py-2 text-sm font-black transition-all ${
                    audienceStage === stage.value
                      ? 'bg-white text-gray-950 shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-950'
                  }`}
                  disabled={loading}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <FaPenNib className="text-teal-700" />
            Brand Notes
          </span>
          <textarea
            value={fallbackText}
            onChange={(e) => setFallbackText(e.target.value)}
            placeholder="Offer, geography, proof points, pricing, objections, seasonal angle, or campaign theme."
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
            className="inline-flex items-center justify-center gap-2 bg-gray-950 hover:bg-gray-800 text-white font-black py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-base"
          >
            <FaPaperPlane />
            {loading ? 'Generating campaign' : 'Generate Campaign'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default URLInputForm;
