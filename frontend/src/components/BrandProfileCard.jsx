import React from 'react';
import { FaBuilding, FaBullseye, FaTag, FaPalette, FaQuoteLeft } from 'react-icons/fa';

const BrandProfileCard = ({ brandProfile }) => {
  // Approximate friendly name from hex when LLM didn't provide a name
  function approxNameFromHex(hex) {
    if (!hex) return '';
    const m = hex.replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(m)) return '';
    const r = parseInt(m.slice(0,2), 16);
    const g = parseInt(m.slice(2,4), 16);
    const b = parseInt(m.slice(4,6), 16);
    // Grayscale
    if (r === g && g === b) {
      if (r > 230) return 'White';
      if (r > 180) return 'Light Gray';
      if (r > 100) return 'Gray';
      if (r > 40) return 'Dark Gray';
      return 'Black';
    }
    // Find dominant channel
    if (r > g && r > b) {
      if (r > 200 && g < 100 && b < 120) return 'Red';
      if (g > 150 && b < 100) return 'Olive';
      return 'Red';
    }
    if (g > r && g > b) {
      if (g > 200) return 'Lime';
      return 'Green';
    }
    if (b > r && b > g) {
      if (b > 200) return 'Blue';
      return 'Blue';
    }
    return '';
  }

  // Normalize color entries which may be strings ("#rrggbb" or "red")
  // or objects returned by LLMs like { name: 'Red', hex: '#ff0000' }
  const parseColor = (color) => {
    if (!color && color !== 0) return { value: '', label: '' };

    // If it's already a string, try to make it a valid hex or keep the name
    if (typeof color === 'string') {
      let c = color.trim();
      // If value looks like 6 hex chars without '#', add it
      if (/^[0-9A-Fa-f]{6}$/.test(c)) c = `#${c}`;
      return { value: c, label: c };
    }

    // If it's an object, prefer common keys
    if (typeof color === 'object') {
      const hex = color.hex || color.hex_code || color.value || color.code || color.color;
      const name = color.name || color.label || '';
      if (hex) {
        let v = String(hex).trim();
        if (/^[0-9A-Fa-f]{6}$/.test(v)) v = `#${v}`;
        const label = name || approxNameFromHex(v) || v;
        return { value: v, label };
      }
      const label = name || JSON.stringify(color);
      return { value: label, label };
    }

    return { value: String(color), label: String(color) };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
        <div className="flex items-center">
        <div className="bg-gray-950 p-3 rounded-lg mr-4">
          <FaBuilding className="text-white text-2xl" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-950">{brandProfile.brand_name}</h2>
          <span className="inline-block mt-2 bg-teal-50 text-teal-800 text-sm font-bold px-4 py-1 rounded-full">
            {brandProfile.tone}
          </span>
        </div>
        </div>
        <div className="grid grid-cols-3 gap-2 min-w-full md:min-w-[320px]">
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs font-bold text-gray-500 uppercase">Offers</p>
            <p className="text-xl font-black">{brandProfile.products_services.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs font-bold text-gray-500 uppercase">Audiences</p>
            <p className="text-xl font-black">{brandProfile.target_audience.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs font-bold text-gray-500 uppercase">Keywords</p>
            <p className="text-xl font-black">{brandProfile.keywords.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-teal-700">
        <div className="flex items-start">
          <FaQuoteLeft className="text-teal-700 text-xl mr-3 mt-1" />
          <p className="text-gray-700 leading-relaxed font-medium">{brandProfile.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center mb-3">
            <FaTag className="text-teal-700 mr-2" />
            <h3 className="font-black text-gray-950">Products & Services</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandProfile.products_services.map((item, index) => (
              <span key={index} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-md font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-3">
            <FaBullseye className="text-blue-700 mr-2" />
            <h3 className="font-black text-gray-950">Target Audience</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandProfile.target_audience.map((audience, index) => (
              <span key={index} className="bg-blue-50 text-blue-800 text-sm px-3 py-1 rounded-md font-bold">
                {audience}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <FaPalette className="text-teal-700 mr-2" />
          <h3 className="font-black text-gray-950">Brand Colors</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {brandProfile.colors.map((color, index) => {
            const { value, label } = parseColor(color);
            return (
              <div key={index} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <div
                  className="w-8 h-8 rounded-md border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: value || 'transparent' }}
                ></div>
                <span className="text-sm font-mono text-gray-600">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrandProfileCard;
