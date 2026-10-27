import React, { useEffect } from 'react';
import { CopilotLaunchRequest, UserProfile } from '../types';
import { StudyCopilotPanel } from './StudyCopilotPanel';

interface StudyCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  weakestSubject?: string | null;
  launchRequest?: CopilotLaunchRequest | null;
  onConsumeLaunchRequest?: () => void;
}

export const StudyCopilotDrawer: React.FC<StudyCopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  weakestSubject,
  launchRequest,
  onConsumeLaunchRequest,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-xs">
      <div
        className="flex-1 hidden sm:block"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="w-full sm:max-w-lg md:max-w-xl h-full p-2 sm:p-3 bg-zinc-950/95 border-l border-zinc-800 shadow-2xl flex flex-col">
        <StudyCopilotPanel
          currentUser={currentUser}
          weakestSubject={weakestSubject}
          launchRequest={launchRequest}
          onConsumeLaunchRequest={onConsumeLaunchRequest}
          compact
          onClose={onClose}
        />
      </div>
    </div>
  );
};
