import React, { useMemo, useState } from 'react';
import { STANDARD_CURRICULUM_SUBJECTS } from '../lib/subjectCatalog';

interface SubjectPickerFieldProps {
  label?: string;
  value: string;
  onChange: (subject: string) => void;
  existingSubjects: string[];
  helperText?: string;
}

export const SubjectPickerField: React.FC<SubjectPickerFieldProps> = ({
  label = 'Subject (Select or type ANY subject)',
  value,
  onChange,
  existingSubjects,
  helperText,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allSubjects = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of existingSubjects) {
      const clean = s.trim();
      if (clean) map.set(clean.toLowerCase(), clean);
    }
    for (const s of STANDARD_CURRICULUM_SUBJECTS) {
      const clean = s.trim();
      if (clean && !map.has(clean.toLowerCase())) {
        map.set(clean.toLowerCase(), clean);
      }
    }
    return Array.from(map.values());
  }, [existingSubjects]);

  const filteredSuggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return allSubjects.slice(0, 14);
    const matches = allSubjects.filter((s) => s.toLowerCase().includes(q));
    return matches.slice(0, 14);
  }, [allSubjects, value]);

  const isExistingInDb = useMemo(() => {
    const clean = value.trim().toLowerCase();
    if (!clean) return false;
    return existingSubjects.some((s) => s.trim().toLowerCase() === clean);
  }, [existingSubjects, value]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="block text-zinc-300 font-medium text-xs">{label}</label>
        {value.trim() && (
          <span className="text-[10px] text-emerald-400">
            {isExistingInDb ? '● Enrolled track' : '+ Auto-creates subject track'}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          required
          value={value}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            window.setTimeout(() => setShowSuggestions(false), 160);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder="Type any subject (e.g. Economics, Government, Further Maths, GST 101...)"
          className="w-full px-3.5 py-2.5 pr-9 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowSuggestions((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
          title="Browse subject list"
        >
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>
      </div>

      {helperText && <p className="text-[11px] text-zinc-500 mt-1">{helperText}</p>}

      {showSuggestions && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl max-h-52 overflow-y-auto custom-scrollbar divide-y divide-zinc-900">
          {value.trim() &&
            !allSubjects.some((s) => s.toLowerCase() === value.trim().toLowerCase()) && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(value.trim());
                  setShowSuggestions(false);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-emerald-400 hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
              >
                <span>Use custom subject: &ldquo;{value.trim()}&rdquo;</span>
                <span className="text-[10px] text-zinc-400">New Track</span>
              </button>
            )}

          {filteredSuggestions.map((subj) => {
            const inDb = existingSubjects.some(
              (s) => s.trim().toLowerCase() === subj.toLowerCase()
            );
            return (
              <button
                key={subj}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(subj);
                  setShowSuggestions(false);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
              >
                <span>{subj}</span>
                <span className="text-[10px] text-zinc-500">
                  {inDb ? 'Active in DB' : 'Curriculum'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
