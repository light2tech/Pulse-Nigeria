import React, { useState, useEffect } from 'react';
import { PastQuestionPaper, UserProfile, CbtLaunchConfig } from '../types';
import { usePlatform } from '../lib/realtimeStore';
import { BookmarkButton } from './BookmarkButton';

interface PastQuestionViewerModalProps {
  paper: PastQuestionPaper;
  currentUser: UserProfile | null;
  onClose: () => void;
  onLaunchSubjectCbt: (config: CbtLaunchConfig) => void;
  isSaved: boolean;
  onToggleBookmark: () => void;
}

export const PastQuestionViewerModal: React.FC<PastQuestionViewerModalProps> = ({
  paper,
  currentUser,
  onClose,
  onLaunchSubjectCbt,
  isSaved,
  onToggleBookmark,
}) => {
  const { recordMaterialRead } = usePlatform();
  const [revealAllAnswers, setRevealAllAnswers] = useState(false);
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});
  const [selectedOptionMap, setSelectedOptionMap] = useState<Record<string, number>>({});
  const [activeSubView, setActiveSubView] = useState<'questions' | 'document'>(
    paper.items.length === 0 && paper.attachment?.fileUrl ? 'document' : 'questions'
  );

  useEffect(() => {
    recordMaterialRead({
      userId: currentUser?.id,
      userName: currentUser?.name,
      materialTitle: `${paper.examBody} ${paper.examYear}: ${paper.title}`,
      subject: paper.subject,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const toggleRevealItem = (id: string) => {
    setRevealedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isPdf = paper.attachment?.mimeType?.includes('pdf');
  const isImage = paper.attachment?.mimeType?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-xl max-w-4xl w-full border border-zinc-800 max-h-[90vh] flex flex-col font-body text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-start gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-1.5">
              <span className="text-emerald-400 font-semibold">{paper.subject}</span>
              <span aria-hidden="true">·</span>
              <span className="text-zinc-200 font-medium">
                {paper.examBody} {paper.examYear}
              </span>
              <span aria-hidden="true">·</span>
              <span>{paper.paperType}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{paper.items.length} Q&amp;A item(s)</span>
            </div>
            <h2 className="font-headline text-xl font-bold text-white">{paper.title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <BookmarkButton isSaved={isSaved} onToggle={onToggleBookmark} size="sm" />
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 cursor-pointer shrink-0"
              aria-label="Close past questions viewer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {paper.items.length > 0 && (
              <button
                onClick={() => setActiveSubView('questions')}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                  activeSubView === 'questions'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                Questions &amp; Answers ({paper.items.length})
              </button>
            )}
            {paper.attachment?.fileUrl && (
              <button
                onClick={() => setActiveSubView('document')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer ${
                  activeSubView === 'document'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">attach_file</span>
                <span>Attached Paper ({paper.attachment.fileName})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {activeSubView === 'questions' && paper.items.length > 0 && (
              <button
                onClick={() => setRevealAllAnswers((prev) => !prev)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-200 font-medium cursor-pointer"
              >
                {revealAllAnswers ? 'Hide All Answers (Self-Test)' : 'Show All Answers & Schemes'}
              </button>
            )}

            {paper.attachment?.fileUrl && (
              <a
                href={paper.attachment.fileUrl}
                download={paper.attachment.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-emerald-400 font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download File</span>
              </a>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-5">
          {paper.summary && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 leading-relaxed">
              <span className="font-semibold text-white">Paper Overview: </span>
              {paper.summary}
            </div>
          )}

          {activeSubView === 'document' && paper.attachment?.fileUrl ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              {isPdf ? (
                <iframe
                  src={paper.attachment.fileUrl}
                  title={paper.attachment.fileName}
                  className="w-full h-[60vh] border-0"
                />
              ) : isImage ? (
                <div className="p-4 flex justify-center">
                  <img
                    src={paper.attachment.fileUrl}
                    alt={paper.attachment.fileName}
                    referrerPolicy="no-referrer"
                    className="max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="p-10 text-center space-y-3">
                  <span className="material-symbols-outlined text-3xl text-emerald-400">
                    description
                  </span>
                  <div className="text-sm font-semibold text-white">
                    {paper.attachment.fileName}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Download the attached past question document using the link below.
                  </p>
                  <a
                    href={paper.attachment.fileUrl}
                    download={paper.attachment.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-zinc-950 font-semibold text-xs rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Download {paper.attachment.fileName}</span>
                  </a>
                </div>
              )}
            </div>
          ) : paper.items.length === 0 ? (
            <div className="p-10 text-center text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-xl">
              No structured Q&amp;A items recorded in this entry. Check the attached paper file if uploaded.
            </div>
          ) : (
            <div className="space-y-4">
              {paper.items.map((item, idx) => {
                const isRevealed = revealAllAnswers || Boolean(revealedMap[item.id]);
                const userSelected = selectedOptionMap[item.id];
                const hasOptions = Array.isArray(item.options) && item.options.length >= 2;

                return (
                  <div
                    key={item.id}
                    className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded tabular-nums shrink-0">
                          Q{item.questionNumber || idx + 1}
                        </span>
                        <div className="text-sm text-zinc-100 leading-relaxed whitespace-pre-line">
                          {item.question}
                        </div>
                      </div>
                    </div>

                    {hasOptions && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-0 sm:pl-11">
                        {item.options!.map((opt, oIdx) => {
                          const isPicked = userSelected === oIdx;
                          const isCorrectOption = item.correctOptionIndex === oIdx;
                          let borderStyle = 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-200';

                          if (isRevealed || userSelected !== undefined) {
                            if (isCorrectOption) {
                              borderStyle = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200';
                            } else if (isPicked && !isCorrectOption) {
                              borderStyle = 'border-red-500/60 bg-red-500/10 text-red-200';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                setSelectedOptionMap((prev) => ({ ...prev, [item.id]: oIdx }));
                                setRevealedMap((prev) => ({ ...prev, [item.id]: true }));
                              }}
                              className={`px-3.5 py-2.5 rounded-lg border text-left text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${borderStyle}`}
                            >
                              <span className="font-mono font-semibold text-zinc-400 shrink-0">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="pl-0 sm:pl-11 pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleRevealItem(item.id)}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isRevealed ? 'visibility_off' : 'visibility'}
                        </span>
                        <span>
                          {isRevealed ? 'Hide Answer & Scheme' : 'Reveal Official Answer & Marking Scheme'}
                        </span>
                      </button>
                    </div>

                    {isRevealed && (
                      <div className="ml-0 sm:ml-11 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-emerald-300">Official Answer: </span>
                          <span className="text-zinc-100 whitespace-pre-line">{item.answer}</span>
                        </div>
                        {item.explanation && (
                          <div className="pt-2 border-t border-emerald-500/20 text-zinc-300 whitespace-pre-line">
                            <span className="font-semibold text-zinc-200">Explanation / Working: </span>
                            {item.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/70 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-zinc-400">
            {paper.examBody} {paper.examYear} · Published {paper.dateAdded}
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-zinc-800 bg-zinc-900 text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-800 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onLaunchSubjectCbt({
                  mode: 'subject',
                  subject: paper.subject,
                });
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">timer</span>
              <span>Practice {paper.subject} CBT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
