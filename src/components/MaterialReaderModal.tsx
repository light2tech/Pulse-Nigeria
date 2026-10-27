import React, { useState, useEffect } from 'react';
import { StudyMaterial, AppView, UserProfile, CbtLaunchConfig, CopilotLaunchRequest } from '../types';
import { usePlatform } from '../lib/realtimeStore';
import { BookmarkButton } from './BookmarkButton';

interface MaterialReaderModalProps {
  material: StudyMaterial;
  currentUser: UserProfile | null;
  onClose: () => void;
  onLaunchSubjectCbt: (config: CbtLaunchConfig) => void;
  setCurrentView: (view: AppView) => void;
  isSaved: boolean;
  onToggleBookmark: () => void;
  onAskCopilot?: (request: CopilotLaunchRequest) => void;
}

export const MaterialReaderModal: React.FC<MaterialReaderModalProps> = ({
  material,
  currentUser,
  onClose,
  onLaunchSubjectCbt,
  isSaved,
  onToggleBookmark,
  onAskCopilot,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'notes' | 'attachment'>('notes');
  const { recordMaterialRead } = usePlatform();

  const pages =
    material.content && material.content.length > 0
      ? material.content
      : [material.summary || 'No chapter notes recorded for this module yet.'];

  useEffect(() => {
    recordMaterialRead({
      userId: currentUser?.id,
      userName: currentUser?.name,
      materialTitle: material.title,
      subject: material.subject,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (viewMode === 'notes') {
        if (e.key === 'ArrowRight') setCurrentPage((p) => Math.min(pages.length - 1, p + 1));
        if (e.key === 'ArrowLeft') setCurrentPage((p) => Math.max(0, p - 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, pages.length, viewMode]);

  const progressPct = Math.round(((currentPage + 1) / pages.length) * 100);
  const hasAttachment = Boolean(material.attachment?.fileUrl);
  const isPdf = material.attachment?.mimeType?.includes('pdf');
  const isImage = material.attachment?.mimeType?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-xl max-w-3xl w-full border border-zinc-800 max-h-[88vh] flex flex-col font-body text-zinc-100 overflow-hidden">
        {/* Top Metadata & Title */}
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
              <span className="text-emerald-400 font-medium">{material.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{material.level}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{material.dateAdded}</span>
            </div>
            <h2 className="font-headline text-xl font-bold text-white">{material.title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <BookmarkButton isSaved={isSaved} onToggle={onToggleBookmark} size="sm" />
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 cursor-pointer"
              aria-label="Close study reader"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Optional Attachment Switcher */}
        {hasAttachment && (
          <div className="px-6 py-2.5 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('notes')}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                  viewMode === 'notes'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}
              >
                Reading Notes ({pages.length})
              </button>
              <button
                onClick={() => setViewMode('attachment')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'attachment'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}
              >
                <span className="material-symbols-outlined text-sm">attach_file</span>
                <span>Attached File ({material.attachment?.fileName})</span>
              </button>
            </div>

            <a
              href={material.attachment?.fileUrl}
              download={material.attachment?.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Download Material</span>
            </a>
          </div>
        )}

        {/* Reading Progress Bar */}
        {viewMode === 'notes' && (
          <div className="w-full h-1 bg-zinc-950">
            <div
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Structured Chapter Content or Attached Document */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
          {viewMode === 'attachment' && material.attachment?.fileUrl ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              {isPdf ? (
                <iframe
                  src={material.attachment.fileUrl}
                  title={material.attachment.fileName}
                  className="w-full h-[56vh] border-0"
                />
              ) : isImage ? (
                <div className="p-4 flex justify-center">
                  <img
                    src={material.attachment.fileUrl}
                    alt={material.attachment.fileName}
                    referrerPolicy="no-referrer"
                    className="max-h-[56vh] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="p-10 text-center space-y-3">
                  <span className="material-symbols-outlined text-3xl text-emerald-400">
                    description
                  </span>
                  <div className="text-sm font-semibold text-white">
                    {material.attachment.fileName}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Click below to download and read this study document.
                  </p>
                  <a
                    href={material.attachment.fileUrl}
                    download={material.attachment.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-zinc-950 font-semibold text-xs rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Download {material.attachment.fileName}</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              {onAskCopilot && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="material-symbols-outlined text-emerald-400 text-base">
                      auto_awesome
                    </span>
                    <span className="text-zinc-300">
                      Need help understanding this chapter? Ask{' '}
                      <strong className="text-white font-semibold">Study Copilot</strong> to break it down.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onAskCopilot({
                          context: {
                            type: 'material',
                            subject: material.subject,
                            materialId: material.id,
                            materialTitle: material.title,
                            materialLevel: material.level,
                            materialSummary: material.summary,
                            sectionIndex: currentPage,
                            totalSections: pages.length,
                            currentSectionContent: pages[currentPage],
                            fullNoteContent: pages,
                          },
                          autoPrompt: `Explain Section ${currentPage + 1} of "${material.title}" clearly step-by-step with simple examples and key JAMB/WAEC takeaways.`,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      <span>Explain This Section</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onAskCopilot({
                          context: {
                            type: 'material',
                            subject: material.subject,
                            materialId: material.id,
                            materialTitle: material.title,
                            materialLevel: material.level,
                            materialSummary: material.summary,
                            sectionIndex: currentPage,
                            totalSections: pages.length,
                            currentSectionContent: pages[currentPage],
                            fullNoteContent: pages,
                          },
                          autoPrompt: `Summarize "${material.title}" into high-yield revision bullet points and test me with 3 JAMB standard practice questions.`,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-emerald-400">quiz</span>
                      <span>Summarize &amp; Quiz Me</span>
                    </button>
                  </div>
                </div>
              )}

              <article className="bg-zinc-950 p-6 rounded-xl border border-zinc-800/90 text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {pages[currentPage]}
              </article>

              {material.summary && pages[currentPage] !== material.summary && (
                <div className="border-t border-zinc-800 pt-4 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Syllabus Scope: </span>
                  {material.summary}
                </div>
              )}
            </>
          )}
        </div>

        {/* Reader Controls */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            {viewMode === 'notes' ? (
              <>
                <span className="tabular-nums">
                  Section {currentPage + 1} of {pages.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    className="px-2.5 py-1 border border-zinc-800 bg-zinc-900 rounded-lg text-zinc-300 disabled:opacity-35 hover:bg-zinc-800 cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage >= pages.length - 1}
                    onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
                    className="px-2.5 py-1 border border-zinc-800 bg-zinc-900 rounded-lg text-zinc-300 disabled:opacity-35 hover:bg-zinc-800 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <span>{material.attachment?.fileName}</span>
            )}
          </div>

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
                  subject: material.subject,
                });
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">timer</span>
              <span>Practice {material.subject} CBT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
