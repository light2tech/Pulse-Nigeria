import React from 'react';

interface BookmarkButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
  labelSaved?: string;
  labelUnsaved?: string;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isSaved,
  onToggle,
  size = 'sm',
  labelSaved = 'Saved',
  labelUnsaved = 'Save',
  className = '',
}) => {
  const sizeStyles =
    size === 'md'
      ? 'px-3.5 py-2 text-xs gap-1.5 min-h-[38px]'
      : 'px-2.5 py-1.5 text-xs gap-1.5 min-h-[34px]';

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from Saved Resources' : 'Save to Saved Resources'}
      title={isSaved ? 'Saved in your Dashboard — click to remove' : 'Bookmark to Saved Resources'}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`inline-flex items-center justify-center rounded-lg border font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${sizeStyles} ${
        isSaved
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
      } ${className}`}
    >
      <span
        className={`material-symbols-outlined text-[16px] leading-none ${
          isSaved ? 'text-emerald-400' : 'text-zinc-400'
        }`}
        style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
      >
        bookmark
      </span>
      <span>{isSaved ? labelSaved : labelUnsaved}</span>
    </button>
  );
};
