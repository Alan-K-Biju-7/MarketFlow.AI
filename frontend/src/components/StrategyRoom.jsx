import React from 'react';
import { FaChartLine, FaExclamationTriangle, FaFlask, FaProjectDiagram, FaRoute, FaShieldAlt } from 'react-icons/fa';

const iconMap = {
  pillars: <FaProjectDiagram />,
  hooks: <FaRoute />,
  kpis: <FaChartLine />,
  experiments: <FaFlask />,
  risks: <FaShieldAlt />,
};

const ListPanel = ({ title, icon, items = [], tone = 'gray' }) => {
  const toneClasses = {
    gray: 'text-gray-700 bg-gray-50',
    teal: 'text-teal-800 bg-teal-50',
    amber: 'text-amber-800 bg-amber-50',
    red: 'text-red-800 bg-red-50',
    blue: 'text-blue-800 bg-blue-50',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${toneClasses[tone]}`}>
        {icon}
      </div>
      <h3 className="mt-4 font-black text-gray-950">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-md bg-gray-50 p-3 text-sm font-bold text-gray-700">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
};

const StrategyRoom = ({ plan }) => {
  if (!plan) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 border-b border-gray-200">
        <p className="text-xs font-black uppercase text-teal-700">Strategy room</p>
        <div className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-950">{plan.campaign_name}</h2>
            <p className="text-gray-600 mt-2 leading-relaxed">{plan.positioning_statement}</p>
          </div>
          <div className="rounded-lg bg-gray-950 p-4 text-white">
            <p className="text-xs font-black uppercase text-gray-400">Primary angle</p>
            <p className="mt-2 font-black">{plan.primary_angle}</p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="mt-1 shrink-0 text-amber-700" />
            <div>
              <p className="text-xs font-black uppercase text-amber-800">Audience insight</p>
              <p className="mt-1 font-bold text-amber-950">{plan.audience_insight}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 mt-5">
          <ListPanel title="Content Pillars" icon={iconMap.pillars} items={plan.content_pillars} tone="teal" />
          <ListPanel title="Offer Hooks" icon={iconMap.hooks} items={plan.offer_hooks} tone="blue" />
          <ListPanel title="KPIs" icon={iconMap.kpis} items={plan.kpis} tone="gray" />
          <ListPanel title="Experiments" icon={iconMap.experiments} items={plan.experiments} tone="amber" />
          <ListPanel title="Risk Checks" icon={iconMap.risks} items={plan.risk_checks} tone="red" />
          <ListPanel title="Automation Playbook" icon={<FaRoute />} items={plan.automation_playbook} tone="teal" />
        </div>

        <div className="mt-5 rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-950 px-4 py-3 text-white">
            <h3 className="font-black">Funnel Map</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {plan.funnel_stages.map((stage) => (
              <div key={stage.stage} className="grid gap-4 p-4 lg:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <p className="text-xs font-black uppercase text-gray-500">Stage</p>
                  <p className="font-black text-teal-700">{stage.stage}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-500">Objective</p>
                  <p className="text-sm font-bold text-gray-800">{stage.objective}</p>
                  <p className="text-sm text-gray-600 mt-2">{stage.message}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-500">Automation</p>
                  <p className="text-sm font-bold text-gray-800">{stage.asset}</p>
                  <p className="text-sm text-gray-600 mt-2">{stage.automation_trigger}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategyRoom;
