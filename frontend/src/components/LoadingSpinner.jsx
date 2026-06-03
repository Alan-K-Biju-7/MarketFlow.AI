import React from 'react';
import { FaBrain, FaImage, FaPenNib, FaSearch } from 'react-icons/fa';

const steps = [
  ['Research', <FaSearch />],
  ['Brand', <FaBrain />],
  ['Creative', <FaPenNib />],
  ['Assets', <FaImage />],
];

const LoadingSpinner = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="relative h-20 w-20 shrink-0">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-teal-700 border-t-transparent animate-spin"></div>
          <div className="absolute inset-4 rounded-full bg-amber-50 border border-amber-200"></div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase text-teal-700">Building campaign system</p>
          <h2 className="text-2xl font-black text-gray-950 mt-1">Research, copy, visuals, and automation are being assembled.</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {steps.map(([label, icon]) => (
              <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="text-teal-700">{icon}</div>
                <p className="font-black text-gray-900 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoadingSpinner;
