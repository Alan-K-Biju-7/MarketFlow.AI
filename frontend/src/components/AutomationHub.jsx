import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCheck,
  FaClipboardCheck,
  FaCopy,
  FaExternalLinkAlt,
  FaFlask,
  FaLink,
  FaTasks,
} from 'react-icons/fa';

const tabs = [
  { id: 'queue', label: 'Launch Queue', icon: <FaCalendarAlt /> },
  { id: 'tasks', label: 'Checklist', icon: <FaTasks /> },
  { id: 'tracking', label: 'Tracking', icon: <FaLink /> },
  { id: 'variants', label: 'Variants', icon: <FaFlask /> },
];

const AutomationHub = ({ campaignId, schedule, tasks, variants, utmLinks, onCopyBrief }) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [completedTasks, setCompletedTasks] = useState({});
  const [copied, setCopied] = useState('');

  const storageKey = useMemo(() => `marketflow_task_state_${campaignId || 'draft'}`, [campaignId]);

  useEffect(() => {
    try {
      setCompletedTasks(JSON.parse(localStorage.getItem(storageKey)) || {});
    } catch {
      setCompletedTasks({});
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completedTasks));
  }, [completedTasks, storageKey]);

  const copyText = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 1600);
  };

  const completion = tasks.length
    ? Math.round((tasks.filter((task) => completedTasks[task.id]).length / tasks.length) * 100)
    : 0;

  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 border-b border-gray-200 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-black text-sm uppercase">
            <FaClipboardCheck />
            Automation desk
          </div>
          <h2 className="text-2xl font-black text-gray-950 mt-1">Launch operations</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCopyBrief}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-black text-white hover:bg-gray-800"
          >
            <FaCopy />
            Copy Brief
          </button>
          <div className="rounded-lg border border-gray-200 px-4 py-2">
            <p className="text-xs font-black uppercase text-gray-500">Checklist</p>
            <p className="text-lg font-black text-gray-950">{completion}% complete</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-black transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-950 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-950'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 md:p-6">
        {activeTab === 'queue' && (
          <div className="space-y-3">
            {schedule.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[160px_120px_minmax(0,1fr)_auto] md:items-center">
                <div>
                  <p className="text-xs font-black uppercase text-gray-500">Slot</p>
                  <p className="font-black text-gray-950">{item.slot}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-500">Channel</p>
                  <p className="font-black text-teal-700">{item.platform}</p>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{item.caption}</p>
                <button
                  onClick={() => copyText(`queue-${index}`, `${item.slot}\n${item.platform}\n${item.caption}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-200"
                >
                  {copied === `queue-${index}` ? <FaCheck /> : <FaCopy />}
                  {copied === `queue-${index}` ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasks.map((task) => (
              <label key={task.id} className="flex cursor-pointer gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={Boolean(completedTasks[task.id])}
                  onChange={(event) =>
                    setCompletedTasks((current) => ({ ...current, [task.id]: event.target.checked }))
                  }
                  className="mt-1 h-5 w-5 accent-teal-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="font-black text-gray-950">{task.title}</p>
                    <span className="text-xs font-black uppercase text-gray-500">
                      {task.owner} · {task.due}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.detail}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-3">
            {utmLinks.length === 0 ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-600">
                Add a valid website URL to generate tracking links.
              </p>
            ) : (
              utmLinks.map((link) => (
                <div key={link.platform} className="grid gap-3 rounded-lg border border-gray-200 p-4 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-center">
                  <p className="font-black text-teal-700">{link.platform}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm font-bold text-gray-700 hover:text-gray-950"
                  >
                    {link.url}
                  </a>
                  <button
                    onClick={() => copyText(`utm-${link.platform}`, link.url)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-3 py-2 text-sm font-bold text-white hover:bg-gray-800"
                  >
                    {copied === `utm-${link.platform}` ? <FaCheck /> : <FaExternalLinkAlt />}
                    {copied === `utm-${link.platform}` ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'variants' && (
          <div className="grid gap-4 lg:grid-cols-2">
            {variants.map((variant) => (
              <div key={variant.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="font-black text-gray-950">{variant.platform}</p>
                  <button
                    onClick={() => copyText(`variant-${variant.id}`, variant.variants.join('\n'))}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-xs font-black text-gray-800 hover:bg-gray-200"
                  >
                    {copied === `variant-${variant.id}` ? <FaCheck /> : <FaCopy />}
                    {copied === `variant-${variant.id}` ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-700">{variant.primary}</p>
                <div className="mt-3 space-y-2">
                  {variant.variants.map((item) => (
                    <p key={item} className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AutomationHub;
