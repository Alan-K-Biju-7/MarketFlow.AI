import React, { useState } from 'react';
import {
  FaCalendarAlt,
  FaCheck,
  FaCopy,
  FaExternalLinkAlt,
  FaHashtag,
  FaInstagram,
  FaLinkedin,
  FaRegClock,
  FaTwitter,
} from 'react-icons/fa';

const PostCard = ({ post, scheduleSlot }) => {
  const [copied, setCopied] = useState('');

  const platformConfig = {
    Instagram: {
      icon: <FaInstagram />,
      accent: 'text-pink-700',
      border: 'border-pink-200',
      label: 'Visual story',
    },
    LinkedIn: {
      icon: <FaLinkedin />,
      accent: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Professional angle',
    },
    X: {
      icon: <FaTwitter />,
      accent: 'text-sky-700',
      border: 'border-sky-200',
      label: 'Fast hook',
    },
  };

  const config = platformConfig[post.platform] || {
    icon: null,
    accent: 'text-gray-700',
    border: 'border-gray-200',
    label: 'Social post',
  };

  const getScoreBadgeColor = () => {
    switch (post.engagement_score_label) {
      case 'High':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyText = async (type, text) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 1800);
  };

  const fullPost = `${post.caption}\n\n${post.hashtags.join(' ')}\n\n${post.cta}`;
  const headline = post.caption.split(/[.!?]/)[0];
  const characterCount = post.caption.length;
  const imageProvider = post.image_provider?.startsWith('gemini')
    ? 'Gemini AI'
    : post.image_provider === 'pexels'
      ? 'Pexels'
      : post.image_provider === 'placeholder'
        ? 'Fallback'
        : null;

  return (
    <article className={`bg-white rounded-lg shadow-sm border ${config.border} overflow-hidden flex flex-col`}>
      {post.image_url && (
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={post.image_url}
            alt={`${post.platform} campaign visual`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
            <p className="text-white text-lg font-black leading-tight drop-shadow">{headline}</p>
          </div>
          {imageProvider && (
            <div className="absolute left-3 top-3 rounded-md bg-white/95 px-3 py-1 text-xs font-black text-gray-900 shadow-sm">
              {imageProvider}
            </div>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className={`flex items-center gap-2 ${config.accent}`}>
              <span className="text-xl">{config.icon}</span>
              <span className="font-black text-gray-950">{post.platform}</span>
            </div>
            <p className="text-xs text-gray-500 font-bold mt-1">{config.label}</p>
          </div>

          <span className={`text-xs font-black px-3 py-1 rounded-full border ${getScoreBadgeColor()}`}>
            {post.engagement_score_label}
          </span>
        </div>

        {scheduleSlot && (
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-50 rounded-md px-3 py-2 mb-4">
            <FaCalendarAlt />
            {scheduleSlot}
          </div>
        )}

        <p className="text-gray-700 leading-relaxed text-sm flex-1">{post.caption}</p>

        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="rounded-md bg-gray-50 border border-gray-100 p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
              <FaRegClock />
              Length
            </div>
            <p className="text-lg font-black text-gray-950">{characterCount}</p>
          </div>
          <div className="rounded-md bg-gray-50 border border-gray-100 p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
              <FaHashtag />
              Tags
            </div>
            <p className="text-lg font-black text-gray-950">{post.hashtags.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.hashtags.map((hashtag, index) => (
            <button
              key={index}
              onClick={() => copyText('hashtags', post.hashtags.join(' '))}
              className="text-teal-700 bg-teal-50 hover:bg-teal-100 text-xs font-bold px-2 py-1 rounded-md"
            >
              {hashtag}
            </button>
          ))}
        </div>

        <div className="rounded-md border border-gray-200 p-3 mb-4">
          <p className="text-xs uppercase font-bold text-gray-500">Call to action</p>
          <p className="font-black text-gray-950">{post.cta}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => copyText('post', fullPost)}
            className="flex items-center gap-2 bg-gray-950 hover:bg-gray-800 text-white px-3 py-2 rounded-md transition-all font-bold text-sm"
          >
            {copied === 'post' ? <FaCheck /> : <FaCopy />}
            {copied === 'post' ? 'Copied' : 'Copy Post'}
          </button>

          <button
            onClick={() => copyText('caption', post.caption)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md transition-all font-bold text-sm"
          >
            Caption
          </button>

          {post.image_url && (
            <a
              href={post.image_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-950 text-sm font-bold px-2 py-2"
            >
              <FaExternalLinkAlt />
              Image
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
