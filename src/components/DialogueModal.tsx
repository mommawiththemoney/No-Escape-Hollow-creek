import React from 'react';
import { NpcDialogueLine } from '../game/types';

interface DialogueModalProps {
  open: boolean;
  lines: NpcDialogueLine[];
  lineIndex: number;
  onAdvance: (choiceIndex?: number) => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  open,
  lines,
  lineIndex,
  onAdvance,
  onClose,
}) => {
  if (!open || lines.length === 0) return null;
  const current = lines[Math.min(lineIndex, lines.length - 1)];
  const hasChoices = current.choices && current.choices.length > 0;
  const isLast = lineIndex >= lines.length - 1 && !hasChoices;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4 bg-[rgba(6,8,12,0.72)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogue-speaker"
      data-testid="dialogue-modal"
    >
      <div className="w-full max-w-xl bg-[#141a22] border-2 border-[#d49b4b] rounded-xl p-5 sm:p-6 shadow-[0_14px_36px_rgba(0,0,0,0.78)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#d49b4b]">
              {current.role}
            </div>
            <h2
              id="dialogue-speaker"
              className="font-display text-2xl sm:text-3xl font-bold text-[#f3eee4] mt-0.5"
            >
              {current.speaker}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Dialogue"
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#343e4d] text-[#c9d1dd] hover:bg-[#1e2632] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm sm:text-base text-[#e3e7ee] leading-relaxed">
          {current.text}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {hasChoices ? (
            current.choices!.map((choice, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onAdvance(idx)}
                className="min-h-[44px] w-full px-4 py-2.5 bg-[#1b232e] hover:bg-[#273344] text-[#f2ede2] text-sm font-semibold rounded-lg border border-[#49576c] text-left flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>{choice.label}</span>
                <span className="text-[#d49b4b] text-xs font-bold">→</span>
              </button>
            ))
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                data-testid="dialogue-continue"
                onClick={() => (isLast ? onClose() : onAdvance())}
                className="min-h-[44px] px-5 py-2.5 bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] font-semibold text-sm rounded-lg border-2 border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer whitespace-nowrap"
              >
                {isLast ? 'Begin Investigation [E]' : 'Continue [E]'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
